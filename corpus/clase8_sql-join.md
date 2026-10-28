#sql #postgresql #relaciones #primarykey #foreignkey #joins #groupby #funciones #backend

## 🗺️ Mapa de la clase

En la [[Clase 25 - SQL Introducción|clase anterior]] aprendimos a crear una tabla, meterle
datos y consultarla con `SELECT`, `WHERE`, `ORDER BY` y `LIMIT`. Todo dentro de **una sola
tabla**.

Ahora mirá esta tabla `alumnos`, que guarda además la carrera de cada uno:

| id  | nombre | apellido | carrera             | duracion_carrera | director_carrera |
| --- | ------ | -------- | ------------------- | ---------------- | ---------------- |
| 1   | Lucía  | Gómez    | Ingeniería en Sist. | 5                | Ana Pérez        |
| 2   | Martín | Ruiz     | Ingeniería en Sist. | 5                | Ana Pérez        |
| 3   | Sofía  | Díaz     | Ingenieria en Sist. | 5                | Ana Perez        |
| 4   | Juan   | López    | Contador Público    | 4                | Luis Ríos        |

Tres problemas, todos graves:

- **Redundancia**: "Ingeniería en Sistemas / 5 / Ana Pérez" está escrito tres veces. Con
  3.000 alumnos, tres mil veces.
- **Inconsistencia**: fijate la fila 3. `Ingenieria` sin tilde y `Ana Perez` sin tilde.
  ¿Son la misma carrera que las filas 1 y 2? Para la base, **no**. Y ahora tus reportes
  mienten.
- **Anomalías al modificar**: si cambia el director de la carrera, tenés que actualizar
  **todas** las filas. Si te olvidás de una, quedan dos verdades distintas conviviendo.
  Y si el último alumno de una carrera se da de baja, **la carrera desaparece** de tu base.

> 🔑 **La solución**: cada cosa se guarda **una sola vez, en su propia tabla**, y las tablas
> se **relacionan** entre sí. Eso es lo que hoy vamos a aprender a hacer… y, en
> consecuencia, a **volver a juntarlas** cuando necesitemos verlas todas juntas.

El plan de hoy:

1. **Clave primaria (PK)** — cómo identificar una fila de forma única.
2. **Clave foránea (FK)** — cómo apuntar desde una tabla a otra.
3. **Los tres tipos de relación**: 1:1, 1:N y N:M.
4. **JOIN** — el corazón de la clase: volver a unir lo que separamos.
5. **Funciones**: agregadas, de texto, numéricas y de fecha.
6. **GROUP BY y HAVING** — responder preguntas *por grupo*.
7. **Subqueries** — consultas adentro de consultas.

---

## 🔑 Clave Primaria (PK)

### 🤔 ¿Qué es?

Una **clave primaria** es un campo (o combinación de campos) que **identifica de manera
única** cada registro de una tabla. Es el "DNI" de la fila.

Sus reglas son innegociables:

- Debe ser **única**: no hay dos filas con el mismo valor.
- **No puede ser `NULL`**: toda fila tiene que estar identificada.
- **Solo hay una PK por tabla** (aunque puede estar formada por varias columnas).
- No debería cambiar nunca a lo largo de la vida de la fila.

```sql
CREATE TABLE estudiantes (
  id        INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre    VARCHAR(50)  NOT NULL,
  apellido  VARCHAR(50)  NOT NULL,
  edad      INTEGER,
  email     VARCHAR(255) NOT NULL UNIQUE,
  telefono  VARCHAR(50),
  direccion VARCHAR(255)
);
```

> ⚠️ Vas a ver en muchos tutoriales `id INTEGER PRIMARY KEY AUTOINCREMENT`. **Eso es
> SQLite**, no Postgres. En PostgreSQL el autoincremento se escribe
> `GENERATED ALWAYS AS IDENTITY` (forma moderna, estándar SQL) o `SERIAL` (forma clásica).

### 🎯 PK natural vs subrogada

|          | **Natural**                                               | **Subrogada** *(recomendada)*                  |
| -------- | --------------------------------------------------------- | ---------------------------------------------- |
| Qué es   | Un dato real del dominio (DNI, CUIT, ISBN)                | Un número/UUID inventado solo para identificar |
| Ejemplo  | `dni VARCHAR(8) PRIMARY KEY`                              | `id INTEGER GENERATED ALWAYS AS IDENTITY`      |
| Ventaja  | No agrega una columna extra                               | Nunca cambia, siempre existe, es chiquita      |
| Problema | Puede cambiar, repetirse o faltar (un extranjero sin DNI) | Un dato más que no significa nada              |
|          |                                                           |                                                |

> 💡 **Por defecto, usá una PK subrogada** (`id`). El dato "natural" (DNI, email, ISBN) lo
> ponés igual en la tabla, pero con `UNIQUE`, que te da la garantía de no-repetido **sin**
> atarte a él como identificador. Si mañana la AFIP cambia el formato del CUIT, no tenés
> que actualizar las 40 tablas que lo referenciaban.

### PK compuesta

Una PK puede estar formada por **más de una columna**. Sirve cuando lo que identifica la
fila es la **combinación**:

```sql
CREATE TABLE inscripciones (
  estudiante_id INTEGER NOT NULL,
  materia_id    INTEGER NOT NULL,
  PRIMARY KEY (estudiante_id, materia_id)   -- ← un solo PRIMARY KEY, con dos columnas
);
```

Acá la regla que estás imponiendo es "**un estudiante no se puede inscribir dos veces a la
misma materia**". Volvemos a esto cuando veamos las relaciones N:M.

### 🚫 Cuándo NO

```
❌ Mal                                  ✅ Bien
email VARCHAR(150) PRIMARY KEY          id    INTEGER ... PRIMARY KEY
  ↑ el usuario cambia de mail y          email VARCHAR(150) NOT NULL UNIQUE
    se rompen todas las referencias
```

---

## 🔗 Clave Foránea (FK)

### 🤔 ¿Qué es?

Una **clave foránea** es una columna que **hace referencia a la clave primaria de otra
tabla**. Es el mecanismo con el que se establecen las relaciones.

Lo importante no es solo que "apunta": es que la base **garantiza la integridad
referencial**. No podés insertar un estudiante con `carrera_id = 99` si no existe una
carrera con `id = 99`. La base te frena.

