# Clase 06 - Arreglos y Objetos en JavaScript

> Clase enfocada en **conceptos**: cómo se modela información en JavaScript usando arreglos y objetos, qué métodos modernos tenemos para trabajar con ellos y cómo combinarlos para resolver problemas reales.
>
> En esta clase **no** veremos `private`, `public`, herencia (`extends`), interfaces ni getters/setters avanzados — esos temas los abordaremos cuando entremos a TypeScript.

---

# Parte 1 — Arreglos

## ¿Qué es un arreglo?

Un **arreglo** (array) es una estructura de datos que nos permite **agrupar varios valores** bajo un mismo nombre, accediéndolos a través de un **índice numérico** que comienza en `0`.

```js
//  Longitud = 5
    [22, 11, 0, 3, 7]
//    0   1  2  3  4

const footballPlayers = ['Messi', 'Alvarez', 'Martinez', 'Romero']

console.log(footballPlayers[3])        // 'Romero'
console.log(footballPlayers.length)    // 4
```

### Características clave
- Son **dinámicos**: pueden crecer o achicarse en tiempo de ejecución.
- Pueden contener **cualquier tipo** de dato (números, strings, booleanos, objetos, otros arreglos, funciones).
- Son **objetos** internamente, por eso tienen métodos.

---

## Formas de crear un Array

```js
new Array(3)            // [ <3 empty items> ] - arreglo vacío de tamaño 3
new Array(3, 4, 5, 5)   // [3, 4, 5, 5]
[3, 4, 6]               // forma literal (la más usada)
Array.of(7)             // [7]              (a diferencia de new Array(7))
Array.from('hola')      // ['h', 'o', 'l', 'a']
Array.from({ length: 3 }, (_, i) => i * 2) // [0, 2, 4]
```

---

## Métodos de acceso

### at(index)
- Devuelve el elemento en la posición indicada.
- Acepta **índices negativos** (cuenta desde el final).

```js
const numbers = [1, 2, 3, 4]
numbers.at(1)   // 2
numbers.at(-1)  // 4 (último elemento)
```

### with(index, value)
- Devuelve **un nuevo arreglo** con el elemento reemplazado.
- **NO modifica** el arreglo original.

```js
const numbers = [1, 2, 3, 4]
numbers[1] = 22                 // forma tradicional (modifica original)
const updated = numbers.with(1, 22) // moderno (no modifica original)
```

---

## Métodos que modifican el original (mutables)

### push(el1, el2, ...)
- Añade uno o varios elementos al **final**. Devuelve la nueva longitud.

```js
const numbers = [1, 1, 3, 5]
console.log(numbers.push(555)) // 5
console.log(numbers)           // [1, 1, 3, 5, 555]
```

### pop()
- Elimina el **último** elemento. Devuelve el elemento eliminado.

```js
const numbers = [1, 1, 3, 9]
console.log(numbers.pop()) // 9
```

### unshift(el1, el2, ...)
- Añade uno o varios elementos al **comienzo**. Devuelve la nueva longitud.

```js
const numbers = [1, 1, 3, 5]
console.log(numbers.unshift(555, 444)) // 6
console.log(numbers)                   // [555, 444, 1, 1, 3, 5]
```

### shift()
- Elimina el **primer** elemento. Devuelve el elemento eliminado.

```js
const numbers = [12, 1, 3, 9]
console.log(numbers.shift()) // 12
```

### splice(start, deleteCount, item1, itemN)
- Elimina y/o agrega elementos en cualquier posición.
- Devuelve un arreglo con los elementos eliminados.

```js
const numbers = [1, 2, 3, 4]
numbers.splice(1, 1)              // elimina 1 elemento desde el índice 1
numbers.splice(0)                 // borra todo desde el inicio
numbers.splice(1, 1, 555)         // reemplaza
numbers.splice(1, 1, 555, 333)    // reemplaza e inserta más
```

### sort(compareFunction)
- Ordena los elementos modificando el original.
- Si no se pasa `compareFunction`, ordena como **strings** (ojo: `[10, 2]` queda `[10, 2]`).

```js
const numbers = [3, 1, 4, 2]
numbers.sort()              // [1, 2, 3, 4]
numbers.sort((a, b) => b - a) // descendente

// Con strings (case-insensitive)
const words = ['Banana', 'apple', 'cherry']
words.sort((a, b) => a.localeCompare(b))
```

