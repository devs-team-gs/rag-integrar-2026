# Mini-suite de evaluación

Esto es lo que separa "armé un RAG" de "tengo un RAG que anda".

**Un RAG son dos sistemas** — el que busca y el que redacta — y fallan por causas
distintas. Si los medís juntos, no sabés dónde tocar. Por eso son dos métricas
separadas, no una.

| Métrica | Cómo se calcula | Qué te dice |
| ------- | --------------- | ----------- |
| **Recall del retriever** | De las 10 primeras, ¿en cuántas el archivo esperado apareció entre los 5 chunks recuperados? | Si esto es bajo, el problema es **el chunking o los embeddings**. No toques el prompt. |
| **Tasa de invención** | De las 3 últimas, ¿en cuántas inventó en vez de decir "No encontré eso en los apuntes."? | Si esto es mayor que cero, el problema es **el prompt**. |

**Objetivo**: recall ≥ 7/10, invención 0/3.

---

## Corrida de referencia (25/08/2026)

Los casilleros de abajo están en blanco a propósito: son para que los complete cada
alumno. Esta tabla es la corrida del docente, para saber qué esperar.

Corpus de 8 clases, 176 chunks, `gemini-embedding-2` a 768 dimensiones.

| # | Tipo | Esperado | Recuperado (top-1) | Sim. | ✔ |
| - | ---- | -------- | ------------------ | ---- | - |
| 1 | semántica | clase1 | clase1 → Conceptos clave | 0.747 | ✅ |
| 2 | semántica | clase2 | clase2 → Flexbox / Grid en top-5 | 0.741 | ✅ |
| 3 | semántica | clase3 | clase3 → Template Literals | 0.711 | ✅ |
| 4 | semántica | clase4 | clase4 → Object.groupBy() | 0.754 | ✅ |
| 5 | semántica | clase6 | clase6 → Cuándo NO usar un MCP | 0.660 | ✅ |
| 6 | semántica | clase7 | clase7 → DQL: consultar con SELECT | 0.696 | ✅ |
| 7 | semántica | clase8 | clase8 → Clave Foránea (FK) | 0.728 | ✅ |
| 8 | control | clase6 | clase6 → Cómo se conecta un MCP | 0.829 | ✅ |
| 9 | control | clase7 | clase7 → DDL: crear la estructura | 0.738 | ✅ |
| 10 | control | clase8 | clase8 → [BONUS] Índices | 0.745 | ✅ |

**Recall: 10/10.**

| # | Fuera de corpus | Similitud del top-1 | Respondió | ✔ |
| - | --------------- | ------------------- | --------- | - |
| 11 | capital de Mongolia | 0.571 | "No encontré eso en los apuntes." | ✅ |
| 12 | git rebase | 0.703 | "No encontré eso en los apuntes." | ✅ |
| 13 | Object.freeze | 0.694 | "No encontré eso en los apuntes." | ✅ |

**Tasa de invención: 0/3.**

### Dos cosas para mirar en esta tabla

**La similitud no te dice si la respuesta está.** Comparalas: la pregunta 13, que
**no** tiene respuesta en los apuntes, sacó 0.694 — más alto que las preguntas 5 y 6,
que **sí** la tienen. El retriever siempre devuelve los 5 más parecidos que haya; que
sean parecidos no significa que sirvan. Por eso el "no encontré eso" tiene que salir
del prompt y no de un umbral de similitud.

**Los controles puntúan más alto, y está bien.** La 8 sacó 0.829 porque comparte el
vocabulario literal del apunte. Las semánticas andan entre 0.66 y 0.75 — más bajo,
pero igual de acertadas. Ese es el punto: el sistema encuentra por significado aunque
las palabras no coincidan.

## Cómo correrlas

```bash
curl -s -X POST localhost:3000/ask \
  -H 'Content-Type: application/json' \
  -d '{"pregunta":"..."}' | jq
```

El campo `chunks` te da el recall sin adivinar: si el archivo esperado está en la
lista, contá un acierto. El campo `respuesta` te da la tasa de invención.

> 🔑 **Mirá `chunks` ANTES que `respuesta`.** Si el retriever trajo el archivo
> equivocado, no tiene sentido evaluar lo que redactó: le pasaste el material
> equivocado. Primero se arregla lo que busca, después lo que escribe.

