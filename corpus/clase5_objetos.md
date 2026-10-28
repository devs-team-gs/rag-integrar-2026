
## Clases y constructores
### Clases
- Brindan un modelo o **molde** para trabajar.
- No nos hablan de un escenario o elemento en particular.
- Se centran en decir qué propiedad tendrá nuestro molde

### Constructores
- Un constructor nos permite **instanciar** cada uno de nuestros objetos.
- Son muy parecidos a las funciones, pero se comportan de manera muy distinta.
- Instanciar un objeto se refiere a la acción de crear un nuevo objeto a partir de una clase.

```js
class Pet {
  constructor(name, specie, color, age) {
    this.name = name
    this.specie = "Dog"
    this.color = "Black"
    this.age = 14
  }
}

const myDog = new Pet('Puki', 'Dog', 'Black', 14)
const myCat = new Pet('Michi', 'Cat', 'White', 2)
console.log(myCat)
console.log('--------------------')
console.log(myDog.color)
```

### Resumen
- Las **CLASES** funcionan como moldes de los cuales puedo crear **objetos**.
- Un **OBJETO** o instanciación de un objeto se crea a partir de una **clase** (nuestro molde).

```js
class Pet {
  constructor(name, specie, color, breed) {
    this.name = name
    this.specie = specie
    this.color = color
    this.breed = breed
  }
}

const cat = new Cat('Pelusa', 'gato', 'Naranja', 'raza naranja')


// Ahora necesito crear un dueño para mi mascota
```

---
## Objetos literales
- Es una de las formas más usadas para definir un objeto en JavaScript.
```js
const myCat = OBJETO LITERAL

console.log(myCat)
console.log(myCat.color)
```

---
## Built-in Objects
- En JavaScript hay objetos que existen por defecto y los podemos utilizar. Entre ellos podemos encontrar:
	- Array, Number, Date, Boolean, String, Math, Set, etc...
- Estos objetos poseen propiedades y métodos **ESTÁTICOS** a los cuales podemos acceder y de esa forma utilizarlos en nuestro código. Por ejemplo:
	- `Math.PI `=> nos devuelve el valor del número Pi (3.14159…)
	- `Math.max(n1,n2,n3,...,nx)` => nos devuelve el máximo número de todos los argumentos que le pasemos al método

---
## Static methods
- Podemos declarar un método o propiedad como **STATIC**. 
- Al hacerlo dicho método o propiedad puede ser utilizada sin la necesidad de tener una instancia de la clase (es decir un objeto creado a partir de nuestra clase) 
- Para utilizarlo simplemente agregamos la palabra reservada **STATIC** antes del nombre del método o propiedad correspondiente.
```js
class Calculadora{
	CÓDIGO
}
```

---
## Rest operator
- Es un operador de JavaScript que nos permite condensar el resto de variables o parámetros de una función en una sola variable.
- Es ampliamente usado para simplificar la declaración de variables cuando sea necesario.
- Para utilizarlo agregamos el operador (`...`) delante del nombre de la variable donde queremos condensar el resto de valores
```js
function sum(...numbers){
  let result = 0
  numbers.forEach((number) => result += number)
  return result
}
console.log(sum(1,2,3,4,5)) // 15
console.log(sum(10,20)) // 30
console.log(sum()) // 0
```

---
## Destructuring
- El destructuring **nos permite extraer propiedades de un objeto** de una forma más condensada.
- Nos sirve también para poder **pasar argumentos a una función** de una forma más cómoda.
- La mejor forma de ver su sintaxis (como utilizarlo) es con ejemplos
```js
// DESTRUCTURING EN OBJETOS
const person = {
	fullname: 'Juan Perez',
	age: 53
}

// Sin destructuring
const age = person.age
const fullname = person.fullname

// Con destructuring
const { age, fullname: personFullname } = person


// DESTRUCTURING EN FUNCIONES
function sum(num1, num2) {
	reurn num1 + num2
}

const result = sum(3, 17)


function sum({num1, num2}) {
	reurn num1 + num2
}

const result = sum({num1: 3, num2: 17})


// DESTRUCTURING EN ARREGLOS
const scores = [1,2,3,4]
const [first, second, ...restOfNumbers] = scores // hacemos uso del rest operator también
console.log(first)
console.log(restOfNumbers)

// También se puede usar el destructuring junto al rest operator en objetos
const person = {
	fullname: 'Juan Perez',
	age: 53,
	address: 'calle 123'
}
const { age, ...rest } = person
console.log(rest) // { fullname: 'Juan Perez', address: 'calle 123' }
```

---
## Spread operator
- Es un operador de JavaScript que nos permite esparcir (separar o extender) un arreglo u objeto.
- Al utilizarlo rompemos la estructura que tiene por defecto con el fin de obtener sus valores separados.
- Es útil cuando necesitamos pasar los elementos de un arreglo como si fueran argumentos independientes uno del otro.
- Un buen ejemplo es el método estático **Math.max()**
```js
const scores = [12, 54, 0, 154, 28]

// Sin spread operator
function maxNumberOfFIveElements(numbers) {
	return Math.max(numbers[0], numbers[1], numbers[2], numbers[3], numbers[4])
}

const resutl = maxNumberOfFIveElements(scores)

// Con spread operator
function maxNumberOfArray(numbers) {
	return Math.max(...numbers)
}

const resutl = maxNumberOfFIveElements(scores)
```


- El **spread operator** (`...`) en JavaScript se usa para copiar o expandir elementos de un iterable (como un array u objeto) en un nuevo contexto.
- El **rest operator** (`...`) se usa en la **desestructuración** para obtener el resto de las propiedades o elementos en una variable.

---
