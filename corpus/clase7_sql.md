#sql #postgresql #basededatos #relacional #ddl #dml #dql #docker #backend

## 🗺️ Mapa de la clase

En la [[Clase 24 - Servidores, APIs REST y bases de NestJS|clase anterior]] armamos nuestro
primer backend: un CRUD de `/users` con endpoints, status codes, middlewares y, al final,
lo mismo en NestJS. Funcionaba… hasta que apretabas `Ctrl+C`.

```ts
let users: User[] = [{ id: 1, nombre: 'Gabriel' }];
```

Ese array vive en la **memoria RAM** del proceso de Node. Apagás el servidor y **se
evapora**. Lo reiniciás y volvés a tener un solo usuario. Si mañana levantás dos instancias
de tu API, cada una tiene su propio array y ninguna sabe de la otra.

> 🔑 **El problema de hoy**: nuestros datos necesitan **sobrevivir** al proceso que los
> creó. Necesitamos **persistencia**. Y no cualquier persistencia: una que sea rápida de
> consultar, que no permita datos incoherentes y que varios clientes puedan usar al mismo
> tiempo. Eso es una **base de datos**.

El plan de hoy:

1. **Qué es una base de datos relacional** y por qué se organiza en tablas.
2. **SQL y PostgreSQL**: el lenguaje y el motor que vamos a usar.
3. **Setup**: levantar Postgres con Docker y conectarnos.
4. **Modelado**: pensar las tablas *antes* de escribirlas.
5. **Los comandos de SQL**, agrupados en familias: **DDL** (crear estructura), **DML**
   (modificar datos) y **DQL** (consultar datos).
6. **Consultar en serio**: `WHERE`, operadores, `LIKE`, `IN`, `BETWEEN`, `NULL`,
   `DISTINCT`, `ORDER BY` y `LIMIT`.

Hoy trabajamos con **una sola tabla por vez**. En la
[[Clase 26 - SQL Relaciones, JOIN y Funciones|próxima clase]] vamos a partir los datos en
varias tablas relacionadas y a volver a juntarlas con `JOIN`.

---

## 🗄️ Bases de datos relacionales

### 🤔 ¿Qué es?

Una **base de datos** es un sistema para **almacenar, organizar y recuperar** información
de manera estructurada. Una base de datos **relacional** es la variante que organiza todo
en **tablas**, y que se apoya en el **modelo relacional** (Edgar Codd, 1970) y en el
**álgebra de conjuntos**.

Tres palabras que vas a escuchar todo el tiempo:

| Concepto              | Qué es                                                    | En la vida real          |
| --------------------- | --------------------------------------------------------- | ------------------------ |
| **Tabla** (relación)  | Un conjunto de datos del mismo tipo                        | "La lista de alumnos"    |
| **Columna** (campo)   | Un **atributo**: tiene nombre y **tipo de dato**           | "email", de tipo texto   |
| **Fila** (registro)   | Una **instancia** concreta: un valor para cada columna     | "Lucía, 22, lu@mail.com" |

```
                      TABLA: alumnos
        ┌────┬──────────┬──────┬────────────────────┐
COLUMNAS│ id │ nombre   │ edad │ email              │  ← campos (nombre + tipo)
        ├────┼──────────┼──────┼────────────────────┤
FILA →  │ 1  │ Lucía    │ 22   │ lucia@mail.com     │  ← registro
FILA →  │ 2  │ Martín   │ 30   │ martin@mail.com    │
FILA →  │ 3  │ Ana      │ 25   │ ana@mail.com       │
        └────┴──────────┴──────┴────────────────────┘
```

> 🧠 **Analogía**: es *parecido* a una planilla de Excel, pero con **reglas estrictas**.
> En Excel podés escribir "veintidós" en la columna de edad y a nadie le importa. En una
> base de datos, la columna `edad` es de tipo entero y la base **te rechaza** el dato. Esa
> rigidez es exactamente lo que hace que puedas confiar en la información.

### 🎯 ¿Por qué una base de datos y no un archivo?

Podrías guardar tus usuarios en un `users.json` y listo. ¿Por qué no alcanza?

- **Consultas**: buscar "todos los usuarios de Tucumán mayores de 25 ordenados por fecha"
  en un JSON implica leer **todo** el archivo y filtrarlo a mano en JS. La base lo hace en
  milisegundos aunque tengas millones de filas.
- **Concurrencia**: si dos requests escriben el archivo al mismo tiempo, se pisan. La base
  maneja accesos simultáneos.
- **Integridad**: la base te garantiza que no haya dos usuarios con el mismo email, que la
  edad no sea negativa, que no exista un pedido de un cliente que no existe.
- **Transacciones**: "descontá plata de una cuenta y sumala a la otra" tiene que pasar
  **entero o nada**. Un archivo no te da eso.

### 📚 [EXTRA] SQL vs NoSQL

No todas las bases de datos son relacionales. La otra gran familia es **NoSQL** (MongoDB,
Redis, Firestore…), que guarda **documentos** o pares clave-valor en vez de tablas.

|                    | **SQL / Relacional**                        | **NoSQL**                              |
| ------------------ | ------------------------------------------- | -------------------------------------- |
| Estructura         | Tablas con **esquema fijo**                 | Documentos flexibles (JSON-like)       |
| Relaciones         | Nativas (`JOIN`, claves foráneas)           | Se resuelven a mano o duplicando datos |
| Consistencia       | Fuerte (ACID)                               | Suele priorizar disponibilidad         |
| Cuándo brilla      | Datos con relaciones claras y consistencia  | Datos heterogéneos, escala horizontal  |
| Ejemplos           | PostgreSQL, MySQL, SQLite, Oracle           | MongoDB, Redis, DynamoDB               |

