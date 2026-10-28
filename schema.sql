-- pgvector no viene activado por default: hay que pedirlo por base de datos.
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS chunks (
  id         SERIAL PRIMARY KEY,
  fuente     TEXT NOT NULL,        -- de qué archivo salió → para poder citar
  seccion    TEXT,                 -- el header ## bajo el que estaba → contexto
  contenido  TEXT NOT NULL,        -- el texto original → es lo que va al LLM
  embedding  vector(768) NOT NULL, -- el vector → es lo que se busca
  creado_en  TIMESTAMPTZ DEFAULT now()
);

-- El operador de este índice (vector_cosine_ops) TIENE que coincidir con el que
-- usa la query (<=>). Si no coinciden, Postgres ignora el índice en silencio:
-- no hay error, no hay warning, sólo se vuelve lento.
CREATE INDEX IF NOT EXISTS chunks_embedding_idx
  ON chunks USING hnsw (embedding vector_cosine_ops);