```sql
-- 1️⃣ Primero la tabla REFERENCIADA (la que tiene la PK)
CREATE TABLE profesores (
  id           INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre       VARCHAR(50) NOT NULL,
  especialidad VARCHAR(50)
);

-- 2️⃣ Después la que la referencia (la que tiene la FK)
CREATE TABLE cursos (
  id           INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre       VARCHAR(50) NOT NULL,
  profesor_id  INTEGER,
  FOREIGN KEY (profesor_id) REFERENCES profesores(id)
);
```

> ⚠️ **El orden de creación importa.** No podés referenciar una tabla que todavía no
> existe: Postgres te tira `relation "profesores" does not exist`. Siempre creá primero la
> tabla "padre".

Hay dos formas de escribir la FK, ambas válidas:

```sql
-- Inline (más corta, cuando es una sola columna)
profesor_id INTEGER REFERENCES profesores(id)

-- Como restricción con nombre (mejor: el error te dice cuál constraint falló)
CONSTRAINT fk_curso_profesor FOREIGN KEY (profesor_id) REFERENCES profesores(id)
```

> 💡 Una tabla puede tener **muchas** FKs, apuntando a tablas distintas o incluso a **la
> misma** tabla (ej. `empleados.jefe_id → empleados.id`).

### 🎯 ON DELETE y ON UPDATE

Pregunta obligada: **¿qué pasa con los cursos si borro al profesor?** Vos lo definís:

| Acción        | Qué hace al borrar el padre                              | Cuándo usarla                                   |
| ------------- | -------------------------------------------------------- | ----------------------------------------------- |
| `NO ACTION`   | **Falla** el borrado (default)                            | Cuando querés que sea un error consciente        |
| `RESTRICT`    | **Falla** el borrado, y no se puede diferir               | Datos que no se deben perder (facturas, pagos)   |
| `CASCADE`     | **Borra también** las filas hijas                         | Cuando el hijo no tiene sentido sin el padre     |
| `SET NULL`    | Pone la FK en `NULL`                                      | El hijo sobrevive "huérfano" (curso sin profesor)|
| `SET DEFAULT` | Pone el valor `DEFAULT` de la columna                     | Reasignar a un "genérico"                        |

```sql
-- Si borro un usuario, se borran sus posts (no tienen sentido sin él)
CREATE TABLE posts (
  id      INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title   VARCHAR(150) NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Si borro un profesor, el curso sigue existiendo pero sin profesor asignado
CREATE TABLE cursos (
  id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre      VARCHAR(50) NOT NULL,
  profesor_id INTEGER REFERENCES profesores(id) ON DELETE SET NULL
);
```

> 🛑 **`ON DELETE CASCADE` es una motosierra.** Borrar un usuario puede borrar en cadena sus
> posts, los comentarios de esos posts, las notificaciones de esos comentarios… Es muy útil,
> pero pensá bien el efecto dominó antes de ponerlo. Para datos contables o de auditoría,
> `RESTRICT` es casi siempre la respuesta correcta.

> 💡 `ON DELETE SET NULL` exige que la columna **acepte `NULL`**. Si la declaraste
> `NOT NULL`, no compila.

---

## 🧩 Tipos de relaciones entre tablas

### 1️⃣ Relación Uno a Uno (One-to-One)

**Qué es**: un registro de una tabla se relaciona con **exactamente un** registro de la
otra, y viceversa.

**Cuándo se usa**: cuando la información está estrechamente vinculada pero conviene
separarla — porque son datos opcionales, porque son pesados (una biografía larga, una foto)
o porque son sensibles y querés controlarles el acceso por separado.

**Cómo se implementa**: la PK de una tabla se pone como FK en la otra, **más un `UNIQUE`**.
Ese `UNIQUE` es lo que convierte un 1:N en un 1:1.

```sql
CREATE TABLE users (
  id       INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name     VARCHAR(50)  NOT NULL,
  email    VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE profiles (
  id      INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  bio     TEXT,
  photo   VARCHAR(255),
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE
);                          -- ↑ este UNIQUE es LA clave del 1:1
```

```
   users                     profiles
   ┌────┬───────┐            ┌────┬──────┬─────────┐
   │ id │ name  │  1      1  │ id │ bio  │ user_id │
   ├────┼───────┤────────────├────┼──────┼─────────┤
   │ 1  │ Lucía │            │ 10 │ ...  │    1    │ ← UNIQUE: nadie más puede tener el 1
   │ 2  │ Juan  │            │ 11 │ ...  │    2    │
   └────┴───────┘            └────┴──────┴─────────┘
```

> 🚫 **Cuándo NO usarlo**: si los datos son obligatorios y siempre están juntos, **es una
> sola tabla**. Partirla en dos solo te obliga a hacer un `JOIN` en cada consulta a cambio
> de nada. El 1:1 se justifica cuando hay opcionalidad, peso o seguridad de por medio.

### 2️⃣ Relación Uno a Muchos (One-to-Many) — la más común

**Qué es**: un registro de la tabla A se relaciona con **varios** registros de la tabla B,
pero cada registro de B se relaciona con **uno solo** de A.

**Cómo se implementa**: **la FK va siempre del lado "muchos"**. Esta es la regla que más
te conviene memorizar.

```sql
CREATE TABLE carreras (
  id             INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre         VARCHAR(100) NOT NULL UNIQUE,
  duracion_anios INTEGER NOT NULL
);

CREATE TABLE estudiantes (
  id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre     VARCHAR(50)  NOT NULL,
  apellido   VARCHAR(50)  NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  edad       INTEGER,
  carrera_id INTEGER REFERENCES carreras(id) ON DELETE RESTRICT
);                       -- ↑ la FK vive acá, del lado "muchos"
```

> 📝 Fijate que `carrera_id` **no** es `NOT NULL`: lo dejamos opcional a propósito, para
> admitir un estudiante todavía sin carrera asignada. Si en tu dominio la carrera fuera
> obligatoria, le agregás `NOT NULL` y listo. **Esa decisión es tuya y cambia las consultas
> que vas a poder hacer** — más adelante lo vamos a aprovechar con `LEFT JOIN`.