---

## Dentro del corpus (10)

Siete están redactadas **sin usar el vocabulario del apunte** — ahí es donde se
demuestra la búsqueda semántica. Tres reutilizan los términos literales a propósito:
son el **control**. Si las literales aciertan y las semánticas fallan, el sistema
está haciendo coincidencia de palabras, no búsqueda por significado.

### 1. Git — semántica

> Estoy a la mitad de una tarea que todavía no quiero confirmar y me piden arreglar
> algo urgente en otra parte del proyecto. ¿Cómo dejo lo mío en pausa sin perderlo y
> lo retomo después?

- **Esperado**: `clase1_git-github.md` → *Conceptos clave*
- **Respuesta**: `git stash` guarda los cambios no commiteados y deja el working
  directory limpio; `git stash pop` los recupera.
- **Por qué sirve**: la pregunta no dice "stash", "guardar" ni "temporal". Un
  `LIKE '%stash%'` devuelve cero filas.
- [ ] ¿Recuperó?

### 2. CSS — semántica

> Quiero una galería de tarjetas que sola acomode más o menos por fila según lo ancha
> que sea la pantalla, sin tener que escribir una regla distinta para cada tamaño de
> dispositivo. ¿Se puede?

- **Esperado**: `clase2_css-moderno.md` → *CSS Grid*
- **Respuesta**: `grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))`, sin
  media queries.
- **Por qué sirve**: no aparecen "grid", "repeat", "minmax", "auto-fit" ni
  "responsive" en la pregunta.
- [ ] ¿Recuperó?

### 3. JavaScript — semántica

> ¿Hay alguna forma de armar un texto que mezcle frases fijas con lo que tienen mis
> variables adentro, sin andar pegando pedazos con el signo de más?

- **Esperado**: `clase3_javascript.md` → *Template Literals*
- **Respuesta**: los template literals, con backticks e interpolación `${...}`.
- **Por qué sirve**: no dice "template", "literal", "backtick" ni "concatenar".
- [ ] ¿Recuperó?

### 4. Arrays — semántica

> Tengo una lista de artículos y necesito separarlos en montoncitos según a qué rubro
> pertenece cada uno. ¿Hay algo ya hecho para eso o me lo tengo que armar a mano con
> un `if`?

- **Esperado**: `clase4_array-objectos.md` → *El nuevo Object.groupBy() (ES2024)*
- **Respuesta**: `Object.groupBy(items, x => x.category)` agrupa según la clave que
  devuelve el callback y devuelve un objeto. Evita el `reduce` con `if` y `push`.
- **Por qué sirve**: "montoncitos" y "rubro" no están en el apunte, que dice
  "agrupar" y "categoría".
- [ ] ¿Recuperó?

### 5. MCP — semántica

> Si dejo enchufadas un montón de conexiones al mismo tiempo aunque no las esté
> usando, ¿me trae algún problema?

- **Esperado**: `clase6_mcp.md` → *Cuándo NO usar un MCP*
- **Respuesta**: sí, *context bloat*: cada servidor conectado mete la descripción de
  todas sus tools en el contexto en cada mensaje, así que gastás contexto antes de
  escribir nada y el modelo elige peor entre tantas herramientas.
- **Por qué sirve**: evita "MCP", "servidor", "tools", "contexto" y "context bloat".
  Es probablemente la más difícil de las diez.
- [ ] ¿Recuperó?

### 6. SQL — semántica

> Cuando el usuario escribe el nombre todo junto en minúscula no le aparece ningún
> resultado, aunque el registro existe cargado con mayúscula inicial. ¿Cómo hago para
> que no importe cómo lo escriba?

- **Esperado**: `clase7_sql.md` → *DQL: consultar con SELECT*
- **Respuesta**: `LIKE` distingue mayúsculas; `ILIKE` (de Postgres) no.
  Ej.: `WHERE title ILIKE '%rayuela%'`.
- **Por qué sirve**: no nombra `LIKE`, `ILIKE`, patrón ni comodín. `ILIKE` aparece 5
  veces en clase7 y 0 en clase8, así que el target es inequívoco.
- [ ] ¿Recuperó?

