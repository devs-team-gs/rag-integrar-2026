/**
 * Todo lo que puede cambiar cuando Google renombra un modelo vive acá.
 * Si algo empieza a devolver 404, se toca este archivo y nada más.
 * Lista actualizada: https://ai.google.dev/gemini-api/docs/models
 */
export const GEMINI_BASE_URL =
  'https://generativelanguage.googleapis.com/v1beta/models';

export const MODELO_EMBEDDING = 'gemini-embedding-2';

/**
 * Modelo de generación.
 *
 * Vale 3.6 y no 3.7 por un motivo medido, no por gusto: al 25/08/2026,
 * `gemini-3.7-flash` devolvía 503 (UNAVAILABLE, "high demand") de forma
 * consistente con prompts del tamaño que arma este RAG (~7000 caracteres),
 * mientras contestaba 200 a prompts cortos. `gemini-3.6-flash` respondía 200
 * con el mismo prompt grande.
 *
 * O sea: el modelo más nuevo no es automáticamente el mejor para tu caso. Lo
 * que importa es cuál aguanta TU carga, y eso se mide, no se supone.
 *
 * Si 3.7 se estabiliza, cambiar esta línea y nada más.
 */
export const MODELO_CHAT = 'gemini-3.5-flash';

/**
 * 768 y no 3072 (el default de Gemini) porque el índice HNSW de pgvector sobre
 * el tipo `vector` sólo soporta hasta 2000 dimensiones. Es un buen ejemplo de
 * cómo las piezas del stack se condicionan entre sí: un límite del índice de
 * Postgres termina decidiendo un parámetro del request al modelo.
 *
 * Este número tiene que coincidir con el `vector(768)` de schema.sql.
 */
export const DIMENSIONES = 768;