```
   carreras                        estudiantes
   ┌────┬──────────────┐           ┌────┬────────┬────────────┐
   │ id │ nombre       │  1     N  │ id │ nombre │ carrera_id │
   ├────┼──────────────┤───────────├────┼────────┼────────────┤
   │ 1  │ Ing. Sistemas│           │ 1  │ Lucía  │     1      │
   │ 2  │ Contador     │           │ 2  │ Martín │     1      │
   └────┴──────────────┘           │ 3  │ Sofía  │     1      │
                                   │ 4  │ Juan   │     2      │
                                   └────┴────────┴────────────┘
```

Y así queda resuelto el problema del principio: **"Ingeniería en Sistemas" está escrito una
sola vez**. Se acabaron las tildes que faltan y las actualizaciones a medias.

Otro ejemplo idéntico en estructura, con el dominio de siempre:

```sql
CREATE TABLE posts (
  id      INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title   VARCHAR(150) NOT NULL,
  body    TEXT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);
```

```
❌ Mal (FK del lado "uno")           ✅ Bien (FK del lado "muchos")
CREATE TABLE users (                 CREATE TABLE posts (
  id       INTEGER PRIMARY KEY,        id      INTEGER PRIMARY KEY,
  name     VARCHAR(50),                title   VARCHAR(150),
  post1_id INTEGER,   ← ¿y si          user_id INTEGER REFERENCES users(id)
  post2_id INTEGER,     escribe 50?  );
  post3_id INTEGER
);
```

> 🔑 Preguntate siempre: **"¿de qué lado puede haber muchos?"**. La FK va ahí. Un usuario
> tiene muchos posts → la FK `user_id` va en `posts`.

### 3️⃣ Relación Muchos a Muchos (Many-to-Many)

**Qué es**: varios registros de A se relacionan con varios de B. Un estudiante cursa varias
materias, y cada materia tiene varios estudiantes.

**El problema**: no hay dónde poner la FK. Si la ponés en `estudiantes`, cada estudiante
tendría una sola materia. Si la ponés en `materias`, cada materia tendría un solo
estudiante. Ninguna de las dos alcanza.

**La solución**: una **tabla intermedia** (tabla de unión, *pivot* o *join table*) que
guarda los pares. Tiene **dos FKs** y su PK suele ser la **combinación** de ambas.

```sql
CREATE TABLE materias (
  id     INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  anio   INTEGER NOT NULL
);

CREATE TABLE inscripciones (
  estudiante_id INTEGER NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
  materia_id    INTEGER NOT NULL REFERENCES materias(id)    ON DELETE CASCADE,
  fecha         DATE NOT NULL DEFAULT CURRENT_DATE,  -- ← atributo propio de la relación
  nota          INTEGER CHECK (nota BETWEEN 1 AND 10),
  PRIMARY KEY (estudiante_id, materia_id)            -- ← evita inscripciones duplicadas
);
```

```
  estudiantes              inscripciones               materias
  ┌────┬────────┐       ┌───────────┬──────────┐      ┌────┬───────────┐
  │ id │ nombre │  1  N │ estud._id │ mat._id  │ N  1 │ id │ nombre    │
  ├────┼────────┤───────├───────────┼──────────┤──────├────┼───────────┤
  │ 1  │ Lucía  │       │     1     │    1     │      │ 1  │ Álgebra   │
  │ 2  │ Martín │       │     1     │    2     │      │ 2  │ Física I  │
  └────┴────────┘       │     2     │    1     │      │ 3  │ Análisis  │
                        └───────────┴──────────┘      └────┴───────────┘
      "Lucía cursa Álgebra y Física I; Martín cursa Álgebra"
```

Un N:M es, en realidad, **dos relaciones 1:N** que apuntan a la tabla del medio.

El mismo patrón con usuarios y roles (un usuario tiene varios roles, un rol lo tienen varios
usuarios):

```sql
CREATE TABLE roles (
  id   INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE user_roles (
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id    INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id)
);
```

> 💡 La tabla intermedia **puede tener datos propios** de la relación, y muchas veces los
> tiene: la `nota` y la `fecha` de la inscripción, la `cantidad` y el `precio_unitario` en
> un `pedido_items`. Esos datos no pertenecen a ninguna de las dos tablas por separado:
> pertenecen **al vínculo**.

> 📝 La forma que vimos para crear una relación **many to many** se denomina forma
> **explícita** (vos creás y manejás la tabla del medio). Existe también la forma
> **implícita**, en la que un ORM la crea y la administra por vos sin que vos la escribas.

### Tabla resumen

| Relación | Cómo se implementa                          | Ejemplo                        |
| -------- | ------------------------------------------- | ------------------------------ |
| **1:1**  | FK **+ `UNIQUE`** en una de las dos tablas  | `users` ↔ `profiles`           |
| **1:N**  | FK **del lado "muchos"**                     | `carreras` → `estudiantes`     |
| **N:M**  | **Tabla intermedia** con dos FKs y PK compuesta | `estudiantes` ↔ `materias` |

---

## 🧹 [BONUS] Normalización en criollo

> 🎁 Material bonus: si no llegamos en clase, leelo por tu cuenta. Es la teoría detrás de
> todo lo que acabamos de hacer por intuición.

**Normalizar** es el proceso de organizar las tablas para **eliminar la redundancia** y
evitar las anomalías que vimos al principio de la clase. Hay muchas "formas normales"; con
las tres primeras cubrís el 99% de los casos.

**1FN — Valores atómicos.** Cada celda guarda **un solo valor**; nada de listas adentro de
una columna.

```
❌ telefonos: "3814-111111, 3814-222222"   ✅ una tabla telefonos con una fila por número
```

**2FN — Depende de la PK completa.** Aplica cuando la PK es compuesta: todo atributo que no
sea clave tiene que depender de **toda** la clave, no de una parte.

```
❌ inscripciones(estudiante_id, materia_id, nombre_estudiante)
     ↑ nombre_estudiante depende solo de estudiante_id → va en la tabla estudiantes
```

**3FN — Sin dependencias transitivas.** Ningún atributo depende de otro atributo que no sea
la clave.

```
❌ alumnos(id, nombre, carrera, duracion_carrera)
     ↑ duracion_carrera depende de carrera, no del alumno → tabla carreras aparte
```

> 🔑 Fijate que la tabla del principio de la clase **violaba la 3FN**, y todos sus problemas
> se resolvieron al separarla en `carreras` + `estudiantes`. Eso es normalizar.

