import { Logger } from '@nestjs/common';
import { dormir } from './dormir';

/**
 * Estados que vale la pena reintentar. Ninguno es culpa nuestra ni se arregla
 * mandando otra cosa: son transitorios y lo único que corresponde es esperar.
 *
 * - 429: nos pasamos del rate limit. El free tier permite 100 requests por
 *   minuto por modelo.
 * - 503: el modelo está sobrecargado del lado de Google. Pasa seguido con los
 *   modelos nuevos en horario pico.
 */
const TRANSITORIOS = [429, 503];

const REINTENTOS = 4;

/** Espera base. Se multiplica por el número de intento (backoff lineal). */
const ESPERA_BASE_MS = 4000;

/**
 * `fetch` que reintenta ante fallas transitorias.
 *
 * Trabajar contra una API de IA no es como trabajar contra tu propia base: los
 * 429 y los 503 son parte del funcionamiento normal, no excepciones raras. Un
 * pipeline que no los contempla anda en tu máquina y se cae en la demo.
 *
 * Cualquier otro estado —un 400 por body inválido, un 404 por modelo
 * inexistente, un 403 por API key mala— se devuelve tal cual: reintentarlos
 * sería perder el tiempo, porque van a fallar igual.
 */
export async function fetchConReintento(
  url: string,
  init: RequestInit,
  logger: Logger,
): Promise<Response> {
  let res!: Response;

  for (let intento = 1; intento <= REINTENTOS; intento++) {
    res = await fetch(url, init);

    if (!TRANSITORIOS.includes(res.status) || intento === REINTENTOS) break;

    const espera = ESPERA_BASE_MS * intento;
    logger.warn(
      `Gemini respondió ${res.status} (transitorio). ` +
        `Reintento ${intento}/${REINTENTOS - 1} en ${espera / 1000}s...`,
    );
    await dormir(espera);
  }

  return res;
}
