import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { fetchConReintento } from './fetch-con-reintento';
import { DIMENSIONES, GEMINI_BASE_URL, MODELO_EMBEDDING } from './modelos';

/**
 * Qué rol cumple el texto que estamos embebiendo.
 *
 * Un documento que se indexa y una pregunta que se busca son textos de forma
 * muy distinta aunque hablen de lo mismo: el documento afirma, la pregunta
 * interroga. Marcar cuál es cada uno mejora bastante los resultados.
 */
export type TareaEmbedding = 'search result' | 'search query';

/**
 * La forma REAL que devuelve el endpoint REST.
 *
 * OJO con esto, que hace perder tardes enteras: `:embedContent` devuelve
 * `embedding` en SINGULAR. El plural `embeddings` (un array) lo devuelve
 * `:batchEmbedContents`, que es otro endpoint.
 *
 * Los ejemplos de Python y JS de la documentación usan `result.embeddings`
 * porque el SDK normaliza la respuesta antes de dártela. Acá pegamos con
 * `fetch` pelado justamente para ver la API de verdad, así que nos toca la
 * forma de verdad.
 */
interface RespuestaEmbedding {
  embedding?: { values: number[] };
}

@Injectable()
export class EmbeddingsService {
  private readonly logger = new Logger(EmbeddingsService.name);

  constructor(private readonly config: ConfigService) {}

  /**
   * Convierte un texto en un vector de 768 números.
   *
   * Es un POST y nada más. Sin SDK, para que se vea que del otro lado hay una
   * API HTTP común y corriente.
   */
  async embeber(texto: string, tarea: TareaEmbedding): Promise<number[]> {
    const res = await fetchConReintento(
      `${GEMINI_BASE_URL}/${MODELO_EMBEDDING}:embedContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.config.getOrThrow<string>('GEMINI_API_KEY'),
        },
        body: JSON.stringify({
          // gemini-embedding-2 NO tiene el parámetro `taskType` que tenía
          // gemini-embedding-001: la instrucción de tarea va adentro del texto.
          // Si ves tutoriales con `taskType`, son de la versión vieja.
          content: { parts: [{ text: `task: ${tarea} | ${texto}` }] },
          output_dimensionality: DIMENSIONES,
        }),
      },
      this.logger,
    );

    if (!res.ok) {
      throw new Error(
        `Gemini respondió ${res.status} al embeber: ${await res.text()}`,
      );
    }

    const data = (await res.json()) as RespuestaEmbedding;
    const vector = data.embedding?.values;

    // Gemini contestó 200 pero el vector no está donde lo esperamos. Pasa cuando
    // Google cambia la forma de la respuesta o renombra el modelo. Sin esta
    // comprobación el error sería "Cannot read properties of undefined", que no
    // le dice nada a nadie; así al menos nombra el problema y muestra qué llegó.
    if (!vector) {
      throw new Error(
        `Gemini respondió 200 pero sin vector en 'embedding.values'. ` +
          `Claves recibidas: ${Object.keys(data).join(', ')}. ` +
          `Revisá MODELO_EMBEDDING en src/rag/modelos.ts.`,
      );
    }

    return vector;
  }
}