> ⚠️ Existe también la **desnormalización**: duplicar datos a propósito para ganar
> velocidad de lectura. Es una optimización válida, pero **se hace después de medir**, no
> antes. Empezá normalizado.

---

## 🔀 JOIN

### 🤔 El problema que resuelve

Separamos los datos en tablas. Perfecto. Pero cuando el usuario entra a la app quiere ver
**"Lucía Gómez — Ingeniería en Sistemas"**, no `carrera_id = 1`.

```sql
SELECT nombre, apellido, carrera_id FROM estudiantes;
```

| nombre | apellido | carrera_id |
| ------ | -------- | ---------- |
| Lucía  | Gómez    | 1          |

Ese `1` no le sirve a nadie. Necesitamos **volver a unir** las tablas en el momento de la
consulta. Para eso está `JOIN`.

> 🧠 **Analogía**: guardaste la ropa separada en cajones (remeras, pantalones, medias)
> porque así está ordenado. Pero para salir a la calle tenés que **combinar** prendas de
> varios cajones. `JOIN` es abrir varios cajones a la vez.

### La sintaxis

```sql
SELECT <columnas>
FROM <tabla_a>
JOIN <tabla_b> ON <tabla_a>.<columna> = <tabla_b>.<columna>;
```

```sql
SELECT estudiantes.nombre, estudiantes.apellido, carreras.nombre
FROM estudiantes
JOIN carreras ON estudiantes.carrera_id = carreras.id;
```

El `ON` es **la condición de unión**: le dice al motor **cómo** se corresponden las filas de
una tabla con las de la otra. Casi siempre es `FK = PK`.

Con **alias de tabla** queda mucho más corto y legible (y es lo que vas a ver en todos
lados):

```sql
SELECT e.nombre, e.apellido, c.nombre AS carrera
FROM estudiantes AS e
JOIN carreras   AS c ON e.carrera_id = c.id;
```

> ⚠️ Cuando dos tablas tienen columnas con **el mismo nombre** (acá, `nombre` en las dos),
> **tenés que calificarlas** con la tabla o el alias (`e.nombre`, `c.nombre`). Si escribís
> `nombre` a secas, Postgres te tira `column reference "nombre" is ambiguous`.

### Los cuatro JOIN

Todo se entiende con dos tablas de ejemplo. Supongamos:

```
  estudiantes                        carreras
  ┌────┬────────┬────────────┐       ┌────┬──────────────┐
  │ id │ nombre │ carrera_id │       │ id │ nombre       │
  ├────┼────────┼────────────┤       ├────┼──────────────┤
  │ 1  │ Lucía  │     1      │       │ 1  │ Ing. Sistemas│
  │ 2  │ Martín │     1      │       │ 2  │ Contador     │
  │ 3  │ Sofía  │   NULL     │ ← sin │ 3  │ Abogacía     │ ← sin
  └────┴────────┴────────────┘ carrera└────┴──────────────┘   alumnos
```

#### INNER JOIN — solo las coincidencias

Devuelve **solo** los registros que tienen coincidencia en **ambas** tablas.

```sql
SELECT e.nombre, c.nombre AS carrera
FROM estudiantes e
INNER JOIN carreras c ON e.carrera_id = c.id;
```

| nombre | carrera       |
| ------ | ------------- |
| Lucía  | Ing. Sistemas |
| Martín | Ing. Sistemas |

→ **Sofía no aparece** (no tiene carrera) y **Abogacía tampoco** (no tiene alumnos).

```
    A ∩ B          ┌───────┐
                  ╱│░░░░░░░│╲
                 │ │░░░░░░░│ │
                  ╲│░░░░░░░│╱
                   └───────┘
              A       ↑↑↑       B
                  solo esto
```

> 💡 `JOIN` a secas **es** `INNER JOIN`. La palabra `INNER` es opcional, pero escribirla
> hace la intención explícita.

#### LEFT JOIN — todo lo de la izquierda

Devuelve **todos** los registros de la tabla izquierda y los coincidentes de la derecha. Si
no hay coincidencia, las columnas de la derecha vienen en **`NULL`**.

```sql
SELECT e.nombre, c.nombre AS carrera
FROM estudiantes e
LEFT JOIN carreras c ON e.carrera_id = c.id;
```

| nombre | carrera       |
| ------ | ------------- |
| Lucía  | Ing. Sistemas |
| Martín | Ing. Sistemas |
| Sofía  | `NULL`        |

→ Ahora **Sofía sí aparece**, con la carrera en `NULL`.

```
    A ⟕ B          ┌───────┬───────┐
                  ╱│░░░░░░░│░░░░░  │╲
                 │ │░░░░░░░│░░░░░  │ │
                  ╲│░░░░░░░│░░░░░  │╱
                   └───────┴───────┘
                 A (todo)      B (solo lo que matchea)
```

> 🔑 **`LEFT JOIN` es el que más vas a usar después del `INNER`.** Y tiene un uso
> buenísimo: encontrar **lo que NO tiene relación**.

```sql
-- Estudiantes sin carrera asignada
SELECT e.nombre
FROM estudiantes e
LEFT JOIN carreras c ON e.carrera_id = c.id
WHERE c.id IS NULL;
```

#### RIGHT JOIN — todo lo de la derecha

El espejo del anterior: todos los de la derecha, y `NULL` en las columnas de la izquierda
cuando no hay coincidencia.

```sql
SELECT e.nombre, c.nombre AS carrera
FROM estudiantes e
RIGHT JOIN carreras c ON e.carrera_id = c.id;
```

| nombre | carrera       |
| ------ | ------------- |
| Lucía  | Ing. Sistemas |
| Martín | Ing. Sistemas |
| `NULL` | Contador      |
| `NULL` | Abogacía      |

> 📝 En la práctica **casi no se usa**: cualquier `RIGHT JOIN` se puede escribir como un
> `LEFT JOIN` dando vuelta las tablas, y eso se lee mucho mejor. Estas dos son idénticas:
> `A RIGHT JOIN B` ≡ `B LEFT JOIN A`.

#### FULL JOIN — todo de los dos lados

Devuelve **todos** los registros de ambas tablas, coincidan o no, con `NULL` donde falte.