> **`compareFunction`**:
> - Negativo → `a` va antes que `b`
> - 0 → mantienen su posición
> - Positivo → `a` va después que `b`

### reverse()
- Invierte el orden del arreglo (modifica original).

```js
const arr = [1, 2, 3]
arr.reverse() // [3, 2, 1]
```

---

## Métodos que NO modifican el original (inmutables)

> Estos son los que vas a usar el 90% del tiempo en código moderno. Devuelven un **nuevo arreglo**.

### slice(start, end)
- Devuelve los elementos desde `start` hasta `end` (sin incluir `end`).
- Acepta índices negativos.

```js
const numbers = [1, 2, 3, 4]
numbers.slice(1, 2)  // [2]
numbers.slice(0, 3)  // [1, 2, 3]
numbers.slice(-2)    // [3, 4]
```

### toSpliced(start, deleteCount, item1, itemN)
- Igual que `splice` pero **NO modifica** el original.

```js
const numbers = [1, 2, 3, 4]
const result = numbers.toSpliced(1, 1, 555, 333)
// result   → [1, 555, 333, 3, 4]
// numbers  → [1, 2, 3, 4]
```

### toSorted(compareFunction)
- Igual que `sort` pero **NO modifica** el original.

```js
const numbers = [3, 1, 4, 2]
const sorted = numbers.toSorted()
console.log(sorted)  // [1, 2, 3, 4]
console.log(numbers) // [3, 1, 4, 2]
```

### toReversed()
- Igual que `reverse` pero **NO modifica** el original.

```js
const arr = [1, 2, 3]
const reversed = arr.toReversed() // [3, 2, 1]
```

### concat(...arrays)
- Une dos o más arreglos en uno nuevo.

```js
const a = [1, 2]
const b = [3, 4]
const c = a.concat(b)        // [1, 2, 3, 4]
const d = [...a, ...b]       // forma moderna con spread
```

### flat(depth) y flatMap(callback)
- `flat` aplana arreglos anidados.
- `flatMap` hace `map` y luego `flat(1)` en una sola pasada.

```js
[1, [2, [3, [4]]]].flat()      // [1, 2, [3, [4]]]
[1, [2, [3, [4]]]].flat(2)     // [1, 2, 3, [4]]
[1, [2, [3, [4]]]].flat(Infinity) // [1, 2, 3, 4]

const sentences = ['hola mundo', 'chau mundo']
sentences.flatMap(s => s.split(' ')) // ['hola', 'mundo', 'chau', 'mundo']
```

---

## Métodos de búsqueda

### includes(value)
- Devuelve `true` si el valor está presente.

```js
[1, 2, 3].includes(2) // true
```

### indexOf(value) / lastIndexOf(value)
- Devuelven el índice de la primera/última coincidencia. `-1` si no existe.

```js
['a', 'b', 'a'].indexOf('a')     // 0
['a', 'b', 'a'].lastIndexOf('a') // 2
```

### find(callback) / findLast(callback)
- Retornan el **primer (o último) elemento** que cumpla la condición.

```js
const numbers = [10, 20, 30, 40]
numbers.find(num => num > 25)     // 30
numbers.findLast(num => num > 25) // 40
```

### findIndex(callback) / findLastIndex(callback)
- Retornan el **índice** del primer (o último) elemento que cumpla la condición.

```js
const numbers = [10, 20, 30, 40]
numbers.findIndex(num => num > 25)     // 2
numbers.findLastIndex(num => num > 25) // 3
```

---

## Métodos de iteración (los más usados)

### forEach(callback)
- Ejecuta la función para **cada elemento**, pero **no retorna nada**.

```js
const numbers = [1, 2, 3]
numbers.forEach(num => console.log(num * 2))
```

### map(callback)
- Retorna **un nuevo array** con los valores transformados.
- **NO modifica** el original.

```js
const numbers = [1, 2, 3]
const doubled = numbers.map(num => num * 2) // [2, 4, 6]
```

### filter(callback)
- Retorna **un nuevo array** con los elementos que cumplen la condición.

```js
const numbers = [1, 2, 3, 4, 5]
const evens = numbers.filter(num => num % 2 === 0) // [2, 4]
```

### every(callback)
- Devuelve `true` si **todos** los elementos cumplen la condición.