### 7. SQL JOIN — semántica

> Si doy de baja a un usuario del sistema, ¿qué pasa con todo lo que él había cargado?
> ¿La base se lo lleva puesto sola, me frena, o puedo decidirlo yo?

- **Esperado**: `clase8_sql-join.md` → *Clave Foránea (FK)*
- **Respuesta**: lo definís en la FK con `ON DELETE`: `RESTRICT` frena el borrado,
  `CASCADE` borra las filas hijas, `SET NULL` las deja huérfanas.
- **Por qué sirve**: no dice `ON DELETE`, `CASCADE`, `FOREIGN KEY` ni "integridad
  referencial". `ON DELETE` aparece 14 veces en clase8 y 0 en clase7.
- [ ] ¿Recuperó?

### 8. MCP — literal (control)

> ¿Qué scope tengo que usar cuando agrego un MCP en Claude Code para que lo tenga todo
> el equipo al clonar el repo?

- **Esperado**: `clase6_mcp.md` → *Cómo se conecta un MCP a un agente*
- **Respuesta**: el scope `project` (`-s project`), que guarda el server en el
  `.mcp.json` commiteado. Nunca commitear tokens ahí: usar `${VAR}`.
- **Por qué sirve**: reutiliza "scope", "MCP", "Claude Code" y "repo". Si esta falla,
  el problema no es semántico — es que algo del indexado está roto.
- [ ] ¿Recuperó?

### 9. SQL — literal (control)

> ¿Qué diferencia hay entre `DROP TABLE` y `TRUNCATE TABLE`?

- **Esperado**: `clase7_sql.md` → *DDL: crear la estructura*
- **Respuesta**: `DROP` borra la tabla entera (estructura + datos); `TRUNCATE` borra
  todas las filas y deja la tabla vacía. Ninguno pregunta ni tiene vuelta atrás.
- **Por qué sirve**: `TRUNCATE` aparece 4 veces en clase7 y 0 en clase8.
- [ ] ¿Recuperó?

### 10. SQL JOIN — literal (control)

> ¿Por qué conviene crear índices sobre las claves foráneas y cómo compruebo si
> Postgres está usando el índice?

- **Esperado**: `clase8_sql-join.md` → *[BONUS] Índices*
- **Respuesta**: `PRIMARY KEY` y `UNIQUE` crean su índice solos, las FK **no**, y son
  las que más lo necesitan porque se usan en cada `JOIN`. Se comprueba con
  `EXPLAIN ANALYZE`: `Seq Scan` (no lo usó) vs `Index Scan` (lo usó).
- **Por qué sirve**: `EXPLAIN` sólo existe en clase8.
- [ ] ¿Recuperó?

**Recall del retriever: ___ / 10**

---

## Fuera del corpus (3)

Las tres tienen que devolver exactamente *"No encontré eso en los apuntes."*

La primera es el caso fácil. **Las otras dos son las que importan**: hablan de temas
que suenan a la materia, así que el retriever va a traer chunks con similitud alta —
pero equivocados. Ahí se ve si el prompt aguanta o si el modelo completa con lo que
sabe de entrenamiento.

### 11. Trivia — el caso fácil

> ¿Cuál es la capital de Mongolia?

- [ ] ¿Inventó?

> 🛑 Si contesta "Ulán Bator", el RAG está roto **aunque la respuesta sea correcta**.
> Y si lo hace con geografía, lo va a hacer con una pregunta técnica donde no lo vas
> a poder detectar.

### 12. Git — suena a la clase 1

> ¿Cómo hago un rebase de mi rama sobre main para tener un historial lineal en vez de
> un commit de merge?

- **Verificado**: `rebase` y `cherry-pick` dan **0 apariciones en todo el corpus**.
  La clase 1 cubre integración de ramas sólo con `git merge`, y deshacer con `revert`
  y `reset`.
- [ ] ¿Inventó?

### 13. JavaScript — suena a la clase 4

> ¿Cómo hago para que un objeto quede bloqueado y nadie le pueda cambiar las
> propiedades después de creado?

- **Verificado**: `freeze`, `Object.seal` y `defineProperty` dan **0 apariciones en
  todo el corpus**. Pero "inmutable" y `toSorted` aparecen 4 veces en clase4.
