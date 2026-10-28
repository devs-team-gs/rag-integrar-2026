import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { Pool } from 'pg';
import { chunkear } from './chunking';
import { PG_POOL } from './database.provider';
import { dormir } from './dormir';
import { EmbeddingsService } from './embeddings.service';

/**
 * Pausa entre requests.
 *
 * El free tier de Gemini NO es sólo un tope diario: son **100 requests por
 * minuto** por modelo (`EmbedContentRequestsPerMinutePerUserPerProjectPerModel`).
 * 60000 / 100 = 600ms como mínimo absoluto entre llamadas; usamos 700 para
 * dejar margen.
 *
 * Con 100ms —que es lo que parece razonable a primera vista— vas a 600 por
 * minuto y Gemini te corta con un 429 alrededor del chunk 100.
 */
const PAUSA_MS = 700;

@Injectable()
export class IngestService {
  private readonly logger = new Logger(IngestService.name);

  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    private readonly embeddings: EmbeddingsService,
    private readonly config: ConfigService,
  ) {}

  async ingestar(): Promise<void> {
    const dir = resolve(this.config.get<string>('APUNTES_DIR', './corpus'));
    const archivos = (await readdir(dir)).filter((f) => f.endsWith('.md'));

    if (archivos.length === 0) {
      this.logger.warn(
        `No hay archivos .md en ${dir}. No hay nada que indexar.`,
      );
      return;
    }

    // Reindexamos desde cero. Para un corpus chico es lo más simple y evita
    // duplicados. Con miles de documentos harías updates incrementales,
    // guardando un hash por archivo y reindexando sólo los que cambiaron.
    try {
      await this.pool.query('TRUNCATE chunks RESTART IDENTITY');
    } catch {
      throw new Error(
        'No pude vaciar la tabla `chunks`. ¿Aplicaste schema.sql?\n' +
          '  docker exec -i rag-postgres psql -U rag -d rag < schema.sql',
      );
    }

    let total = 0;

    for (const archivo of archivos) {
      const markdown = await readFile(join(dir, archivo), 'utf-8');
      const chunks = chunkear(markdown);
      this.logger.log(`${archivo} → ${chunks.length} chunks`);

      for (const chunk of chunks) {
        // Enriquecemos el texto ANTES de embeberlo: que el vector "sepa" de qué
        // archivo y sección viene mejora bastante los resultados y sale gratis.
        // Ojo: lo que se guarda en `contenido` es el texto original, no esto.
        const paraEmbeber = `Documento: ${archivo}\nSección: ${chunk.seccion}\n\n${chunk.contenido}`;
        const vector = await this.embeddings.embeber(
          paraEmbeber,
          'search result',
        );

        await this.pool.query(
          `INSERT INTO chunks (fuente, seccion, contenido, embedding)
           VALUES ($1, $2, $3, $4)`,
          // pgvector recibe el array como string: '[0.1,0.2,...]'
          [archivo, chunk.seccion, chunk.contenido, JSON.stringify(vector)],
        );

        total++;
        await dormir(PAUSA_MS);
      }
    }

    this.logger.log(
      `Listo: ${total} chunks indexados desde ${archivos.length} archivos.`,
    );
  }
}