```js
[2, 4, 6].every(n => n % 2 === 0) // true
```

### some(callback)
- Devuelve `true` si **al menos uno** cumple la condición.

```js
[2, 3, 6].some(n => n % 2 !== 0) // true
```

### reduce(callback, initialValue) / reduceRight(...)
- Reducen el array a un **único valor** aplicando una función acumuladora.

```js
const numbers = [1, 2, 3, 4]
const sum = numbers.reduce((acc, num) => acc + num, 0) // 10

const reversedConcat = numbers.reduceRight((acc, num) => acc + num, '') // '4321'

const fruits = ['manzana', 'banana', 'naranja', 'manzana', 'manzana', 'naranja'];



//Contar ocurrencias (Transformar un Array en un Objeto)
//Este es uno de los usos más clásicos. Imagina que tienes una lista de votos o inventario y quieres saber cuántos hay de cada uno.

const count = fruits.reduce((acc, fruit) => {
  // Si la fruta ya existe en el objeto, sumamos 1. Si no, la inicializamos en 1.
  if (acc[fruit]) {
    acc[fruit] += 1;
  } else {
    acc[fruit] = 1;
  }
  return acc; // SIEMPRE debes retornar el acumulador para la siguiente iteración
}, {}); // <-- OJO: Nuestro valor inicial ahora es un Objeto vacío {}

console.log(count); 
// Resultado: { manzana: 3, banana: 1, naranja: 2 }
//¿Qué pasa aquí? El acumulador (acc) empieza como un objeto vacío {}. En cada paso, revisamos si la fruta actual ya es una propiedad de ese objeto. Si lo es, le sumamos 1; si no, la creamos.




//2. Agrupar datos por una propiedad (Muy útil en la vida real)
//Imagina que recibes datos de una base de datos y necesitas organizarlos por categoría o por rol.
const people = [
  { name: 'Ana', role: 'admin' },
  { name: 'Luis', role: 'user' },
  { name: 'Carlos', role: 'admin' },
  { name: 'Marta', role: 'user' }
];

const groupedByRole = people.reduce((acc, person) => {
  const role = person.role;
  
  // Si el array para este rol aún no existe, lo creamos vacío
  if (!acc[role]) {
    acc[role] = [];
  }
  
  // Empujamos a la persona al array correspondiente
  acc[role].push(person.name);
  
  return acc;
}, {}); // Inicia como un objeto vacío {}

console.log(groupedByRole);
/* Resultado: 
{
  admin: ['Ana', 'Carlos'],
  user: ['Luis', 'Marta']
}
*/



//3. Encontrar el valor máximo (Omitiendo el valor inicial)
Si no le pasas el segundo parámetro a reduce (el valor inicial), automáticamente tomará el primer elemento del array como el acumulador inicial, y empezará a iterar desde el segundo elemento.
const scores = [45, 80, 22, 98, 12];

const highestScore = scores.reduce((acc, currentScore) => {
  // Si el puntaje actual es mayor que el que tenemos guardado (acc), 
  // el nuevo acumulador será el puntaje actual.
  return currentScore > acc ? currentScore : acc;
}); // <-- No hay valor inicial aquí

console.log(highestScore); // 98
//¿Qué pasa aquí? En la primera iteración, acc es 45 y currentScore es 80. Como 80 es mayor, el reduce retorna 80, y ese pasa a ser el nuevo acc para comparar con 22 en la siguiente vuelta.
```

---

## El nuevo `Object.groupBy()` (ES2024)

Agrupa los elementos de un arreglo según una clave devuelta por un callback. **Devuelve un objeto**.

- El método recibe dos argumentos:
	- El array que quieres procesar: En tu caso, products
	- Una función (callback): (p) => p.category. Esta función se ejecuta una vez por cada elemento (p representa cada producto individual) y debe devolver el valor, "criterio" o "etiqueta" por el que quieres agruparlos.

 El proceso detrás de escena:
1. JavaScript toma el primer producto (`Manzana`) y ejecuta tu función. La función devuelve el string `'fruta'`.
2. Crea automáticamente una propiedad llamada `'fruta'` en el objeto final y mete el objeto entero de la manzana dentro de un array.
3. Toma el segundo producto (`Pan`), la función devuelve `'panadería'`. Crea la propiedad `'panadería'` y mete el pan en su propio array.
4. Toma el tercer producto (`Pera`), la función devuelve `'fruta'`. Como esa propiedad ya fue creada en el paso 1, simplemente añade la pera al array que ya existe.