```sql
SELECT e.nombre, c.nombre AS carrera
FROM estudiantes e
FULL JOIN carreras c ON e.carrera_id = c.id;
```

| nombre | carrera       |
| ------ | ------------- |
| Lucía  | Ing. Sistemas |
| Martín | Ing. Sistemas |
| Sofía  | `NULL`        |
| `NULL` | Contador      |
| `NULL` | Abogacía      |

> 💡 Su uso típico es **auditar datos**: encontrar de una sola pasada los huérfanos de los
> dos lados.

#### Tabla resumen

| JOIN         | Qué devuelve                                    | Cuándo usarlo                                  |
| ------------ | ----------------------------------------------- | ---------------------------------------------- |
| `INNER JOIN` | Solo las filas con coincidencia en ambas         | El 80% de los casos: "quiero los datos completos" |
| `LEFT JOIN`  | Todas las de la izquierda + las que matcheen     | "Todos los X, tengan o no Y" / buscar huérfanos |
| `RIGHT JOIN` | Todas las de la derecha + las que matcheen       | Casi nunca (usá `LEFT` al revés)                |
| `FULL JOIN`  | Todas las de ambas                               | Auditorías, conciliación de datos               |
| `CROSS JOIN` | **Todas las combinaciones** posibles (A × B)     | Generar combinatorias (talles × colores)        |

### JOIN de tres o más tablas

Los `JOIN` se encadenan. Para atravesar una relación N:M necesitás pasar por la tabla del
medio:

```sql
-- Qué materias cursa cada estudiante, con su nota y su carrera
SELECT
  e.nombre     AS estudiante,
  c.nombre     AS carrera,
  m.nombre     AS materia,
  i.nota
FROM estudiantes e
JOIN carreras     c ON e.carrera_id   = c.id
JOIN inscripciones i ON i.estudiante_id = e.id
JOIN materias     m ON i.materia_id   = m.id
ORDER BY e.nombre, m.nombre;
```

> 🔑 Leelo como un camino: **estudiantes → inscripciones → materias**. Cada `JOIN` es un
> paso más. No hay límite práctico de cuántos encadenar.

### 🚫 Los tres errores clásicos

**1. Olvidarse del `ON` → producto cartesiano**

```sql
-- ❌ Sin ON: cada fila de A se combina con TODAS las de B
SELECT * FROM estudiantes, carreras;
-- 3 estudiantes × 3 carreras = 9 filas sin ningún sentido
```

> ⚠️ Con tablas grandes esto no es "un resultado raro": son **millones de filas** y el
> servidor de rodillas. Si tu query tarda una eternidad, lo primero que revisás es el `ON`.

**2. Filtrar la tabla derecha en el `WHERE` de un `LEFT JOIN`**

Este es sutil y le pasa a todo el mundo:

```sql
-- ❌ Esto se comporta como un INNER JOIN
SELECT e.nombre, c.nombre
FROM estudiantes e
LEFT JOIN carreras c ON e.carrera_id = c.id
WHERE c.nombre = 'Ing. Sistemas';
```

El `LEFT JOIN` trae a Sofía con `c.nombre = NULL`… y después el `WHERE` la elimina, porque
`NULL = 'Ing. Sistemas'` no es verdadero. Perdiste el efecto del `LEFT`.

```sql
-- ✅ La condición sobre la tabla derecha va en el ON
SELECT e.nombre, c.nombre
FROM estudiantes e
LEFT JOIN carreras c ON e.carrera_id = c.id AND c.nombre = 'Ing. Sistemas';
```

> 🔑 Regla: en un `LEFT JOIN`, las condiciones sobre la tabla **izquierda** van en el
> `WHERE`; las condiciones sobre la tabla **derecha** van en el `ON`.

**3. No calificar las columnas ambiguas**

```
❌ SELECT nombre FROM estudiantes JOIN carreras ON ...
     → ERROR: column reference "nombre" is ambiguous
✅ SELECT e.nombre, c.nombre AS carrera FROM estudiantes e JOIN carreras c ON ...
```

---

## 🧮 Funciones

SQL trae funciones para calcular cosas sobre los datos. Se dividen en dos grandes grupos:
las que operan **fila por fila** (texto, números, fechas) y las **agregadas**, que colapsan
**muchas filas en un solo valor**.

### AGGREGATE — de muchas filas a un valor

| Función         | Qué devuelve                                          |
| --------------- | ----------------------------------------------------- |
| `COUNT(*)`      | El número de **filas** que coinciden con el criterio   |
| `COUNT(columna)`| Cuántas filas tienen esa columna **no nula**           |
| `SUM(columna)`  | La suma total de una columna numérica                  |
| `AVG(columna)`  | El promedio de una columna numérica                    |
| `MAX(columna)`  | El valor más grande                                    |
| `MIN(columna)`  | El valor más chico                                     |

```sql
SELECT COUNT(*) FROM estudiantes;                          -- cuántos estudiantes hay
SELECT COUNT(*) FROM estudiantes WHERE edad > 21;          -- cuántos son mayores de 21
SELECT AVG(nota) FROM inscripciones;                       -- promedio general
SELECT MAX(nota), MIN(nota) FROM inscripciones;            -- la mejor y la peor nota
SELECT SUM(duracion_anios) FROM carreras;
```

> ⚠️ **`COUNT(*)` vs `COUNT(columna)`**: no son lo mismo. `COUNT(*)` cuenta **filas**;
> `COUNT(columna)` **ignora los `NULL`**. Con 3 estudiantes de los cuales uno no tiene
> carrera: `COUNT(*)` → 3, `COUNT(carrera_id)` → 2.

> 💡 `COUNT(DISTINCT columna)` cuenta **valores distintos**: `COUNT(DISTINCT carrera_id)`
> te dice en cuántas carreras distintas hay alumnos.

> ⚠️ Las funciones agregadas también **ignoran los `NULL`** al promediar y sumar. `AVG` de
> `[10, NULL, 8]` es **9**, no 6. Si querés que el `NULL` cuente como 0, usá
> `AVG(COALESCE(nota, 0))`.

### STRING — funciones de texto

