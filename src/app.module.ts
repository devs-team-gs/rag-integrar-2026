import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RagModule } from './rag/rag.module';

/** Sin estas dos, nada de esto puede funcionar. */
const VARIABLES_REQUERIDAS = ['DATABASE_URL', 'GEMINI_API_KEY'] as const;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Que falle al arrancar y no luego: si falta una variable,
      // el proceso no levanta y el mensaje dice exactamente qué hacer.
      validate: (config: Record<string, unknown>) => {
        const faltantes = VARIABLES_REQUERIDAS.filter((k) => !config[k]);
        if (faltantes.length > 0) {
          throw new Error(
            `Faltan variables de entorno: ${faltantes.join(', ')}.\n` +
            '  Copiá la plantilla y completala:  cp env.example .env',
          );
        }
        return config;
      },
    }),
    RagModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