¿Por qué es tan genial?
Te ahorra tener que escribir toda la lógica manual que sí nos exige el `reduce`. Ya no tienes que:
- Pasar un objeto vacío inicial `{}`.
- Comprobar con un `if` si la categoría ya existe.
- Crear un array vacío `[]` si es la primera vez que ves esa categoría.
- Usar `push()` manualmente.
Esencialmente, abstrae toda esa lógica repetitiva en una sola línea de código, haciendo que tus archivos sean mucho más legibles y fáciles de mantener.

```js
const products = [
  { name: 'Manzana', category: 'fruta' },
  { name: 'Pan',     category: 'panadería' },
  { name: 'Pera',    category: 'fruta' },
  { name: 'Factura', category: 'panadería' }
]

const grouped = Object.groupBy(products, p => p.category)
/*
{
  fruta:     [{ name: 'Manzana', ... }, { name: 'Pera', ... }],
  panadería: [{ name: 'Pan', ... },     { name: 'Factura', ... }]
}
*/
```

---

## Tabla resumen: ¿modifica el original?

| Método | Modifica | Devuelve |
|---|---|---|
| `push` / `pop` / `shift` / `unshift` | ✅ Sí | longitud / elemento |
| `splice` / `sort` / `reverse` | ✅ Sí | varía |
| `slice` / `concat` / `flat` / `flatMap` | ❌ No | nuevo array |
| `toSpliced` / `toSorted` / `toReversed` / `with` | ❌ No | nuevo array |
| `map` / `filter` / `reduce` | ❌ No | nuevo valor |
| `find` / `findIndex` / `includes` / `every` / `some` | ❌ No | valor / boolean |
| `forEach` | ❌ No | `undefined` |

---

# Parte 2 — Métodos de String (rápido)

> Un string es un primitivo, pero JavaScript crea un objeto temporal **String** para poder usar métodos sobre él.

### split(separator, limit)

```js
let sentence = 'Hello world, this is JavaScript'
let words = sentence.split(' ')
// ['Hello', 'world,', 'this', 'is', 'JavaScript']
```

### join(separator)

```js
let words = ['Hello', 'world,', 'this', 'is', 'JavaScript']
words.join(' ') // 'Hello world, this is JavaScript'
```

### replace(pattern, replacement) / replaceAll(pattern, replacement)

```js
'I am learning JavaScript'.replace('JavaScript', 'TypeScript')
'123-456-7890'.replaceAll('-', '') // '1234567890'
```

### Otros útiles

```js
'  hola  '.trim()              // 'hola'
'hola'.padStart(6, '*')        // '**hola'
'hola'.padEnd(6, '*')          // 'hola**'
'hola'.repeat(3)               // 'holaholahola'
'JavaScript'.startsWith('Java')// true
'JavaScript'.endsWith('Script')// true
'JavaScript'.includes('Scr')   // true
```

```js
let emailInput = "Usuario@Correo.com";
let normalizedEmail = emailInput.toLowerCase(); 
// 'usuario@correo.com'

let shout = "silencio".toUpperCase(); 
// 'SILENCIO'
```

```js
let url = "https://www.google.com";

// Cortar desde el índice 12 en adelante
let domain = url.slice(12); 
// 'google.com'

// Cortar los últimos 4 caracteres
let extension = url.slice(-4); 
// '.com'
```

```js
let phrase = "Buscando a Nemo en el océano";

let pos = phrase.indexOf('Nemo'); 
// 11 (Empieza en el índice 11)

let notFound = phrase.indexOf('Dory'); 
// -1
```

```js
let word = "JavaScript";

console.log(word.at(0));  // 'J'
console.log(word.at(-1)); // 't' (¡La última letra!)
console.log(word.at(-2)); // 'p' (La penúltima)
```

**`match(regex)`**: Si necesitas buscar algo que no es un texto exacto, sino un patrón (por ejemplo, buscar si hay algún número en el string, o extraer todos los emails de un párrafo).
```js
let text = "Mi número es 123 y el de Juan es 456.";
let numbers = text.match(/\d+/g); 
// ['123', '456'] (Extrae todos los grupos de números)
```
---

# Parte 3 — Objetos

## ¿Qué es un objeto?