| Función                        | Qué hace                              |
| ------------------------------ | ------------------------------------- |
| `CONCAT(exp1, exp2, ...)`      | Concatena dos o más expresiones        |
| `exp1 \|\| exp2`               | Lo mismo, con el operador de Postgres  |
| `LENGTH(string)`               | La longitud de la cadena               |
| `UPPER(string)`                | La misma cadena en MAYÚSCULAS          |
| `LOWER(string)`                | La misma cadena en minúsculas          |
| `TRIM(string)`                 | Saca los espacios de los extremos      |
| `SUBSTRING(string FROM a FOR b)` | Un pedazo de la cadena               |
| `REPLACE(string, viejo, nuevo)`| Reemplaza texto                        |
| `INITCAP(string)`              | Primera Letra De Cada Palabra En Mayúscula |

```sql
SELECT CONCAT(nombre, ' ', apellido) AS nombre_completo FROM estudiantes;
SELECT nombre || ' ' || apellido      AS nombre_completo FROM estudiantes;
SELECT UPPER(apellido), LENGTH(email) FROM estudiantes;
SELECT REPLACE(email, '@gmail.com', '@empresa.com') FROM estudiantes;
```

> ⚠️ Con `||`, si **cualquiera** de las partes es `NULL`, **todo el resultado es `NULL`**.
> `CONCAT()` en cambio trata los `NULL` como string vacío. Si `apellido` es `NULL`, la
> primera query devuelve `NULL` y la segunda devuelve `'Lucía '`.

### NUMERIC — funciones numéricas

| Función                    | Qué hace                                        |
| -------------------------- | ----------------------------------------------- |
| `ROUND(numero, decimales)` | Redondea a la cantidad de decimales indicada    |
| `FLOOR(numero)`            | Redondea **hacia abajo**                        |
| `CEIL(numero)`             | Redondea **hacia arriba**                       |
| `ABS(numero)`              | Valor absoluto                                  |
| `MOD(a, b)`                | El resto de la división                         |
| `RANDOM()`                 | Un número aleatorio entre 0 y 1                 |

```sql
SELECT ROUND(AVG(nota), 2) AS promedio FROM inscripciones;  -- ej: 7.83
SELECT FLOOR(7.9), CEIL(7.1), ABS(-4);                      -- 7, 8, 4
SELECT * FROM materias ORDER BY RANDOM() LIMIT 1;           -- una materia al azar
```

> 💡 `ROUND(AVG(...), 2)` es el combo que más vas a escribir: sin él, un promedio te sale
> con quince decimales.

### DATE — funciones de fecha

| Función                        | Qué hace                                     |
| ------------------------------ | -------------------------------------------- |
| `NOW()`                        | Fecha y hora actual (con zona horaria)       |
| `CURRENT_DATE`                 | Solo la fecha de hoy                         |
| `EXTRACT(campo FROM columna)`  | Saca un campo (`YEAR`, `MONTH`, `DAY`, `DOW`) |
| `AGE(fecha1, fecha2)`          | La diferencia entre dos fechas como intervalo |
| `DATE_TRUNC('month', columna)` | Trunca la fecha al inicio del mes/día/año    |
| `fecha + INTERVAL '7 days'`    | Aritmética de fechas                         |

```sql
SELECT NOW(), CURRENT_DATE;

-- Inscripciones de 2026
SELECT * FROM inscripciones WHERE EXTRACT(YEAR FROM fecha) = 2026;

-- Cuántas inscripciones hubo por mes
SELECT DATE_TRUNC('month', fecha) AS mes, COUNT(*)
FROM inscripciones
GROUP BY mes
ORDER BY mes;

-- Inscripciones de los últimos 30 días
SELECT * FROM inscripciones WHERE fecha >= CURRENT_DATE - INTERVAL '30 days';
```

> 🔑 Esta es la razón por la que en la clase pasada insistimos con **no guardar fechas como
> texto**: nada de esto funciona sobre un `VARCHAR`.

### 🎁 [BONUS] COALESCE y CASE

Dos que no estaban en la lista pero aparecen en el código real todos los días.

**`COALESCE(a, b, c)`** devuelve el **primer valor no nulo**. Es el `??` de JavaScript:

```sql
SELECT nombre, COALESCE(telefono, 'Sin teléfono') AS contacto FROM estudiantes;
```

**`CASE WHEN`** es el `if/else` de SQL:

```sql
SELECT
  nombre,
  nota,
  CASE
    WHEN nota >= 9 THEN 'Distinguido'
    WHEN nota >= 6 THEN 'Aprobado'
    ELSE 'Desaprobado'
  END AS condicion
FROM inscripciones i
JOIN estudiantes e ON i.estudiante_id = e.id;
```

---

## 📊 GROUP BY y HAVING

### 🤔 El problema

`SELECT AVG(nota) FROM inscripciones` te da **un** promedio: el de todos. Pero lo que casi
siempre querés es el promedio **por estudiante**, o las ventas **por mes**, o la cantidad de
alumnos **por carrera**.

`GROUP BY` **parte las filas en grupos** y aplica la función agregada **a cada grupo por
separado**.

```sql
SELECT <columna_de_agrupacion>, <funcion_agregada>
FROM <tabla>
GROUP BY <columna_de_agrupacion>;
```

```sql
-- Cuántos estudiantes hay por carrera
SELECT carrera_id, COUNT(*) AS cantidad
FROM estudiantes
GROUP BY carrera_id;
```

| carrera_id | cantidad |
| ---------- | -------- |
| 1          | 3        |
| 2          | 1        |

Y con `JOIN`, para ver el nombre en vez del id:

```sql
SELECT c.nombre AS carrera, COUNT(e.id) AS cantidad_alumnos
FROM carreras c
LEFT JOIN estudiantes e ON e.carrera_id = c.id
GROUP BY c.id, c.nombre
ORDER BY cantidad_alumnos DESC;
```

> 💡 Usamos `LEFT JOIN` a propósito: así las carreras **sin alumnos** aparecen con 0. Con
> un `INNER JOIN` desaparecerían del reporte.

### La regla del GROUP BY

> 🔑 **Toda columna del `SELECT` que no esté adentro de una función agregada tiene que estar
> en el `GROUP BY`.**

```sql
-- ❌ ERROR: column "e.nombre" must appear in the GROUP BY clause
SELECT e.nombre, COUNT(*) FROM estudiantes e GROUP BY e.carrera_id;

-- ✅ Bien
SELECT e.carrera_id, COUNT(*) FROM estudiantes e GROUP BY e.carrera_id;
```

