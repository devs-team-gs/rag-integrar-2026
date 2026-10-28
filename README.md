# Preguntale a tus apuntes

Un RAG sobre los apuntes de la materia, montado sobre Nest. Le preguntás
*"¿cómo cierro sesión en la API?"* y te contesta con el contenido real de las
clases, citando de qué archivo lo sacó.

Sin LangChain, sin LlamaIndex, sin ORM. El objetivo es **ver la maquinaria**.

## Requisitos

1. **Docker** corriendo.
2. **Node LTS + pnpm**.
3. Una **API key de Gemini**, gratis y sin tarjeta:
   - Entrá a [Google AI Studio](https://aistudio.google.com/) con tu cuenta de Google.
   - **Get API key** → **Create API key**. Copiala.
   - El free tier son 1.500 requests por día.
4. **TablePlus** (o Adminer) para mirar la base con los ojos.

> ⚠️ **Cada uno necesita su propia key.** Indexar 8 apuntes son 176 requests. Si
> comparten una sola key entre todo el curso, la cuota se agota enseguida.

> 🛑 **El free tier tiene DOS límites, y el que muerde no es el que parece.**
> Además del tope diario (1.500 requests), hay **100 requests por minuto y por
> modelo**. Por eso la ingesta pausa 700ms entre llamadas: 60000/100 = 600ms es el
> mínimo. Con una pausa de 100ms —que parece razonable— vas a 600 por minuto y
> Gemini te corta con un `429` alrededor del chunk 100.

## Puesta en marcha

### 1. Variables de entorno

```bash
cp env.example .env
```

Abrí `.env` y pegá tu key en `GEMINI_API_KEY=`. Lo demás ya viene listo.

Si falta alguna variable, la app **no arranca** y te dice cuál. Es a propósito:
mejor que reviente al inicio y no en medio de una demo.

### 2. La base de datos

```bash
docker compose up -d
```

Es Postgres de siempre, con dos diferencias a propósito:

- La imagen es **`pgvector/pgvector:pg17`**, no `postgres:alpine`. Es Postgres
  normal con la extensión ya compilada adentro. Con la imagen común,
  `CREATE EXTENSION vector` tira `extension "vector" is not available`.
- El puerto en el host es **5433**, no 5432, para poder tener este Postgres y el
  de la API de auth levantados al mismo tiempo.

### 3. El schema

```bash
docker exec -i rag-postgres psql -U rag -d rag < schema.sql
```

**Para TablePlus**: host `localhost`, puerto `5433`, user `rag`, password
`rag_dev`, base `rag`.

> 💡 Andá a TablePlus y mirá la tabla vacía. Fijate el tipo de la columna
> `embedding`. Es un tipo de dato de Postgres como cualquier otro — no hay una
> "base vectorial" separada en ningún lado.

### 4. Indexar

```bash
pnpm ingest
```

Lee todos los `.md` de `corpus/`, los corta en chunks, los embebe y los guarda.
Con los 8 apuntes actuales salen 176 chunks y tarda unos 3 minutos — el tiempo se
lo lleva casi todo la pausa entre requests, no el trabajo.

> 🛑 **Este es el paso que se olvida.** Cada vez que edites un apunte, volvé a
> correr esto. Si no, el RAG sigue viendo la versión vieja y no vas a entender
> por qué. No es un bug: es que la fase de indexación no corrió.

### 5. Levantar la API

```bash
pnpm start:dev
```

## Cómo se usa

```bash
curl -X POST localhost:3000/ask \
  -H 'Content-Type: application/json' \
  -d '{"pregunta":"¿cómo cierro sesión en la API?"}'
```

Devuelve la respuesta **y** los chunks que la generaron:

```json
{
  "respuesta": "Se llama a POST /auth/logout, que pone hashedRefreshToken en null...",
  "chunks": [
    { "fuente": "clase31_auth.md", "seccion": "Logout", "similitud": 0.812 }
  ]
}
```

> 🔑 **Los chunks no son un extra.** Son tu única ventana al 50% del sistema. La
> primera pregunta ante cualquier respuesta mala siempre es *"¿qué le pasaste al
> modelo?"* — no *"¿por qué el modelo dice eso?"*.

## Cómo saber si funciona

No alcanza con "probá a ver". Cuatro pruebas concretas.

### Prueba 1 — Responde bien y cita bien

```bash
curl -X POST localhost:3000/ask -H 'Content-Type: application/json' \
  -d '{"pregunta":"¿cómo cierro sesión en la API?"}'
```

Tiene que citar la clase correcta.

> 🔑 Fijate el detalle que hace toda la clase: **tu pregunta no comparte ni una
> palabra con el texto del apunte** (ahí dice "logout", "hashedRefreshToken",
> "204" — nunca "cerrar sesión"). Un `ILIKE '%cerrar sesión%'` habría devuelto
> cero filas. Eso es la búsqueda semántica funcionando.

### Prueba 2 — Fuera del corpus: tiene que decir que no sabe

```bash
curl -X POST localhost:3000/ask -H 'Content-Type: application/json' \
  -d '{"pregunta":"¿cuál es la capital de Mongolia?"}'
```

Tiene que responder exactamente *"No encontré eso en los apuntes."*

> 🛑 Si te contesta "Ulán Bator", **tu RAG está roto** aunque la respuesta sea
> correcta. Significa que el modelo está usando su conocimiento de entrenamiento
> en vez del contexto — y si lo hace con geografía, lo va a hacer con una
> pregunta técnica donde no lo vas a poder detectar.
>
> El arreglo está en el prompt, no en el retriever.

### Prueba 3 — Mirá los vectores con tus ojos

En TablePlus:

```sql
-- ¿Cuántos chunks hay y de dónde salieron?
SELECT fuente, COUNT(*) FROM chunks GROUP BY fuente ORDER BY 2 DESC;

-- Mirá un vector de verdad
SELECT contenido, LEFT(embedding::text, 80) AS primeros_valores
FROM chunks LIMIT 1;

-- Similitud a mano: agarrá el chunk #1 y buscá sus vecinos.
-- Es exactamente lo que hace el RAG, pero sin ninguna capa de IA en el medio.
SELECT fuente,
       seccion,
       1 - (embedding <=> (SELECT embedding FROM chunks WHERE id = 1)) AS similitud
FROM chunks
WHERE id <> 1
ORDER BY 3 DESC
LIMIT 5;
```

> 💡 La última query es la que hace caer la ficha: **la "búsqueda semántica" es
> un `ORDER BY`.** No hay ningún modelo corriendo ahí. Los vectores ya estaban
> calculados, y comparar vectores es aritmética.

### Prueba 4 — El índice

```sql
EXPLAIN ANALYZE
SELECT contenido FROM chunks
ORDER BY embedding <=> (SELECT embedding FROM chunks WHERE id = 1)
LIMIT 5;
```

**Con 176 chunks te va a decir `Seq Scan`, y eso NO significa que el índice esté
roto.** Postgres calcula el costo de las dos opciones y con una tabla así de chica
leerla entera le sale más barato que bajar por el índice (costo ~40 contra ~365).
El optimizador está haciendo lo correcto.

Para comprobar que el índice **puede** usarse, forzalo:

```sql
SET enable_seqscan = off;
EXPLAIN SELECT contenido FROM chunks
ORDER BY embedding <=> (SELECT embedding FROM chunks WHERE id = 1) LIMIT 5;
SET enable_seqscan = on;
```

Ahí sí tiene que aparecer `Index Scan using chunks_embedding_idx`.

> 🔑 Esta es la distinción que vale la clase: **que un índice exista no significa que
> se use, y que no se use no significa que esté mal.** Quien decide es el planificador,
> según el costo. Un RAG con millones de chunks elegiría el índice solo.

Y ahora sí, el error silencioso de verdad. Creá el índice con el operador equivocado:

```sql
DROP INDEX chunks_embedding_idx;
CREATE INDEX chunks_embedding_idx ON chunks USING hnsw (embedding vector_l2_ops);

SET enable_seqscan = off;   -- forzamos: aun así no lo va a poder usar
EXPLAIN SELECT contenido FROM chunks
ORDER BY embedding <=> (SELECT embedding FROM chunks WHERE id = 1) LIMIT 5;
```

Sigue en `Seq Scan` **aunque lo fuerces**, y sin un solo error ni warning. Ese es el
caso grave: el índice es inservible para esta query porque `vector_l2_ops` no le sirve
al operador `<=>`.

Fijate el costo que muestra: `10000000000.00`. Esa cifra absurda es la penalización
que Postgres se auto-aplica cuando le desactivaste el `Seq Scan` pero igual no tiene
otra opción. Es la confesión de que no le quedaba alternativa.

Restauralo:

```sql
DROP INDEX chunks_embedding_idx;
CREATE INDEX chunks_embedding_idx ON chunks USING hnsw (embedding vector_cosine_ops);
SET enable_seqscan = on;
```

## Estructura

```
src/
├── ingest.ts                    entrypoint CLI (Nest sin servidor HTTP)
└── rag/
    ├── modelos.ts               constantes de Gemini y dimensiones
    ├── chunking.ts              función pura: markdown → chunks
    ├── embeddings.service.ts    el POST a Gemini
    ├── database.provider.ts     el Pool de pg
    ├── rag.service.ts           buscar() + responder()
    ├── ingest.service.ts        corpus → chunks → embeddings → insert
    ├── rag.controller.ts        POST /ask
    └── dto/ask.dto.ts
```

## Para el docente

Indexar en vivo son ~500 requests y un minuto largo por alumno. Si preferís no
quemar clase en eso, indexá una vez y repartí el dump:

```bash
# generar
docker exec rag-postgres pg_dump -U rag -d rag > dump.sql

# restaurar (del lado del alumno, con el contenedor levantado)
docker exec -i rag-postgres psql -U rag -d rag < dump.sql
```

Así arrancan directo en la Prueba 1 y la ingesta queda como tarea.

## Si algo falla

| Síntoma | Causa |
| ------- | ----- |
| `extension "vector" is not available` | La imagen de Docker no es `pgvector/pgvector` |
| `column cannot have more than 2000 dimensions` | `DIMENSIONES` en `src/rag/modelos.ts` pasa de 2000 |
| `Gemini respondió 404` | Se renombró el modelo. Mirá la [lista](https://ai.google.dev/gemini-api/docs/models) y cambiá `src/rag/modelos.ts` |
| `Gemini respondió 429` | Rate limit. Casi siempre es el de **100 por minuto**, no el diario. El código reintenta solo; si insiste, subí `PAUSA_MS` |
| `Gemini respondió 503` | El modelo está sobrecargado del lado de Google. El código reintenta solo; si insiste, probá otro modelo en `src/rag/modelos.ts` |
| `Cannot read properties of undefined` al embeber | Cambió la forma de la respuesta. `:embedContent` devuelve `embedding` singular; `embeddings` plural es de `:batchEmbedContents` |
| `EXPLAIN` dice `Seq Scan` | Con pocas filas es lo correcto, no un error. Ver Prueba 4 |
| `Faltan variables de entorno` | Falta `cp env.example .env` y pegar la key |
| Responde siempre "no encontré eso" | La tabla está vacía: falta `pnpm ingest` |
| Todo anda pero lento | El índice no se está usando. Prueba 4 |

## Extensiones

1. **Citas numeradas** — que la respuesta diga `[1]`, `[2]`. Es sólo el prompt.
2. **Filtrar por clase** — `WHERE fuente LIKE 'clase3%'` antes del `ORDER BY`.
3. **Hybrid search** — una columna `tsvector` en la misma tabla, las dos
   búsquedas, y fusionás los rankings. Es la mejora con mejor relación
   esfuerzo/beneficio: cubre el punto ciego de los embeddings, que son malos con
   nombres propios y códigos exactos.
4. **Indexación incremental** — hash por archivo, reindexás sólo lo que cambió.
5. **Una UI en Next** — un input, un botón, y las citas linkeadas.