Un **objeto** es una colección de **pares clave-valor** (también llamadas *propiedades*). A diferencia de un arreglo (donde el "índice" es un número), en un objeto la clave suele ser un **string** que describe semánticamente el dato.

```js
const persona = {
  nombre: 'Juan',
  edad: 30,
  esAdmin: false
}

persona.nombre        // 'Juan'      (notación punto)
persona['edad']       // 30          (notación corchetes)
```

### ¿Cuándo usar arreglo vs objeto?

| Necesidad | Estructura |
|---|---|
| Una lista ordenada de cosas del mismo tipo | **Arreglo** |
| Una entidad con atributos nombrados | **Objeto** |
| Una lista de entidades | **Arreglo de objetos** |

---

## Objetos literales

Es la forma más usada de crear un objeto:

```js
const myCat = {
  name: 'Michi',
  color: 'White',
  age: 2,
  meow() {
    console.log('Meow!')
  }
}

console.log(myCat)
console.log(myCat.color)
myCat.meow()
```

### Sintaxis moderna útil dentro de objetos literales

```js
const name = 'Michi'
const age = 2

// Shorthand: cuando la clave y la variable se llaman igual
const cat1 = { name, age }
// equivale a: { name: name, age: age }

// Métodos abreviados
const cat2 = {
  name,
  meow() { console.log('Meow!') } // en vez de meow: function() {...}
}

// Computed property names (clave dinámica)
const key = 'color'
const cat3 = { [key]: 'white' } // { color: 'white' }

let formState = {
  username: '',
  email: '',
  password: ''
};

// Esta función se ejecuta cada vez que el usuario teclea algo
function handleInputChange(event) {
  // event.target.name podría ser 'email', 'username', etc.
  const fieldName = event.target.name; 
  const newValue = event.target.value;

  // Actualizamos el estado de forma dinámica
  formState = {
    ...formState, // Mantenemos lo que ya estaba
    [fieldName]: newValue // Sobrescribimos SOLO la propiedad que cambió
  };
  
  
// constants.js
const THEME_PREF = 'user_theme_preference';
const LANG_PREF = 'user_language';

// settings.js
const defaultSettings = {
  [THEME_PREF]: 'dark',
  [LANG_PREF]: 'es-AR',
  notificationsEnabled: true
};

console.log(defaultSettings.user_theme_preference); // 'dark'
}
```

---

## Clases y constructores (POO básica)

### Clases
- Brindan un **molde** o plantilla para crear objetos.
- No representan un objeto en particular, sino una **categoría** de objetos.
- Definen qué **propiedades** y qué **comportamientos (métodos)** tendrán las instancias.

### Constructores
- El `constructor` es una función especial dentro de la clase que se ejecuta al **instanciar** un nuevo objeto con `new`.
- **Instanciar** un objeto = crear un objeto concreto a partir de una clase.

```js
class Pet {
  constructor(name, specie, color, age) {
    this.name = name
    this.specie = specie
    this.color = color
    this.age = age
  }

  // Método de instancia
  describe() {
    return `${this.name} es un ${this.specie} de color ${this.color} y tiene ${this.age} años.`
  }
}

const myDog = new Pet('Puki', 'Perro', 'Negro', 14)
const myCat = new Pet('Michi', 'Gato', 'Blanco', 2)

console.log(myDog.describe())
// "Puki es un Perro de color Negro y tiene 14 años."
```

### Resumen
- Una **CLASE** es el molde.
- Un **OBJETO** (o instancia) es lo que creamos con `new` a partir de la clase.
- `this` dentro de la clase hace referencia a **la instancia** que se está creando o usando.

---

## Métodos estáticos (`static`)

- Un método o propiedad declarada con `static` **pertenece a la clase**, no a una instancia.
- Se invocan directamente sobre la clase, sin necesidad de hacer `new`.

```js
class Calculadora {
  static sumar(a, b) {
    return a + b
  }

  static PI = 3.14159
}

Calculadora.sumar(2, 3) // 5
Calculadora.PI          // 3.14159
```

> **Built-in objects** que ya usás todo el tiempo funcionan así:
> - `Math.PI`, `Math.max(1, 2, 3)`, `Math.random()`
> - `Array.from(...)`, `Array.of(...)`
> - `Object.keys(...)`, `Object.entries(...)`, `JSON.parse(...)`

