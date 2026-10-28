import { Inject, Module, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
import { databaseProvider, PG_POOL } from './database.provider';
import { EmbeddingsService } from './embeddings.service';
import { IngestService } from './ingest.service';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';

@Module({
  controllers: [RagController],
  providers: [databaseProvider, EmbeddingsService, RagService, IngestService],
  exports: [IngestService],
})
export class RagModule implements OnModuleDestroy {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  /**
   * El pool de `pg` no se cierra solo. Sin esto, el script de ingesta termina
   * el trabajo y el proceso se queda colgado con la conexión abierta.
   */
  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
