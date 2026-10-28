# Clase 05 - Lógica de Programación con JavaScript

---

## Operadores en Programación

Son símbolos o palabras reservadas que representan una acción (ya sean operaciones o comparaciones) entre valores o variables.

### Operadores Aritméticos

- **Adición o suma** (`+`)
- **Sustracción o resta** (`-`)
- **Multiplicación** (`*`)
- **División** (`/`)
- **Exponenciación** (`**`)
- **Resto o módulo** (`%`)
- **Negación** (`-número`)

#### Ejemplos

```js
2 + 2   // 4
3 - 2   // 1
10 / 2  // 5
2 * 3   // 6
10 % 5  // 0
2 ** 3  // 8
-5      // -5
```

### Operadores de Asignación

- `=` : Asigna un valor a una variable

### Operadores de Comparación

- `>`  : Mayor que
- `<`  : Menor que
- `>=` : Mayor o igual que
- `<=` : Menor o igual que
- `==` : Igualdad (sin verificar tipo)
- `===` : Igualdad estricta (verifica valor y tipo)

### Operadores Lógicos

- **NOT** (`!`) - Negación
- **AND** (`&&`) - Conjunción: verdadero solo si ambos operandos son verdaderos
- **OR** (`||`) - Disyunción: verdadero si al menos uno es verdadero

---

## Álgebra Booleana

- **Verdadero** (`1`) → "interruptor encendido"
- **Falso** (`0`) → "interruptor apagado"

> Precedencia: `!` se evalúa primero, luego `&&`, luego `||`

#### Ejercicios resueltos

```js
1 && 1 || 0              // true  → (1 && 1) || 0 → 1 || 0 → 1
0 || 1 && 1              // true  → 0 || (1 && 1) → 0 || 1 → 1
1 && 1 || 0 && 1 && 0    // true  → (1 && 1) || (0 && 1 && 0) → 1 || 0 → 1
1 && (1 || 0) && 1       // true  → 1 && 1 && 1 → 1
0 && (1 || 0 && 1 && 1 || 0 || 1 && 0)  // false → 0 && (...) → 0  (cortocircuito)
1 || (0 || 1 && 1 || 0 && 1 && 1 || 0)  // true  → 1 || (...) → 1  (cortocircuito)
! 0 && 1                 // true  → (!0) && 1 → 1 && 1 → 1
! (0 || 1)               // false → !(1) → 0
```

#### Más ejercicios resueltos

```js
10 > 2 && 7 == 6              // false → true && false → false
7 <= 5 || 3 + 2 > 4 && 6 / 2 == 3  // true  → false || (true && true) → false || true → true
10 % 3 == 1                   // true  → 1 == 1 → true
! (23 > 10 - 5)               // false → !(23 > 5) → !(true) → false
```

---

## Valores primitivos (tipos de datos)

- **Boolean**: `true`, `false`
- **Number**: `5`, `-15`, `2.25`
- **String**: `"hola mundo"`, `'Global Learning'`
- **Symbol**: `Symbol()`
- **Undefined**: `undefined`
- **Null**: `null`

En JavaScript, todo lo que no sea un **valor primitivo** es un **objeto**.

---

## Verificar el tipo de dato con `typeof`

Para conocer el tipo de dato en JavaScript usamos `typeof`.

```js
typeof "hola mundo"  // "string"
typeof undefined     // "undefined"
typeof 25.6          // "number"
typeof true          // "boolean"
typeof Symbol()      // "symbol"
typeof null          // "object"  ← particularidad histórica de JS
typeof {}            // "object"
typeof []            // "object"
typeof function(){}  // "function"
```

---

## Variables en JavaScript: `var`, `let` y `const`

- `var`: Usado antes de ES6. Tiene alcance de función y permite redeclaración. Ya no se recomienda.
- `let`: Declara variables **mutables** (pueden cambiar de valor). Tiene alcance de bloque.
- `const`: Declara variables **inmutables** (no pueden reasignarse). Tiene alcance de bloque.

```js
var nombre = "Ana";       // evitar

let edad = 25;
edad = 26;                // válido: let permite reasignación

const PI = 3.14159;
// PI = 3;               // Error: no se puede reasignar una const
```

---

## Mostrar en la consola

Para ver datos en la consola utilizamos `console.log()`:

```js
console.log("Hola mundo");          // Hola mundo
console.log(42);                    // 42
console.log(true);                  // true

let nombre = "Gabriel";
let edad = 30;
console.log(nombre);                // Gabriel
console.log(edad);                  // 30
console.log(nombre, edad);          // Gabriel 30
console.log("Nombre:", nombre);     // Nombre: Gabriel
```

---

## Template Literals

Nos permiten escribir strings de manera más fácil, interpolando variables y expresiones directamente dentro del texto. Se usan con backticks `` ` ``.

```js
let nombre = "Gabriel";
let edad = 30;

// Concatenación tradicional (más engorroso)
console.log("Hola, me llamo " + nombre + " y tengo " + edad + " años.");

// Con template literals (más claro y legible)
console.log(`Hola, me llamo ${nombre} y tengo ${edad} años.`);

// También se pueden incluir expresiones
let precio = 1500;
let descuento = 0.1;
console.log(`Precio final: $${precio - precio * descuento}`); // Precio final: $1350

// Y texto multilínea sin escapes
let mensaje = `Primera línea
Segunda línea
Tercera línea`;
console.log(mensaje);
```

---

## Valores `Falsy`, `Truthy` y `Nullish`

### Falsy

Los valores considerados **falsos** en JavaScript (se comportan como `false` en una condición):

- `false`
- `""` (cadena vacía)
- `0` y `-0`
- `undefined`
- `null`
- `NaN`

```js
if ("") {
    console.log("no se ejecuta");
}
if (0) {
    console.log("no se ejecuta");
}
```

### Truthy

Cualquier valor **que no sea falsy**, por ejemplo:

- `true`
- `"Hola mundo"` (cadena no vacía)
- `25` (número distinto de 0)
- `{}` (objeto vacío)
- `[]` (array vacío)
- `function() {}` (función definida)

```js
if ("Hola") {
    console.log("se ejecuta"); // se ejecuta
}
if (42) {
    console.log("se ejecuta"); // se ejecuta
}
```

### Nullish

Solo dos valores:

- `null`
- `undefined`

Estos valores ayudan a verificar si una variable tiene un valor asignado intencionalmente. Se usan con el operador nullish coalescing `??`:

```js
let usuario = null;
let nombre = usuario ?? "Invitado";
console.log(nombre); // "Invitado"

let puntos = 0;
let resultado = puntos ?? 100;
console.log(resultado); // 0  ← 0 no es nullish, se mantiene
```

---

## Funciones en JavaScript

Son bloques de código reutilizables. Beneficios:

- **Reutilización de código**: se escribe una vez y se usa cuantas veces sea necesario.
- **Modularidad**: código más ordenado y mantenible.
- **Abstracción**: ocultan detalles de implementación.

### Estructura de una función

```js
// Declaración
function saludar(nombre) {
    return `Hola, ${nombre}!`;
}

// Invocación
console.log(saludar("Ana"));    // Hola, Ana!
console.log(saludar("Carlos")); // Hola, Carlos!

// Función con múltiples parámetros
function sumar(a, b) {
    return a + b;
}

console.log(sumar(3, 7));  // 10
console.log(sumar(10, 5)); // 15

// Función con parámetro por defecto
function presentar(nombre, rol = "estudiante") {
    return `${nombre} es ${rol}.`;
}

console.log(presentar("María"));             // María es estudiante.
console.log(presentar("Pedro", "docente"));  // Pedro es docente.
```

---

## Callback

Una función pasada como argumento a otra función:

```js
function operacion(a, b, callback) {
    return callback(a, b);
}

function suma(x, y) {
    return x + y;
}

function resta(x, y) {
    return x - y;
}

console.log(operacion(5, 3, suma));   // 8
console.log(operacion(5, 3, resta));  // 2

// También se puede pasar la función directamente (anónima)
console.log(operacion(4, 2, function(x, y) {
    return x * y;
})); // 8
```

---

## Arrow Functions

Forma más corta de escribir funciones, introducida en ES6:

```js
// Función tradicional
function saludar(nombre) {
    return `Hola, ${nombre}!`;
}

// Arrow function equivalente
const saludar = (nombre) => {
    return `Hola, ${nombre}!`;
};

// Arrow function con retorno implícito (una sola expresión)
const saludar = (nombre) => `Hola, ${nombre}!`;

// Con un solo parámetro, los paréntesis son opcionales
const saludar = nombre => `Hola, ${nombre}!`;

