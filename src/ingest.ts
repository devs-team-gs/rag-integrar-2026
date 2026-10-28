import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IngestService } from './rag/ingest.service';

/**
 * La indexación no es una request HTTP: corre una vez, desde la terminal.
 *
 * `createApplicationContext` levanta el contenedor de Nest SIN servidor HTTP.
 * Misma inyección de dependencias, mismos providers, mismo .env — pero sin
 * controllers escuchando en un puerto. Es el mismo Nest que ya conocen,
 * usado como script.
 */
async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    await app.get(IngestService).ingestar();
  } finally {
    // Cierra el contexto y dispara onModuleDestroy → el pool de pg se cierra.
    await app.close();
  }
}

main().catch((error: unknown) => {
  console.error('❌', error instanceof Error ? error.message : error);
  process.exit(1);
});
