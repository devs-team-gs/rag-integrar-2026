import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

/**
 * Token de inyección del pool de Postgres.
 *
 * Usamos `pg` pelado, sin ORM. No es por austeridad: es que el corazón de este
 * proyecto es el operador `<=>` de pgvector, y queremos verlo escrito en el SQL.
 * Un ORM lo escondería detrás de un método y se perdería el punto de la clase.
 */
export const PG_POOL = 'PG_POOL';

export const databaseProvider: Provider = {
  provide: PG_POOL,
  inject: [ConfigService],
  useFactory: (config: ConfigService): Pool =>
    new Pool({ connectionString: config.getOrThrow<string>('DATABASE_URL') }),
};