// Sin parámetros, los paréntesis son obligatorios
const obtenerFecha = () => new Date().toLocaleDateString();

// Comparación lado a lado
function duplicarTradicional(n) {
    return n * 2;
}

const duplicarArrow = n => n * 2;

console.log(duplicarTradicional(5)); // 10
console.log(duplicarArrow(5));       // 10
```

---

## Métodos de Arrays

### Manipulación de elementos

```js
const frutas = ["manzana", "banana", "naranja"];

// push: Agrega un elemento al final
frutas.push("uva");
console.log(frutas); // ["manzana", "banana", "naranja", "uva"]

// pop: Elimina el último elemento
const ultima = frutas.pop();
console.log(ultima);  // "uva"
console.log(frutas);  // ["manzana", "banana", "naranja"]

// unshift: Agrega un elemento al inicio
frutas.unshift("frutilla");
console.log(frutas); // ["frutilla", "manzana", "banana", "naranja"]

// shift: Elimina el primer elemento
const primera = frutas.shift();
console.log(primera); // "frutilla"
console.log(frutas);  // ["manzana", "banana", "naranja"]
```

### Transformaciones

```js
const numeros = [1, 2, 3, 4, 5];

// slice: Extrae una porción sin modificar el original
const porcion = numeros.slice(1, 3);
console.log(porcion);  // [2, 3]
console.log(numeros);  // [1, 2, 3, 4, 5] (sin cambios)

// splice: Modifica el array (elimina y/o inserta elementos)
const colores = ["rojo", "verde", "azul"];
const eliminados = colores.splice(1, 1, "amarillo");
console.log(eliminados); // ["verde"]
console.log(colores);    // ["rojo", "amarillo", "azul"]

// toSpliced: Igual a splice pero sin modificar el original (ES2023)
const colores2 = ["rojo", "verde", "azul"];
const nuevo = colores2.toSpliced(1, 1, "amarillo");
console.log(nuevo);    // ["rojo", "amarillo", "azul"]
console.log(colores2); // ["rojo", "verde", "azul"] (sin cambios)
```

### Búsqueda y filtrado

```js
const edades = [15, 22, 18, 30, 17];

// indexOf: Encuentra el índice de un elemento
const idx = edades.indexOf(18);
console.log(idx); // 2

// find: Devuelve el primer elemento que cumple la condición
const mayor = edades.find(edad => edad >= 18);
console.log(mayor); // 22

// filter: Devuelve todos los elementos que cumplen la condición
const mayoresDeEdad = edades.filter(edad => edad >= 18);
console.log(mayoresDeEdad); // [22, 18, 30]
```

### Iteración y transformación

```js
const precios = [100, 250, 80, 400];

// forEach: Ejecuta una función por cada elemento (no retorna nada)
precios.forEach((precio, indice) => {
    console.log(`Producto ${indice + 1}: $${precio}`);
});
// Producto 1: $100
// Producto 2: $250
// Producto 3: $80
// Producto 4: $400

// map: Crea un nuevo array transformando cada elemento
const preciosConIVA = precios.map(precio => precio * 1.21);
console.log(preciosConIVA); // [121, 302.5, 96.8, 484]
console.log(precios);       // [100, 250, 80, 400] (sin cambios)
```

---

## Métodos de Strings

```js
// split: Divide una cadena en un array usando un separador
const frase = "JavaScript es increíble";
const palabras = frase.split(" ");
console.log(palabras); // ["JavaScript", "es", "increíble"]

const csv = "Ana,Pedro,María,Carlos";
const nombres = csv.split(",");
console.log(nombres); // ["Ana", "Pedro", "María", "Carlos"]

// join: Une elementos de un array en una cadena
const partes = ["Hola", "mundo", "desde", "JS"];
const oracion = partes.join(" ");
console.log(oracion); // "Hola mundo desde JS"

const tags = ["js", "web", "programacion"];
console.log(tags.join(" | ")); // "js | web | programacion"

// replace: Reemplaza la primera ocurrencia de una subcadena
const texto = "El gato y el gato están en el tejado";
const nuevo = texto.replace("gato", "perro");
console.log(nuevo); // "El perro y el gato están en el tejado"

// replaceAll: Reemplaza todas las ocurrencias
const sinGatos = texto.replaceAll("gato", "perro");
console.log(sinGatos); // "El perro y el perro están en el tejado"
```