```js
// Ejemplo 1: `Array.from()` (El convertidor universal)
const word = "Michi";
const letters = Array.from(word);

console.log(letters); 
// Resultado: ['M', 'i', 'c', 'h', 'i']

// Ejemplo 2: El caso de uso más real (El DOM)
// Digamos que seleccionas todos los botones de tu página
const buttonsNodeList = document.querySelectorAll('button');

// Lo conviertes a un array real para poder manipularlo
const buttonsArray = Array.from(buttonsNodeList);

buttonsArray.map(btn => console.log(btn.textContent));

// Ejemplo 3: Crear secuencias numéricas (El superpoder)
// Crea un array de 5 posiciones y llénalo con números del 1 al 5
const numbers = Array.from({ length: 5 }, (_, index) => index + 1);

console.log(numbers); 
// Resultado: [1, 2, 3, 4, 5]
```

```js
//2. Array.of() (El creador seguro)
//A primera vista, Array.of() parece redundante. ¿Por qué usarlo si puedes escribir [1, 2, 3]? La respuesta es que soluciona un error de diseño muy antiguo del constructor tradicional Array().
const normal = new Array(3, 4, 5); // Crea [3, 4, 5] - Todo bien
const weird = new Array(3);        // ¡Peligro! Crea un array vacío de 3 posiciones: [empty × 3]


const arr1 = Array.of(3, 4, 5);
console.log(arr1); // [3, 4, 5]

const arr2 = Array.of(3);
console.log(arr2); // [3] (¡Ahora sí es un array con el número 3 adentro!)

const arr3 = Array.of("Hola");
console.log(arr3); // ["Hola"]
```

```js
//3. Object.keys() (El extractor de llaves)
//Toma un objeto y te devuelve un Array con los nombres de todas sus propiedades (sus "llaves" o claves). Es indispensable porque los objetos en JavaScript no se pueden recorrer directamente con un .map() o .filter().
const user = {
  id: 101,
  name: "Ana",
  role: "admin"
};

const keys = Object.keys(user);

console.log(keys); 
// Resultado: ['id', 'name', 'role']



// Comprobar si un objeto está vacío
const emptyObj = {};

if (Object.keys(emptyObj).length === 0) {
  console.log("El objeto está totalmente vacío");
}



// Recorrer un objeto (Iteración)
const prices = { apple: 2, banana: 1, orange: 3 };

// Duplicamos todos los precios
Object.keys(prices).forEach(key => {
  prices[key] = prices[key] * 2;
});

console.log(prices); 
// Resultado: { apple: 4, banana: 2, orange: 6 }
```

```js
// Ejemplo Object.values

const cartTotals = {
  shoes: 120,
  shirt: 45,
  socks: 15,
  hat: 30
};

// Obtenemos solo los números: [120, 45, 15, 30]
const pricesOnly = Object.values(cartTotals);

// Usamos el confiable reduce para sumarlos
const grandTotal = pricesOnly.reduce((acc, price) => acc + price, 0);

console.log(`El total a pagar es: $${grandTotal}`); 
// Resultado: El total a pagar es: $210
```

```js
//Ejemplo Object.entries

const laptopSpecs = {
  brand: "Apple",
  model: "MacBook Pro",
  ram: "16GB",
  storage: "512GB SSD"
};

// entries será: [['brand', 'Apple'], ['model', 'MacBook Pro'], ...]
const entries = Object.entries(laptopSpecs);

// Usamos desestructuración [key, value] directamente en el parámetro
entries.forEach(([key, value]) => {
  // Convertimos la llave a mayúsculas para presentación
  const displayKey = key.toUpperCase();
  console.log(`- ${displayKey}: ${value}`);
});

/* Resultado:
- BRAND: Apple
- MODEL: MacBook Pro
- RAM: 16GB
- STORAGE: 512GB SSD
*/
```

---

# Parte 4 — Características modernas de Objetos

## Object: métodos estáticos clave

```js
const user = { name: 'Ana', age: 25, role: 'admin' }

Object.keys(user)    // ['name', 'age', 'role']
Object.values(user)  // ['Ana', 25, 'admin']
Object.entries(user) // [['name', 'Ana'], ['age', 25], ['role', 'admin']]
```

### `Object.fromEntries`

Hace lo inverso de `Object.entries`. Súper útil combinado con `map`/`filter`:

```js
const entries = [['name', 'Ana'], ['age', 25]]
Object.fromEntries(entries) // { name: 'Ana', age: 25 }

// Convertir un Map a objeto
const map = new Map([['a', 1], ['b', 2]])
Object.fromEntries(map) // { a: 1, b: 2 }

// Filtrar propiedades de un objeto
const filtered = Object.fromEntries(
  Object.entries(user).filter(([_, v]) => typeof v === 'string')
)
```

### `Object.assign(target, ...sources)`

Copia propiedades de uno o más objetos hacia un objeto destino.

```js
const base = { a: 1, b: 2 }
const extra = { b: 99, c: 3 }
const merged = Object.assign({}, base, extra) // { a: 1, b: 99, c: 3 }
```

### `structuredClone(obj)`

Hace una **copia profunda** de un objeto (incluso anidados). Antes había que recurrir a `JSON.parse(JSON.stringify(obj))`.

```js
const original = { user: { name: 'Ana', tags: ['admin'] } }
const copia = structuredClone(original)
copia.user.tags.push('dev')

console.log(original.user.tags) // ['admin']        ← intacto
console.log(copia.user.tags)    // ['admin', 'dev']
```

---

## Spread y Rest en objetos

### Spread (`...`) — copiar y combinar

```js
const persona = { nombre: 'Ana', edad: 25 }
const personaConRol = { ...persona, rol: 'admin' }
// { nombre: 'Ana', edad: 25, rol: 'admin' }

// El último valor gana en colisión:
const a = { x: 1, y: 2 }
const b = { y: 99, z: 3 }
const c = { ...a, ...b } // { x: 1, y: 99, z: 3 }
```

### Rest (`...`) — agrupar el resto

```js
const persona = { nombre: 'Ana', edad: 25, rol: 'admin' }
const { nombre, ...resto } = persona
// nombre → 'Ana'
// resto  → { edad: 25, rol: 'admin' }
```

> **Diferencia clave**:
> - **Spread** se usa para **expandir/copiar**.
> - **Rest** se usa para **agrupar** lo que sobra en una variable.

---

## Destructuring (asignación por desestructuración)

### En objetos

```js
const person = { fullname: 'Juan Perez', age: 53 }

// Sin destructuring
const age = person.age
const fullname = person.fullname

// Con destructuring
const { age, fullname } = person

// Renombrando
const { age: edad, fullname: nombreCompleto } = person

// Con valor por defecto
const { city = 'Desconocida' } = person
```

### En funciones

```js
function sum({ num1, num2 }) {
  return num1 + num2
}

sum({ num1: 3, num2: 17 }) // 20
```

### En arreglos

```js
const scores = [1, 2, 3, 4]
const [first, second, ...rest] = scores
// first → 1
// second → 2
// rest   → [3, 4]
```

---

## Optional chaining (`?.`)

Permite acceder a propiedades anidadas **sin reventar** si una intermedia es `null` o `undefined`.

```js
const user = { name: 'Ana' }

// Sin optional chaining
const city = user && user.address && user.address.city

// Con optional chaining
const city = user?.address?.city // undefined (no rompe)

// También funciona con métodos y arreglos
user?.greet?.()     // llama greet() si existe
user?.tags?.[0]     // accede al primer tag si existe
```

---

## Nullish coalescing (`??`) y `??=`

`??` devuelve el lado derecho **solo si** el izquierdo es `null` o `undefined`. A diferencia de `||`, **NO** se activa con `0`, `''` ni `false`.

```js
const cantidad = 0
cantidad || 10   // 10  ❌ (0 es falsy)
cantidad ?? 10   // 0   ✅ (0 es un valor válido)

const nombre = null
nombre ?? 'Anónimo' // 'Anónimo'

// Asignación nullish
const config = {}
config.timeout ??= 5000 // asigna solo si es null/undefined
```

---

## Rest operator en funciones (recordatorio)

```js
function sum(...numbers) {
  return numbers.reduce((acc, n) => acc + n, 0)
}

sum(1, 2, 3, 4, 5) // 15
sum(10, 20)        // 30
sum()              // 0
```

## Spread operator esparciendo arreglos como argumentos

```js
const scores = [12, 54, 0, 154, 28]

// Sin spread
Math.max(scores[0], scores[1], scores[2], scores[3], scores[4])

// Con spread
Math.max(...scores) // 154
```