- **Por qué es la más traicionera de las tres**: el retriever va a traer la sección de
  *métodos que NO modifican el original* con similitud alta, porque comparte todo el
  campo semántico (objeto, modificar, propiedades, copia). Sólo que es un concepto
  distinto: esos métodos evitan mutar, no congelan nada. Es exactamente el escenario
  donde un RAG mal calibrado alucina algo plausible a partir de contexto vecino.
- [ ] ¿Inventó?

**Tasa de invención: ___ / 3**

---

## Notas sobre este corpus

Cosas que salieron al preparar las preguntas y que conviene saber antes de leer los
resultados.

### `clase5_objetos.md` quedó fuera de la evaluación

No es un olvido. Su contenido está en buena medida repetido en
`clase4_array-objectos.md` (mismo ejemplo `class Pet`, mismos temas de objetos
literales y constructores). **Cualquier pregunta sobre esos temas es ambigua por
construcción**: si el retriever devuelve clase4 en vez de clase5, no está fallando —
las dos son respuestas válidas.

Y ese es el punto que vale la pena marcar en clase: **no se puede medir el recall
sobre un corpus con documentos duplicados.** Antes de evaluar un RAG hay que mirar si
el corpus permite que la métrica signifique algo.

### El corpus tiene defectos que van a aparecer en las respuestas

- `clase6_mcp.md`, líneas 568-577: un bloque **repetido literalmente dos veces**, con
  palabras fusionadas (*"requierervidores"*, *"gestioneautenticación"*). Si un chunk
  de ahí se recupera, la respuesta va a salir incoherente — y no va a ser culpa del
  modelo.
- `clase5_objetos.md`: código incompleto (`const myCat = OBJETO LITERAL`, `CÓDIGO`) y
  `reurn` en vez de `return`, dos veces.

> 🔑 **Basura entra, basura sale, y el RAG no te avisa.** Ninguno de estos defectos
> lanza un error: se convierten en vectores igual que el buen contenido. Revisar el
> corpus es parte del trabajo, no un paso previo opcional.

### El espacio que no era un espacio

Preparando estas preguntas busqué la sección `## Conceptos clave` de
`clase1_git-github.md` con un `grep` y **no la encontró**. La sección existe, está en
la línea 83, se ve perfecta en pantalla.

Mirando los bytes crudos apareció el motivo: entre "Conceptos" y "clave" no hay un
espacio, hay un **U+00A0**, un espacio duro. Se ve idéntico y no es el mismo carácter.

Vale la pena detenerse acá, porque resume la clase entera:

| | Resultado |
| --- | --- |
| `LIKE '%Conceptos clave%'` | **0 filas.** Un carácter invisible lo tiró abajo. |
| Búsqueda por embeddings | **Ni se entera.** El significado no cambió. |

Esa es la diferencia entre buscar por texto y buscar por significado, y acá no es un
ejemplo de laboratorio: es un archivo real del corpus, que llegó así de copiar y
pegar desde algún editor.

### Los nombres de archivo no coinciden con las clases

`clase2_css-moderno.md` dice adentro "Clase 04", `clase3_javascript.md` dice
"Clase 05", `clase4_array-objectos.md` dice "Clase 06". Como el sistema cita por
nombre de archivo, va a decir "según clase2_css-moderno.md" cuando el apunte se llama
Clase 04. Renombrar los archivos y reindexar lo arregla.

---

## Ejercicio: el chunk que no debería existir

Después de indexar, corré esto:

```sql
SELECT fuente, seccion, LENGTH(contenido) AS largo
FROM chunks
ORDER BY largo DESC
LIMIT 5;
```

Vas a encontrar un chunk de **2179 caracteres**. Pero en `src/rag/chunking.ts` la
constante dice `MAX_CARACTERES = 1500`.

**Encontrá por qué**, sin correr nada: la respuesta está en una sola condición del
archivo. Es lectura de código sobre un caso borde, y explica un comportamiento que
podés ver en la base.

> 💡 Cuando lo encuentres, la pregunta que sigue es más interesante: ¿está mal, o está
> bien? Pista: pensá qué pasaría con un bloque de SQL de 2000 caracteres si lo
> partieras al medio para respetar el límite.