Tiene lógica: si agrupaste 3 estudiantes en una fila, ¿cuál de los 3 nombres tendría que
mostrar? La pregunta no tiene respuesta, y por eso Postgres se niega.

### HAVING — filtrar los grupos

`WHERE` filtra **filas**, y lo hace **antes** de agrupar. Para filtrar **grupos ya
formados** existe `HAVING`.

```sql
-- Carreras con más de 2 estudiantes
SELECT c.nombre, COUNT(e.id) AS cantidad
FROM carreras c
JOIN estudiantes e ON e.carrera_id = c.id
GROUP BY c.id, c.nombre
HAVING COUNT(e.id) > 2;
```

|                     | `WHERE`                          | `HAVING`                          |
| ------------------- | -------------------------------- | --------------------------------- |
| Sobre qué actúa     | **Filas** individuales           | **Grupos** ya formados            |
| Cuándo se ejecuta   | **Antes** del `GROUP BY`         | **Después** del `GROUP BY`        |
| ¿Funciones agregadas? | ❌ No las puede usar            | ✅ Es su razón de existir         |

```
❌ WHERE COUNT(*) > 2       ✅ HAVING COUNT(*) > 2
   (todavía no existe el       (el grupo ya está armado)
    grupo para contarlo)
```

Los dos juntos, que es lo normal:

```sql
-- Promedio por estudiante, contando solo materias de 1er año,
-- y mostrando solo a los que promedian más de 7
SELECT e.nombre, e.apellido, ROUND(AVG(i.nota), 2) AS promedio
FROM estudiantes e
JOIN inscripciones i ON i.estudiante_id = e.id
JOIN materias      m ON i.materia_id    = m.id
WHERE m.anio = 1                            -- ← filtra FILAS antes de agrupar
GROUP BY e.id, e.nombre, e.apellido
HAVING AVG(i.nota) > 7                      -- ← filtra GRUPOS después
ORDER BY promedio DESC
LIMIT 10;
```

> 🔑 Esta query junta **todo** lo de las dos clases: `JOIN` de 3 tablas, `WHERE`, `GROUP BY`,
> función agregada, `HAVING`, `ORDER BY` y `LIMIT`. Si la entendés línea por línea, ya sabés
> SQL.

Y el orden de ejecución completo, ampliando el de la clase pasada:

```
FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT
```

---

## 🪆 Subqueries (subconsultas)

### 🤔 ¿Qué es?

Una **subconsulta** es un `SELECT` adentro de otro `SELECT`. Sirve cuando para responder una
pregunta primero necesitás el resultado de **otra** pregunta.

### En el WHERE, con un valor escalar

```sql
-- Estudiantes con edad mayor al promedio
SELECT nombre, apellido, edad
FROM estudiantes
WHERE edad > (SELECT AVG(edad) FROM estudiantes);
```

La subconsulta de adentro devuelve **un solo valor** (el promedio) y el `WHERE` de afuera lo
usa para comparar.

> 💡 No se puede hacer en un solo paso con `WHERE edad > AVG(edad)`: como vimos, el `WHERE`
> no puede usar funciones agregadas. La subquery resuelve exactamente eso.

### Con IN, sobre una lista

```sql
-- Estudiantes que están inscriptos en al menos una materia
SELECT nombre, apellido
FROM estudiantes
WHERE id IN (SELECT estudiante_id FROM inscripciones);

-- Y su negación: los que no cursan nada
SELECT nombre, apellido
FROM estudiantes
WHERE id NOT IN (SELECT estudiante_id FROM inscripciones WHERE estudiante_id IS NOT NULL);
```

> ⚠️ **Ojo con `NOT IN` y los `NULL`**: si la subconsulta devuelve aunque sea un `NULL`, el
> `NOT IN` **no devuelve nada**. Por eso el `IS NOT NULL` de arriba. Es un clásico que
> arruina tardes enteras.

### Con EXISTS

```sql
-- Carreras que tienen al menos un estudiante
SELECT c.nombre
FROM carreras c
WHERE EXISTS (SELECT 1 FROM estudiantes e WHERE e.carrera_id = c.id);
```

`EXISTS` solo pregunta "**¿hay al menos una fila?**", así que el motor puede cortar apenas
encuentra la primera. Suele ser más rápido que `IN` cuando la subconsulta es grande.

### En el SELECT

```sql
SELECT
  c.nombre,
  (SELECT COUNT(*) FROM estudiantes e WHERE e.carrera_id = c.id) AS cantidad
FROM carreras c;
```

> 🚫 **Cuándo NO usar subqueries**: cuando un `JOIN` hace lo mismo. El ejemplo de arriba se
> resuelve mejor con `LEFT JOIN + GROUP BY`, porque la subquery se ejecuta **una vez por
> cada fila** de `carreras`. Regla práctica: **si necesitás columnas de la otra tabla, es un
> `JOIN`; si solo necesitás filtrar, puede ser una subquery.**

### 🎁 [BONUS] CTE: subqueries con nombre

Cuando la consulta se llena de subqueries anidadas se vuelve ilegible. Un **CTE** (*Common
Table Expression*, la cláusula `WITH`) te deja darle **nombre** a cada paso:

```sql
WITH promedios AS (
  SELECT estudiante_id, AVG(nota) AS promedio
  FROM inscripciones
  GROUP BY estudiante_id
)
SELECT e.nombre, e.apellido, ROUND(p.promedio, 2) AS promedio
FROM estudiantes e
JOIN promedios p ON p.estudiante_id = e.id
WHERE p.promedio > 7
ORDER BY p.promedio DESC;
```

> 💡 Se lee de arriba hacia abajo, como un programa normal: "primero calculá los promedios,
> después usalos". Para consultas complejas es infinitamente más mantenible que anidar.

---

## ⚡ [BONUS] Índices

> 🎁 Material bonus: si no llegamos en clase, leelo por tu cuenta. Es lo primero que vas a
> necesitar cuando tu app tenga datos de verdad.

### 🤔 ¿Qué es?

Sin índice, para resolver `WHERE email = 'lucia@mail.com'` Postgres tiene que leer **toda**
la tabla fila por fila (*sequential scan*). Con 100 filas no se nota; con 5 millones, sí.

Un **índice** es una estructura auxiliar ordenada que le permite al motor **ir directo** a
las filas que busca.

