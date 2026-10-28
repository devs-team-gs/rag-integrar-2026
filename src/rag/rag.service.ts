import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { PG_POOL } from './database.provider';
import { EmbeddingsService } from './embeddings.service';
import { fetchConReintento } from './fetch-con-reintento';
import { GEMINI_BASE_URL, MODELO_CHAT } from './modelos';

/** Cuántos chunks le pasamos al modelo como contexto. */
const CHUNKS_A_RECUPERAR = 5;

/** Lo que el modelo tiene que contestar cuando el contexto no alcanza. */
export const SIN_RESPUESTA = 'No encontré eso en los apuntes.';

export interface ChunkRecuperado {
  fuente: string;
  seccion: string;
  contenido: string;
  similitud: number;
}

/** Lo que devuelve el endpoint: la respuesta Y de dónde salió. */
export interface RespuestaRag {
  respuesta: string;
  chunks: Omit<ChunkRecuperado, 'contenido'>[];
}

interface RespuestaGeneracion {
  candidates?: { content: { parts: { text: string }[] } }[];
}

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    private readonly embeddings: EmbeddingsService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Fase 1: recuperar.
   *
   * Un RAG son dos sistemas —el que busca y el que redacta— y fallan por causas
   * distintas. Este es el que busca.
   */
  async buscar(pregunta: string): Promise<ChunkRecuperado[]> {
    // La pregunta se embebe con el MISMO modelo y las MISMAS dimensiones que
    // los documentos. Marcada como 'search query', no 'search result'.
    const vector = await this.embeddings.embeber(pregunta, 'search query');

    // Un SELECT ... ORDER BY ... LIMIT de toda la vida. Lo único nuevo es el
    // operador <=>, que es la distancia coseno entre dos vectores.
    // La "búsqueda semántica" es, literalmente, un ORDER BY.
    const { rows } = await this.pool.query<ChunkRecuperado>(
      `SELECT fuente,
              seccion,
              contenido,
              1 - (embedding <=> $1) AS similitud
       FROM chunks
       ORDER BY embedding <=> $1
       LIMIT $2`,
      // pgvector recibe el array como string: '[0.1,0.2,...]'
      [JSON.stringify(vector), CHUNKS_A_RECUPERAR],
    );

    return rows;
  }

  /**
   * Fase 2: generar.
   *
   * El modelo no "sabe" nada de los apuntes: le pegamos los chunks en el prompt
   * y le prohibimos usar otra cosa.
   */
  async responder(
    pregunta: string,
    chunks: ChunkRecuperado[],
  ): Promise<string> {
    const contexto = chunks
      .map((c) => `[Fuente: ${c.fuente} — ${c.seccion}]\n${c.contenido}`)
      .join('\n\n---\n\n');

    const prompt = `Sos un asistente que responde preguntas sobre los apuntes de
la materia Integrar.

Respondé ÚNICAMENTE con la información del contexto que sigue.
Si el contexto no alcanza para responder, decí exactamente:
"${SIN_RESPUESTA}" No inventes ni completes con conocimiento general.
Citá siempre de qué clase sacaste la información.
Escribí en español rioplatense.

<contexto>
${contexto}
</contexto>

Pregunta: ${pregunta}`;

    const res = await fetchConReintento(
      `${GEMINI_BASE_URL}/${MODELO_CHAT}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.config.getOrThrow<string>('GEMINI_API_KEY'),
        },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      },
      this.logger,
    );

    if (!res.ok) {
      throw new Error(
        `Gemini respondió ${res.status} al generar: ${await res.text()}`,
      );
    }

    const data = (await res.json()) as RespuestaGeneracion;
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? SIN_RESPUESTA;
  }

  /** El pipeline completo: recuperar y después generar. */
  async preguntar(pregunta: string): Promise<RespuestaRag> {
    const chunks = await this.buscar(pregunta);

    // Si la tabla está vacía no hay nada que preguntarle al modelo: es que
    // nunca corrió la indexación. Avisamos claro en vez de gastar un request
    // y recibir un "no encontré eso" que confunde más de lo que explica.
    if (chunks.length === 0) {
      this.logger.warn('No hay chunks en la base. ¿Corriste `pnpm ingest`?');
      return { respuesta: SIN_RESPUESTA, chunks: [] };
    }

    // Esto es lo que más sirve para depurar: antes de mirar la respuesta, mirá
    // qué se recuperó. Si el retriever trajo basura, ninguna instrucción en el
    // prompt lo va a arreglar. Por eso el endpoint devuelve los chunks también:
    // sin esa ventana, la mitad del sistema es invisible.
    for (const c of chunks) {
      this.logger.log(`${c.similitud.toFixed(3)}  ${c.fuente} → ${c.seccion}`);
    }

    const respuesta = await this.responder(pregunta, chunks);

    return {
      respuesta,
      // El contenido completo no viaja en la respuesta HTTP: son 5 chunks de
      // hasta 1500 caracteres cada uno y no aportan al cliente.
      chunks: chunks.map(({ fuente, seccion, similitud }) => ({
        fuente,
        seccion,
        similitud,
      })),
    };
  }
}