> 💡 No es una guerra: se usan juntas todo el tiempo. Pero para el 90% de las apps que vas
> a construir (un e-commerce, un sistema de reservas, una red social), **relacional es la
> respuesta correcta por defecto**. Y aprender SQL te sirve para siempre: el lenguaje
> tiene 50 años y no se va a ningún lado.

---

## 🐘 SQL y PostgreSQL

### 🤔 ¿Qué es SQL?

**SQL** = *Structured Query Language*. Es un **lenguaje de programación especializado**
para administrar y manipular bases de datos relacionales. Con él creás, modificás,
eliminás y consultás datos.

Su gran particularidad es que es **declarativo**: vos describís **qué** querés, no **cómo**
obtenerlo. En JavaScript le decís a la máquina el paso a paso; en SQL le pedís el
resultado y el motor decide la mejor manera de conseguirlo.

```js
// JavaScript: imperativo → vos escribís el "cómo"
const resultado = [];
for (const libro of libros) {
  if (libro.anio > 2020) resultado.push(libro.titulo);
}
```

```sql
-- SQL: declarativo → vos escribís el "qué"
SELECT titulo FROM libros WHERE anio > 2020;
```

**SQL es un estándar** (ANSI/ISO), soportado por todos los motores: PostgreSQL, MySQL,
Oracle, SQL Server, SQLite. Lo que aprendas hoy te sirve en cualquiera de ellos.

> ⚠️ El estándar es la base, pero **cada motor tiene sus dialectos**. `SERIAL` existe en
> Postgres y no en SQL Server; `AUTOINCREMENT` es de SQLite. Cuando busques algo en Google,
> agregá siempre el motor: *"postgresql* insert returning*"*.

### 🐘 ¿Por qué PostgreSQL?

Vamos a usar **PostgreSQL 18** (la versión estable actual). Es el motor relacional más
elegido hoy en desarrollo web, y con razón:

- **Open source y gratuito**, sin licencias raras.
- **Muy respetuoso del estándar** SQL.
- Soporta cosas modernas de fábrica: **`JSONB`** (guardar JSON indexable), arrays, búsqueda
  de texto completo, y extensiones como **`pgvector`** (la que vamos a usar cuando lleguemos
  a RAG y bases vectoriales en el Módulo 5).
- Es lo que corre por debajo de **Supabase**, **Neon** y **Railway**, así que llevarlo a
  producción es trivial.

---

## 🐳 Setup: levantar Postgres con Docker

### 🤔 ¿Por qué Docker y no instalarlo?

Instalar Postgres en tu sistema funciona, pero te deja un servicio corriendo para siempre,
atado a una versión, y desinstalarlo es un dolor. Con **Docker** levantás un contenedor
aislado, con la versión exacta que querés, y lo borrás cuando no lo necesitás más.

> 📝 Vamos a ver Docker en profundidad en el Módulo 6. Por ahora usalo como receta: estos
> comandos te dejan una base andando.

### Opción A — un comando

```bash
docker run --name pg-integrar \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=integrar \
  -p 5432:5432 \
  -v pgdata:/var/lib/postgresql/data \
  -d postgres:18
```

Qué hace cada parte:

| Flag                          | Para qué                                                        |
| ----------------------------- | --------------------------------------------------------------- |
| `--name pg-integrar`          | Nombre del contenedor (para después hacer `docker stop`/`start`) |
| `-e POSTGRES_PASSWORD=...`    | Contraseña del usuario (**obligatoria**, si no el contenedor no arranca) |
| `-p 5432:5432`                | Expone el puerto de Postgres de adentro del contenedor a tu máquina |
| `-v pgdata:/var/lib/...`      | **Volumen**: donde viven los datos de verdad                     |
| `-d postgres:18`              | En segundo plano (*detached*), imagen oficial de Postgres 18     |

> 🛑 **Sin el `-v`, los datos viven adentro del contenedor.** Si lo borrás
> (`docker rm pg-integrar`), **perdés todo**. El volumen `pgdata` los guarda por fuera y
> sobrevive a que borres y recrees el contenedor.

> ⚠️ Si te tira `port is already allocated`, ya tenés algo escuchando en el 5432 (otro
> Postgres instalado, u otro contenedor). Cambiá el mapeo: `-p 5433:5432` y conectate al
> puerto 5433.

### Opción B — docker-compose (recomendado para el proyecto)

Creá un `docker-compose.yml` en la raíz de tu proyecto:

```yaml
services:
  db:
    image: postgres:18
    container_name: pg-integrar
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: integrar
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

```bash
docker compose up -d      # levantar
docker compose down       # bajar (los datos quedan en el volumen)
docker compose logs -f db # ver qué está pasando
```

> 💡 Esto además queda versionado en el repo: cualquiera del equipo clona y con
> `docker compose up -d` tiene **la misma base, la misma versión**. Se terminó el
> "en mi máquina anda".

### Conectarse

Necesitás un **cliente**: un programa que hable con el servidor de base de datos. Tres
opciones, elegí una:

1. **DBeaver** (recomendado) — cliente gráfico, gratis, multiplataforma. Nueva conexión →
   PostgreSQL → completás los datos de abajo.
2. **Extensión de VS Code** — buscá *PostgreSQL* en el marketplace; te deja correr queries
   sin salir del editor.
3. **`psql`** en la terminal, directo desde el contenedor:

```bash
docker exec -it pg-integrar psql -U postgres -d integrar
```

Los datos de conexión, siempre los mismos cinco:

```
Host:     localhost
Puerto:   5432
Base:     integrar
Usuario:  postgres
Password: postgres
```

Que también se pueden escribir como una **connection string** (así se la vas a pasar a Nest
más adelante, en el `.env`):

```
postgresql://postgres:postgres@localhost:5432/integrar
```

> 🛑 Estas credenciales son de juguete, para desarrollo local. En producción: contraseña
> real, en el `.env`, y el `.env` en el `.gitignore` (como vimos en la
> [[Clase 24 - Servidores, APIs REST y bases de NestJS|clase de servidores]]).

### Cargar la base de ejemplo (pagila)

Para practicar consultas necesitamos datos de verdad, no tres filas de juguete. Vamos a
usar **pagila** (también conocida como *dvdrental*): una base de ejemplo que modela un
videoclub — películas, actores, clientes, alquileres, pagos, tiendas. Tiene ~15 tablas y
miles de filas.

Con el archivo `pagila.sql` (o el `.tar` de dvdrental) descargado:

```bash
# 1. Creamos una base vacía para ella
docker exec -it pg-integrar psql -U postgres -c "CREATE DATABASE pagila;"

# 2. Copiamos el dump adentro del contenedor
docker cp pagila.sql pg-integrar:/tmp/pagila.sql

# 3. Lo restauramos
docker exec -it pg-integrar psql -U postgres -d pagila -f /tmp/pagila.sql
```

Verificá que cargó bien:

```sql
SELECT COUNT(*) FROM film;   -- deberían ser 1000
```

> 📝 Si el dump viene en formato `.tar` (dvdrental), el paso 3 se hace con
> `pg_restore -U postgres -d pagila /tmp/dvdrental.tar` en vez de `psql -f`.

---

## 📐 Modelar antes de escribir

### 🤔 ¿Por qué diagramar?

Crear tablas es fácil. **Cambiarlas cuando ya tienen 50.000 filas y tres partes de la app
dependen de ellas, no.** Por eso el modelado va primero: en papel (o en Excalidraw) es
gratis equivocarse.

Un **DER** (Diagrama Entidad-Relación) o un **diagrama de clases de UML** te deja ver de un
vistazo qué entidades existen, qué atributos tiene cada una y cómo se conectan.

**UML** (*Unified Modeling Language*) es un lenguaje de modelado gráfico estándar para
visualizar, especificar y documentar sistemas de software — incluidas las bases de datos.

### La notación mínima

Cada **entidad** es una caja con su nombre arriba y sus **atributos** abajo, con el tipo.
Las líneas entre cajas son las **relaciones**, y los números en las puntas son la
**cardinalidad** (cuántos de un lado se corresponden con cuántos del otro).

```
   ┌───────────────────────┐              ┌───────────────────────┐
   │        autores        │              │        libros         │
   ├───────────────────────┤              ├───────────────────────┤
   │ PK  id      : integer │ 1          N │ PK  id      : integer │
   │     nombre  : varchar │──────────────│     titulo  : varchar │
   │     pais    : varchar │              │     anio    : integer │
   └───────────────────────┘              │ FK  autor_id: integer │
                                          └───────────────────────┘

     "un autor escribe muchos libros; cada libro tiene un solo autor"
```

- **PK** = *Primary Key*, el identificador único de la fila.
- **FK** = *Foreign Key*, la referencia a la PK de otra tabla.
- Las cardinalidades típicas: **1:1**, **1:N** y **N:M**.

> 📝 Hoy solo lo presentamos para que puedas leer un diagrama. **PK, FK y los tres tipos de
> relación son el tema central de la [[Clase 26 - SQL Relaciones, JOIN y Funciones|próxima
> clase]]**.

### El proceso, en tres pasos

1. **Identificá las entidades**: los sustantivos importantes de tu dominio (usuario,
   producto, pedido). Cada uno suele ser una tabla.
2. **Listá los atributos** de cada una y decidí el **tipo de dato** de cada uno.
3. **Marcá las relaciones** y su cardinalidad.

> 💡 Un truco: leé el enunciado del problema y subrayá los **sustantivos** (candidatos a
> tabla) y los **verbos** que los unen (candidatos a relación). "Un **cliente** *realiza*
> muchos **pedidos**, y cada **pedido** *contiene* varios **productos**".

---

## 🧭 Las familias de comandos SQL

Todo SQL se agrupa en cinco familias según **qué toca**. Tener este mapa en la cabeza te
ordena todo lo que viene:

| Familia | Nombre completo              | Qué hace                                  | Comandos                                    |
| ------- | ---------------------------- | ----------------------------------------- | ------------------------------------------- |
| **DDL** | Data **Definition** Language | Define la **estructura** (el "molde")     | `CREATE`, `ALTER`, `DROP`, `TRUNCATE`       |
| **DML** | Data **Manipulation** Lang.  | Modifica los **datos** de adentro         | `INSERT`, `UPDATE`, `DELETE`                |
| **DQL** | Data **Query** Language      | **Consulta** datos (no modifica nada)     | `SELECT`                                    |
| **DCL** | Data **Control** Language    | Permisos: quién puede hacer qué           | `GRANT`, `REVOKE`                           |
| **TCL** | Transaction Control Lang.    | Agrupa operaciones en **transacciones**   | `BEGIN`, `COMMIT`, `ROLLBACK`               |

> 🔑 Regla mental: **DDL toca el molde, DML toca el contenido, DQL solo mira.**

Hoy vamos a fondo con **DDL**, **DML** y **DQL**. DCL y TCL los vas a ver cuando trabajemos
con la base desde la app.

---

## 🏗️ DDL: crear la estructura

### CREATE DATABASE

```sql
CREATE DATABASE <nombre_base_de_datos>;