> 🧠 **Analogía**: buscar "clave foránea" en un libro de 800 páginas. Sin índice, hojeás
> desde la página 1. Con el índice alfabético del final, vas directo a la página 412.

```sql
CREATE INDEX idx_estudiantes_email ON estudiantes(email);

-- Índice compuesto, para consultas que filtran por las dos columnas
CREATE INDEX idx_inscripciones_est_mat ON inscripciones(estudiante_id, materia_id);
```

### ¿Se está usando?

```sql
EXPLAIN ANALYZE SELECT * FROM estudiantes WHERE email = 'lucia@mail.com';
```

Buscá en la salida si dice `Seq Scan` (leyó toda la tabla) o `Index Scan` (usó el índice).

### 🚫 Cuándo NO

Los índices **no son gratis**:

- Ocupan espacio en disco.
- **Hacen más lentas las escrituras**: cada `INSERT`/`UPDATE`/`DELETE` tiene que actualizar
  también cada índice.

> ⚠️ No indexes "por las dudas". Indexá las columnas por las que **realmente filtrás,
> ordenás o unís** — típicamente las **FKs** y las columnas de búsqueda frecuente.

> 💡 `PRIMARY KEY` y `UNIQUE` **crean su índice automáticamente**. Las FKs **no**: esas las
> tenés que indexar vos, y son las que más se benefician porque son las que usás en cada
> `JOIN`.

---

## 🎯 Ejercicios Prácticos

### 1. Modelar y crear (DDL con relaciones)

Creá una base `tienda` y modelá un e-commerce chiquito con las **tres** relaciones:

- `clientes` (id, nombre, email único, fecha_alta)
- `perfiles` (id, telefono, direccion, `cliente_id`) → **1:1** con clientes
- `categorias` (id, nombre)
- `productos` (id, nombre, precio, stock, `categoria_id`) → **1:N** con categorías
- `pedidos` (id, `cliente_id`, fecha, estado) → **1:N** con clientes
- `pedido_items` (`pedido_id`, `producto_id`, cantidad, precio_unitario) → **N:M** entre
  pedidos y productos, con PK compuesta

Requisitos:

1. Elegí bien los tipos de dato (acordate: el precio **no** es `FLOAT`).
2. Definí el `ON DELETE` de cada FK y **justificá** cada elección en un comentario.
3. Insertá datos de prueba: 3 categorías, 6 productos, 3 clientes, 3 pedidos con varios
   items cada uno.
4. Probá insertar un producto con una `categoria_id` que no existe y mirá el error.
5. Probá borrar una categoría que tiene productos y mirá qué pasa según el `ON DELETE` que
   hayas elegido.

### 2. Consultas sobre pagila (las clásicas)

A partir de la base suministrada y mediante **DQL**, hacé las siguientes consultas
*(queries)*:

1. Contar cuántas películas empiezan con la letra `S`.
2. Sumar la duración en minutos de todas las películas clasificadas para `PG-13`.
3. Mostrar todos los emails de los clientes junto con la suma de todas las películas que
   rentaron. La salida debería verse así:

   | name       | email                   | sum   |
   | ---------- | ----------------------- | ----- |
   | Jane Smith | jane.smith@example.com  | 89.49 |

4. Mostrar el número de teléfono de la dirección que tiene el código postal más grande.
5. Mostrar la dirección, el distrito y el nombre de la ciudad del primer cliente inactivo.

### 3. JOINs

6. Mostrá el título de cada película junto con el **nombre de su idioma** (`film` +
   `language`).
7. Mostrá el nombre y apellido de cada cliente junto con la **ciudad** donde vive
   (`customer` → `address` → `city`). Son dos `JOIN` encadenados.
8. Listá todos los actores de la película **"Academy Dinosaur"** (`film` →
   `film_actor` → `actor`: una relación N:M).
9. Usá un **`LEFT JOIN`** para encontrar las películas que **no tienen ningún registro en
   `inventory`** (es decir, que no están disponibles en ninguna tienda).

### 4. Funciones, GROUP BY y HAVING

10. Mostrá el **promedio de duración** de las películas, redondeado a 2 decimales.
11. Mostrá cuántas películas hay **por clasificación** (`rating`), ordenado de mayor a menor.
12. Mostrá cuántas películas hay **por categoría** (`film` → `film_category` → `category`).
13. Mostrá el **nombre completo** de cada cliente (`first_name` + `last_name` en una sola
    columna, con `CONCAT` o `||`) junto con la **cantidad de alquileres** que hizo.
14. De la consulta anterior, mostrá **solo los clientes con más de 30 alquileres**
    (`HAVING`).
15. Mostrá el total facturado **por mes** (`payment`, con `DATE_TRUNC` o `EXTRACT`).

### 5. Subqueries y desafío

16. Mostrá las películas cuya duración sea **mayor al promedio** de todas las películas.
17. Mostrá los clientes que **nunca** hicieron un pago (usando `NOT EXISTS` o un
    `LEFT JOIN ... IS NULL`).
18. **Desafío**: armá el **top 5 de categorías por facturación**. Necesitás encadenar
    `category` → `film_category` → `film` → `inventory` → `rental` → `payment`, sumar
    `payment.amount`, agrupar por categoría y ordenar. Resolvelo con un **CTE** para que se
    entienda.

---

## 📚 Referencias

- [PostgreSQL — JOINs](https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-JOIN)
- [PostgreSQL — Restricciones y claves foráneas](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [PostgreSQL — Funciones de agregación](https://www.postgresql.org/docs/current/functions-aggregate.html)
- [PostgreSQL — Funciones de fecha y hora](https://www.postgresql.org/docs/current/functions-datetime.html)
- [PostgreSQL — GROUP BY y HAVING](https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-GROUP)
- [PostgreSQL — Índices](https://www.postgresql.org/docs/current/indexes.html)
- [PostgreSQL — CTE (WITH)](https://www.postgresql.org/docs/current/queries-with.html)
- [Manejo de Fechas en PostgreSQL (EXTRACT)](https://www.postgresqltutorial.com/postgresql-date-functions/postgresql-extract/)
- [PostgreSQL Tutorial — Joins](https://www.postgresqltutorial.com/postgresql-tutorial/postgresql-joins/)
- Clase anterior: [[Clase 25 - SQL Introducción]]