CREATE DATABASE books_database;
```

> ⚠️ En Postgres no podés estar "parado" en una base y crear tablas en otra. Después de
> crearla, tenés que **conectarte** a ella (en `psql` es `\c books_database`; en DBeaver,
> cambiás la base en el desplegable).

### CREATE TABLE

La plantilla general:

```sql
CREATE TABLE <nombre_de_tabla> (
    <nombre_de_campo> <tipo_de_dato> <restricciones>,
    <nombre_de_campo> <tipo_de_dato> <restricciones>,
    ...
    <nombre_de_campo> <tipo_de_dato> <restricciones>
);
```

Y el ejemplo que vamos a usar el resto de la clase:

```sql
CREATE TABLE books (
  id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title       VARCHAR(150) NOT NULL,
  author      VARCHAR(100) NOT NULL,
  genre       VARCHAR(50),
  year        INTEGER CHECK (year > 1400),
  price       NUMERIC(10, 2) NOT NULL DEFAULT 0,
  available   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

Leelo de a una línea: **nombre del campo → tipo de dato → restricciones**. Eso es todo lo
que hay.

### Tipos de datos en PostgreSQL

| Categoría    | Tipo                        | Para qué / cuándo                                           |
| ------------ | --------------------------- | ----------------------------------------------------------- |
| **Enteros**  | `SMALLINT`                  | Enteros chicos (−32.768 a 32.767)                           |
|              | `INTEGER` / `INT`           | El entero de todos los días (±2.100 millones)               |
|              | `BIGINT`                    | Cuando el `INT` te puede quedar corto (IDs de alto volumen) |
| **Auto**     | `SERIAL` / `IDENTITY`       | Entero que se autoincrementa: el típico `id`                |
| **Decimal**  | `NUMERIC(p, s)`             | **Precisión exacta**: plata, cantidades, porcentajes        |
|              | `REAL` / `DOUBLE PRECISION` | Punto flotante: cálculos científicos, coordenadas           |
| **Texto**    | `VARCHAR(n)`                | Texto con largo máximo (nombre, email, título)              |
|              | `CHAR(n)`                   | Largo **fijo**, rellena con espacios. Rara vez lo querés    |
|              | `TEXT`                      | Texto sin límite (una descripción, un post)                 |
| **Booleano** | `BOOLEAN`                   | `TRUE` / `FALSE` / `NULL`                                   |
| **Fecha**    | `DATE`                      | Solo fecha (`2026-07-27`)                                   |
|              | `TIME`                      | Solo hora                                                   |
|              | `TIMESTAMP`                 | Fecha + hora                                                |
|              | `TIMESTAMPTZ`               | Fecha + hora **con zona horaria**                           |
|              | `INTERVAL`                  | Una duración ("3 días", "2 horas")                          |
| **Otros**    | `UUID`                      | Identificador único universal                               |
|              | `JSONB`                     | JSON indexable y consultable                                |
|              | `ARRAY`                     | Un arreglo de otro tipo (`TEXT[]`)                          |

> 💡 **`SERIAL` vs `GENERATED ALWAYS AS IDENTITY`**: los dos te dan un entero
> autoincremental. `SERIAL` es la forma vieja y específica de Postgres;
> `GENERATED ALWAYS AS IDENTITY` es la del **estándar SQL** y la recomendada hoy (entre
> otras cosas, te impide insertar un id a mano por accidente). Vas a ver `SERIAL` en
> millones de tutoriales y en pagila: no está mal, solo es más viejo.

```sql
id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY   -- ✅ moderno, estándar
id SERIAL PRIMARY KEY                                 -- ⚠️ funciona, forma clásica
```

> 🛑 **Nunca uses punto flotante para plata.** `FLOAT` no representa exactamente los
> decimales y los errores se acumulan.

```
❌ Mal                              ✅ Bien
price DOUBLE PRECISION              price NUMERIC(10, 2)
0.1 + 0.2 = 0.30000000000000004     0.1 + 0.2 = 0.30
```

```
❌ Mal (todo VARCHAR(255) por defecto)   ✅ Bien (el tipo que corresponde)
edad       VARCHAR(255)                  edad       INTEGER
activo     VARCHAR(255)                  activo     BOOLEAN
creado_en  VARCHAR(255)                  creado_en  TIMESTAMP
```

> ⚠️ Si guardás una fecha como texto, perdés todo: no podés ordenar bien, no podés restar
> fechas, no podés filtrar por mes. El tipo correcto no es cosmética, **es funcionalidad**.

### Restricciones (constraints)

Las **restricciones** son las reglas que la base hace cumplir. Son tu red de seguridad: no
importa qué bug tenga tu backend, la base **no va a aceptar** datos que las violen.

| Restricción     | Qué garantiza                                         |
| --------------- | ----------------------------------------------------- |
| `PRIMARY KEY`   | Identifica la fila de forma **única**; no puede ser nula |
| `FOREIGN KEY`   | El valor **existe** en otra tabla (integridad referencial) |
| `UNIQUE`        | No se repite en toda la columna                        |
| `NOT NULL`      | El valor es **obligatorio**                            |
| `CHECK`         | Una condición propia que debe cumplirse                |
| `DEFAULT`       | Valor por defecto si no lo especificás                 |

```sql
CREATE TABLE users (
  id       INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email    VARCHAR(150) NOT NULL UNIQUE,          -- obligatorio y sin repetidos
  age      INTEGER CHECK (age >= 18),             -- solo mayores de edad
  role     VARCHAR(20) NOT NULL DEFAULT 'user',   -- si no digo nada, es 'user'
  active   BOOLEAN NOT NULL DEFAULT TRUE
);
```

> 🔑 **Validá en los dos lados.** Que tu DTO de Nest tenga `@IsEmail()` está muy bien: le
> da un error lindo al usuario. Pero la restricción en la base es la que te salva cuando
> alguien inserta datos desde un script, desde otra app o desde una consola. La base es la
> **última línea de defensa** y nunca falla.

> 📝 `FOREIGN KEY` es la que conecta tablas entre sí. La nombramos acá porque es parte del
> catálogo, pero la trabajamos en serio la clase que viene.

### ALTER TABLE

Modifica la estructura de una tabla **que ya existe**:

```sql
-- Agregar una columna
ALTER TABLE books ADD COLUMN pages INTEGER;

-- Borrar una columna (¡se llevan los datos!)
ALTER TABLE books DROP COLUMN pages;

-- Renombrar una columna
ALTER TABLE books RENAME COLUMN year TO published_year;

-- Cambiar el tipo de dato
ALTER TABLE books ALTER COLUMN title TYPE VARCHAR(200);

-- Agregar una restricción
ALTER TABLE books ADD CONSTRAINT price_positivo CHECK (price >= 0);
```

> ⚠️ Si la tabla ya tiene datos, el `ALTER` puede fallar: no podés agregar una columna
> `NOT NULL` sin `DEFAULT` a una tabla con filas (¿qué valor tendrían esas filas?), ni
> cambiar a un tipo incompatible con lo que ya está guardado.

### DROP y TRUNCATE

```sql
DROP TABLE books;        -- borra la tabla ENTERA: estructura + datos
TRUNCATE TABLE books;    -- borra TODAS las filas, la tabla queda vacía pero existe
```

> 🛑 **`DROP` y `TRUNCATE` no preguntan y no tienen `Ctrl+Z`.** No hay papelera de
> reciclaje. Antes de correr cualquiera de los dos, mirá tres veces a qué base estás
> conectado. Es el error más caro y más común de la carrera de todo backender.

---

## ✍️ DML: modificar los datos

### INSERT INTO

```sql
INSERT INTO <nombre_de_tabla> (
    <campo>, <campo>, ...
) VALUES (
    <valor>, <valor>, ...
);
```

Un ejemplo concreto:

```sql
INSERT INTO books (title, author, genre, year, price)
VALUES ('Rayuela', 'Julio Cortázar', 'Novela', 1963, 12500.00);
```

Podés insertar **varias filas de una sola vez** (mucho más rápido que N inserts):

```sql
INSERT INTO books (title, author, genre, year, price) VALUES
  ('El Aleph',            'Jorge Luis Borges',   'Cuento',  1949,  9800.00),
  ('Ficciones',           'Jorge Luis Borges',   'Cuento',  1944, 10200.00),
  ('Cien años de soledad','Gabriel García Márquez','Novela',1967, 15000.00),
  ('La invención de Morel','Adolfo Bioy Casares','Novela',  1940,  8700.00),
  ('Boquitas pintadas',   'Manuel Puig',         'Novela',  1969, 11300.00);
```

Fijate que **no pasamos `id`, ni `available`, ni `created_at`**: el `id` lo genera la base
(`IDENTITY`) y los otros dos tienen `DEFAULT`.

Y si querés que te devuelva lo que acaba de crear (útil para responderle a tu API):

```sql
INSERT INTO books (title, author, price)
VALUES ('Pedro Páramo', 'Juan Rulfo', 9500.00)
RETURNING id, title, created_at;
```

> 💡 `RETURNING` es una de las mejores cosas de Postgres: te evita hacer un `INSERT` y
> después un `SELECT` para saber qué id te tocó. También funciona con `UPDATE` y `DELETE`.

> ⚠️ El orden importa: los valores del `VALUES` se corresponden **posicionalmente** con las
> columnas que listaste arriba. Si las cruzás, en el mejor de los casos te da un error de
> tipo; en el peor, guarda el autor en el título.

### UPDATE

```sql
UPDATE <tabla>
SET <columna> = <valor>, <columna> = <valor>
WHERE <condición>;
```

```sql
UPDATE books
SET price = 13500.00
WHERE title = 'Rayuela';
```

```sql
-- Podés usar el valor actual de la columna: aumento del 20% a las novelas
UPDATE books
SET price = price * 1.20
WHERE genre = 'Novela';
```

### DELETE

```sql
DELETE FROM <tabla>
WHERE <condición>;
```

```sql
DELETE FROM books
WHERE year < 1900;
```

### 🛑 El error clásico: olvidarse del WHERE

```
❌ CATÁSTROFE                        ✅ Bien
UPDATE books SET price = 0;          UPDATE books SET price = 0
  ↑ pone TODOS los libros en $0        WHERE id = 3;

DELETE FROM books;                   DELETE FROM books
  ↑ borra TODA la tabla                WHERE id = 3;
```

En SQL, `WHERE` es **opcional**. Si no lo ponés, la operación se aplica a **todas las
filas**, sin advertencia y sin vuelta atrás.

> 🔑 **La regla de oro**: antes de un `UPDATE` o un `DELETE`, escribí primero un `SELECT`
> con **exactamente el mismo `WHERE`** y mirá qué filas te devuelve. Si son las que
> esperabas, recién ahí cambiás el `SELECT ...` por el `UPDATE`/`DELETE`.

```sql
-- 1. Primero miro
SELECT * FROM books WHERE author = 'Manuel Puig';
-- 2. Si son las que quiero, recién ahí:
DELETE FROM books WHERE author = 'Manuel Puig';
```

> 💡 En DBeaver podés activar el modo "no autocommit": los cambios no se aplican hasta que
> apretás *Commit*, y podés hacer *Rollback* si la pifiaste. Muy recomendable mientras
> estés aprendiendo.

---

## 🔍 DQL: consultar con SELECT

Acá es donde vas a pasar el 90% de tu tiempo. `SELECT` **solo lee**: no modifica nada, así
que podés experimentar sin miedo.

### La forma básica

```sql
SELECT <columnas> FROM <tabla>;

SELECT title, author FROM books;
SELECT * FROM books;              -- * = todas las columnas
```

```
❌ En tu app                        ✅ En tu app
SELECT * FROM users;                SELECT id, name, email FROM users;
```

> ⚠️ `SELECT *` está perfecto para explorar en el cliente, pero en el código de tu API es
> mala idea: traés columnas que no usás (incluida la de `password`), y si mañana alguien
> agrega una columna, tu app empieza a recibir datos que no esperaba. **Pedí lo que
> necesitás.**

### Alias con AS

Renombra una columna **en el resultado** (no en la tabla):

```sql
SELECT title AS titulo, author AS autor FROM books;

-- El AS es opcional, aunque se lee mejor con él
SELECT title titulo FROM books;

-- Si el alias tiene espacios o mayúsculas, va entre comillas dobles
SELECT price AS "Precio Final" FROM books;
```

> 💡 Sirve muchísimo cuando la columna es un cálculo o una función, porque si no Postgres
> le pone un nombre feo como `?column?`.

```sql
SELECT title, price * 0.21 AS iva FROM books;
```

### WHERE y los operadores de comparación

```sql
SELECT <columnas> FROM <tabla> WHERE <condición>;

SELECT author FROM books WHERE title = 'Rayuela';
```

| Operador       | Significado           | Ejemplo                          |
| -------------- | --------------------- | -------------------------------- |
| `=`            | Igual                 | `WHERE genre = 'Novela'`         |
| `<>` o `!=`    | Distinto              | `WHERE genre <> 'Novela'`        |
| `>` `<`        | Mayor / menor         | `WHERE year > 1960`              |
| `>=` `<=`      | Mayor o igual / menor o igual | `WHERE price <= 10000`   |

> ⚠️ En SQL el texto va entre **comillas simples** (`'Novela'`). Las comillas dobles se
> usan para **identificadores** (nombres de tablas y columnas), no para strings. Es al
> revés que en JavaScript y es una fuente infinita de errores al principio.

### Operadores lógicos: AND, OR, NOT

```sql
-- Novelas posteriores a 1960
SELECT title FROM books
WHERE genre = 'Novela' AND year > 1960;

-- Cuentos o novelas
SELECT title FROM books
WHERE genre = 'Cuento' OR genre = 'Novela';

-- Todo lo que no sea novela
SELECT title FROM books
WHERE NOT genre = 'Novela';
```

> ⚠️ `AND` tiene **más precedencia** que `OR`, igual que la multiplicación sobre la suma.
> Cuando mezclás los dos, **usá paréntesis** aunque creas que no hacen falta:

```sql
-- ❌ Esto NO es lo que parece: trae todas las novelas (sin importar el año)
--    más los cuentos posteriores a 1960
SELECT * FROM books WHERE genre = 'Novela' OR genre = 'Cuento' AND year > 1960;

-- ✅ Esto sí: novelas o cuentos, en ambos casos posteriores a 1960
SELECT * FROM books WHERE (genre = 'Novela' OR genre = 'Cuento') AND year > 1960;
```

### IN — pertenece a una lista

Reemplaza una cadena larga de `OR`:

```sql
-- ❌ Verboso
SELECT * FROM books
WHERE genre = 'Novela' OR genre = 'Cuento' OR genre = 'Poesía';

-- ✅ Igual pero legible
SELECT * FROM books
WHERE genre IN ('Novela', 'Cuento', 'Poesía');

-- Y su negación
SELECT * FROM books WHERE genre NOT IN ('Ensayo', 'Biografía');
```

### BETWEEN — dentro de un rango

```sql
SELECT title, year FROM books
WHERE year BETWEEN 1940 AND 1970;

-- Equivale exactamente a:
SELECT title, year FROM books
WHERE year >= 1940 AND year <= 1970;
```

> ⚠️ `BETWEEN` es **inclusivo en los dos extremos**. Ojo con las fechas:
> `BETWEEN '2026-01-01' AND '2026-01-31'` sobre un `TIMESTAMP` **deja afuera** casi todo el
> 31, porque `'2026-01-31'` se interpreta como las 00:00 de ese día.

### LIKE e ILIKE — buscar patrones en texto

Dos comodines:

- **`%`** → cualquier cantidad de caracteres (incluso ninguno)
- **`_`** → **exactamente un** caracter

```sql
SELECT * FROM books WHERE title LIKE 'El %';    -- empieza con "El "
SELECT * FROM books WHERE title LIKE '%amor%';  -- contiene "amor"
SELECT * FROM books WHERE title LIKE '%ón';     -- termina en "ón"
SELECT * FROM books WHERE title LIKE '____';    -- títulos de exactamente 4 letras
SELECT * FROM books WHERE author LIKE '___A%';  -- 4ta letra es 'A' mayúscula
```

> 💡 **`LIKE` distingue mayúsculas de minúsculas.** Postgres te da **`ILIKE`**
> (*insensitive*), que no. Para un buscador, casi siempre querés `ILIKE`:

```sql
SELECT * FROM books WHERE title ILIKE '%RAYUELA%';  -- encuentra 'Rayuela'
```

### NULL — la ausencia de valor

`NULL` **no es** cero, ni string vacío, ni `false`. Es "**no se sabe**". Y comparar contra
algo desconocido no da ni verdadero ni falso: da desconocido.

```
❌ Nunca funciona                   ✅ Así se hace
WHERE genre = NULL                  WHERE genre IS NULL
WHERE genre <> NULL                 WHERE genre IS NOT NULL
```

```sql
SELECT title FROM books WHERE genre IS NULL;      -- libros sin género cargado
SELECT title FROM books WHERE genre IS NOT NULL;
```

> ⚠️ El `NULL` también se cuela en los filtros normales:
> `WHERE genre <> 'Novela'` **no** trae las filas con `genre` en `NULL`, porque para esas
> filas la comparación no es verdadera. Si las querés, tenés que pedirlas explícitamente:
> `WHERE genre <> 'Novela' OR genre IS NULL`.

### DISTINCT — sin repetidos

```sql
SELECT DISTINCT genre FROM books;             -- la lista de géneros, sin repetir
SELECT DISTINCT genre, author FROM books;     -- combinaciones únicas de los DOS campos
```

> 📝 `DISTINCT` se aplica a **todas** las columnas del `SELECT` juntas, no a la primera. En
> el segundo ejemplo, "Novela + Borges" y "Cuento + Borges" son dos filas distintas.

### ORDER BY — ordenar el resultado

```sql
SELECT <columnas> FROM <tabla> WHERE <condición> ORDER BY <columna> ASC|DESC;

SELECT title, year FROM books ORDER BY year DESC;          -- del más nuevo al más viejo
SELECT title, price FROM books ORDER BY price ASC;         -- del más barato al más caro
SELECT * FROM books ORDER BY author ASC, year DESC;        -- por autor, y dentro de cada autor por año
```

- **`ASC`** = ascendente (A→Z, menor→mayor). Es el **default**, podés omitirlo.
- **`DESC`** = descendente.

> ⚠️ **Sin `ORDER BY`, el orden de las filas no está garantizado.** Puede parecer que
> siempre salen igual, pero el motor no te lo promete y puede cambiar cuando la tabla
> crece. Si el orden importa, **pedilo explícitamente**.

> 💡 Los `NULL` se van al final con `ASC` en Postgres. Podés controlarlo con
> `ORDER BY genre ASC NULLS FIRST`.

### LIMIT y OFFSET — paginación

```sql
SELECT <columnas> FROM <tabla> WHERE <condición> LIMIT <cantidad>;

SELECT * FROM books LIMIT 10;                    -- las primeras 10
SELECT * FROM books ORDER BY price DESC LIMIT 5; -- los 5 más caros
```

`OFFSET` saltea filas. Combinados son la **paginación** clásica de cualquier API:

```sql
-- Página 1 (filas 1-10)
SELECT * FROM books ORDER BY id LIMIT 10 OFFSET 0;
-- Página 2 (filas 11-20)
SELECT * FROM books ORDER BY id LIMIT 10 OFFSET 10;
-- Página 3 (filas 21-30)
SELECT * FROM books ORDER BY id LIMIT 10 OFFSET 20;

-- La fórmula: OFFSET = (página - 1) * tamaño_de_página
```

> 🔑 **`LIMIT` sin `ORDER BY` no tiene sentido.** "Dame 10 filas" sin decir en qué orden es
> pedir 10 filas al azar. Si querés "los 5 más caros", el `ORDER BY price DESC` es la parte
> importante; el `LIMIT` solo corta.

### Poniendo todo junto

```sql
SELECT title AS titulo, author AS autor, price AS precio
FROM books
WHERE genre IN ('Novela', 'Cuento')
  AND year BETWEEN 1940 AND 1970
  AND title ILIKE '%a%'
  AND genre IS NOT NULL
ORDER BY price DESC, titulo ASC
LIMIT 10;
```

---

## 🎁 [BONUS] El orden de ejecución de una query

> 🎁 Material bonus: si no llegamos en clase, leelo por tu cuenta. Explica un montón de
> errores que si no parecen arbitrarios.

Vos **escribís** una query en este orden:

```
SELECT → FROM → WHERE → ORDER BY → LIMIT
```

Pero Postgres la **ejecuta** en otro:

```
1. FROM      → ¿de qué tabla saco las filas?
2. WHERE     → filtro filas
3. GROUP BY  → agrupo         ┐ (los vemos la clase que viene)
4. HAVING    → filtro grupos  ┘
5. SELECT    → recién acá elijo/calculo las columnas y aplico los alias
6. DISTINCT  → saco repetidos
7. ORDER BY  → ordeno
8. LIMIT     → corto
```

De ahí salen dos comportamientos que confunden a todo el mundo:

```sql
-- ❌ ERROR: la columna "precio_final" no existe
SELECT price * 1.21 AS precio_final FROM books WHERE precio_final > 10000;
```

Cuando se ejecuta el `WHERE` (paso 2), el `SELECT` (paso 5) **todavía no corrió**, así que
el alias `precio_final` no existe. Hay que repetir la expresión:

```sql
-- ✅ Funciona
SELECT price * 1.21 AS precio_final FROM books WHERE price * 1.21 > 10000;
```

Pero en el `ORDER BY` (paso 7) **sí** podés usar el alias, porque el `SELECT` ya pasó:

```sql
-- ✅ Funciona
SELECT price * 1.21 AS precio_final FROM books ORDER BY precio_final DESC;
```

> 🔑 Regla corta: **el `WHERE` no ve los alias; el `ORDER BY` sí.**

---

## 🎯 Ejercicios Prácticos

### 1. Levantar el entorno

Levantá PostgreSQL 18 con Docker (con volumen), conectate con DBeaver o la extensión de
VS Code, y restaurá el dump de **pagila**. Verificá que cargó bien:

```sql
SELECT COUNT(*) FROM film;      -- debería dar 1000
SELECT COUNT(*) FROM customer;  -- debería dar 599
```

### 2. Tu primera tabla (DDL + DML)

Creá una base `libreria` y dentro una tabla `books` con:

- `id` autoincremental como `PRIMARY KEY`
- `title` de texto, obligatorio
- `author` de texto, obligatorio
- `genre` de texto, opcional
- `year` entero, con un `CHECK` que no permita años anteriores a 1400
- `price` con el tipo correcto para plata, con `DEFAULT 0`
- `created_at` timestamp con `DEFAULT CURRENT_TIMESTAMP`

Después:

1. Insertá **5 libros** en un solo `INSERT`.
2. Insertá uno más usando `RETURNING` para ver el `id` que le tocó.
3. Agregá la columna `pages` con `ALTER TABLE`.
4. Subile el precio un 15% **solo a un género**.
5. Borrá un libro por `id` (acordate de mirarlo primero con un `SELECT`).
6. Probá insertar un libro con `year = 1200` y mirá qué error te da. Probá insertar uno
   sin `title`. **Entender los errores es parte del ejercicio.**

### 3. Consultas sobre pagila (las clásicas)

A partir de la base suministrada y mediante **DQL**, hacé las consultas *(queries)*
necesarias para responder:

1. ¿Cuántas tiendas **(store)** hay en total?
2. ¿Cuántas películas **(film)** tienen una duración de más de 120 minutos?
3. ¿Cuántos pagos realizó el cliente **(customer)** con el ID 472?
4. ¿Cuál es el ID de la película **(film)** que tiene un ID de inventario *(inventory)* 303?
5. ¿Cuál es la dirección **(address)** y distrito **(district)** de la persona cuyo teléfono
   es `634445428822`?

### 4. Consultas con filtros (lo nuevo)

6. Mostrá las **10 películas más largas**, con su título y duración.
7. Listá las clasificaciones **(rating)** distintas que existen, sin repetir.
8. Traé los títulos que **contengan la palabra `dragon`**, sin importar mayúsculas.
9. Traé las películas con `rental_rate` **entre 2 y 4**, ordenadas de la más cara a la más
   barata.
10. Mostrá los clientes cuyo apellido **empiece con `S`**, ordenados alfabéticamente, y traé
    solo los primeros 15 (usá `LIMIT`).
11. Buscá las direcciones que **no tengan** un valor cargado en `address2` (ojo con `NULL`).
12. Mostrá las películas cuyo `rating` sea `G` o `PG` **y** duren menos de 90 minutos.

### 5. Desafío

13. Armá la **página 3** de un listado de películas ordenadas por título, con 20 películas
    por página (`LIMIT` + `OFFSET`).
14. Mostrá el título de cada película junto con su `rental_rate` **aumentado un 21%**, con
    la columna calculada renombrada como `precio_con_iva`, ordenado de mayor a menor.

---

## 📚 Referencias

- [PostgreSQL — Documentación oficial](https://www.postgresql.org/docs/current/)
- [PostgreSQL — Tipos de datos](https://www.postgresql.org/docs/current/datatype.html)
- [PostgreSQL — Restricciones (constraints)](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [PostgreSQL — SELECT](https://www.postgresql.org/docs/current/sql-select.html)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [Imagen oficial de Postgres en Docker Hub](https://hub.docker.com/_/postgres)
- [Base de ejemplo pagila](https://github.com/devrimgunduz/pagila)
- [DBeaver](https://dbeaver.io/)
- Clase anterior: [[Clase 24 - Servidores, APIs REST y bases de NestJS]]
- Clase siguiente: [[Clase 26 - SQL Relaciones, JOIN y Funciones]]
