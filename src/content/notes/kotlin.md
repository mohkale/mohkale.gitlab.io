---
title: kotlin
date: 2020-07-15
---

- TODO reified types

```kotlin
/*
 * The top of the file should start with the current package namespace.
*/
package moe.kisara.learn

// then any desired imports, by default kotlin auto imports these.
import kotlin.*
import kotlin.annotations.*
import kotlin.collections.*
import kotlin.comparisons.*
import kotlin.io.*
import kotlin.ranges.*
import kotlin.sequences.*
import kotlin.text.*

// when targeting the java platform these are also imported
import java.lang.*
import kotlin.jvm.*

// you can alias an import to some other identifier
import moe.kisara.learn.List as KisaraList
```

## Variable Declarations
Kotlin isn't restricted to classes like Java, you can declare functions or variables
outside of a class and access it with the local package scope. You can even declare
functions outside of a class.

```kotlin
// you can declare variables as mutable or immutable
var fooString = "foo"
val barString = "bar"

fooString = "not foo"
// barString = "not bar" // error: val cannot be reassigned

// The type of a declaration can be specified before the assignment.
// this is required when you don't have an initial value bot otherwise
// can be ommited and inferred by the type system.
var myString: String
myString = "hello"

fun hello(name: String) {
  println("hello $name")
}
```

## Access Specifiers
| Keyword     | Inside  | Description                                                                        |
|-------------|---------|------------------------------------------------------------------------------------|
| `private`   | Package | Available only within the file in which it is declared (like **c**s `static`).     |
| `protected` | Package | N/A                                                                                |
| `internal`  | Package | visible everywhere in the same module.                                             |
| `public`    | Package | visible everywhere.                                                                                   |
| `private`   | Class   | visible to this class only.                                                        |
| `protected` | Class   | `private` and available to subclasses.                                             |
| `internal`  | Class   | anything that can see this class (in this module), can see its `internal` members. |
| `public`    | Class   | anything that can see this class, can see its `public` members.                    |

{{< notify "warn" "the definition of module isn't really clear. See [here](https://stackoverflow.com/questions/35271413)" >}}

## Types
kotlin has many builtin types, mostly the same as java, but there are
some newer types as well. It continues the traditional:
- `String`
- `Char`

and has both the original **signed** numeric types and some new **unsigned** types:

| Type     | Bits | Minimum Value            | Maximum Value                          |
|----------|------|--------------------------|----------------------------------------|
| `Byte`   | 8    | $$-2^7$$                 | $$2^7-1$$                              |
| `Short`  | 16   | $$-2^{15}$$              | $$2^{15}-1$$                           |
| `Int`    | 32   | $$-2^{31}$$              | $$2^{31}-1$$                           |
| `Long`   | 64   | $$-2^{63}$$              | $$2^{63}-1$$                           |
| `UByte`  | 8    | 0                        | $$2^8-1$$                              |
| `UShort` | 16   | 0                        | $$2^{16}-1$$                           |
| `UInt`   | 32   | 0                        | $$2^{32}-1$$                           |
| `ULong`  | 64   | 0                        | $$2^{64}-1$$                           |
| `Float`  | 32   | $$1.4 \times 10^{-45}$$  | $$3.4028235 \times 10^{38}$$           |
| `Double` | 64   | $$4.9 \times 10^{-324}$$ | $$1.7976931348623157 \times 10^{308}$$ |

```kotlin
// Kotlin also introduces a new compact `Range` type like rubys slice.
for (i in 1..10) {
  println(i)
}

// these can be used to retrieve subsections of collections or strings
"hello".slice(1..2) // "el"
```

### Higher Order Functions
You can even store more complex types as variables, such as functions:

```kotlin
fun addInt(a: Int, b: Int): Int {
    return a + b
}

// store addInt to the variable myAddFunction
val myAddFunction: (Int, Int) -> Int = ::addInt
val op1: Int = 5
val op2: Int = 2

println("$op1 + $op2 = ${myAddFunction(op1, op2)}") // 5 + 2 = 7
```

{{< notify "note" "the `::` namespace operator lets you extract methods from the current scope or an object instance." >}}

Or even functions with reciever types; where you can call a method on an instance as
if the method belonged to the instance. NOTE there's
[multiple](https://kotlinlang.org/docs/reference/lambdas.html#invoking-a-function-type-instance)
ways to invoke such a function call, I've just shown the cleanest.

```kotlin
fun runAdd(func: Int.(Int) -> Int, op1: Int, op2: Int): Int {
  return op1.func(op2)
}

println("$op1 + $op2 = ${runAdd(Int::plus, op1, op2)}") // 5 + 2 = 7
```

### Nullable Types
Kotlin supports nullable types, but not implicitly. A value declaration like `var foo: String`
doesn't give the variable `foo` a value of `null` like java. Instead you must assign
`foo` before it's used or a compilation exception will be issued.

```kotlin
// nullable types are declared by suffixing it with ?
var foo: String? = null

// There are some syntax extensions to make working with null easier.
foo?.length // null if foo is null, else runs `foo.length`

// The `elvis` operator lets you quickly run an `if not null` expression.
foo ?: throw Exception("foo is unassigned")

// you can force a NullPointerException if `foo` is null
foo!!
```


### Type Casts
Kotlin implictly casts the argument of an `is` expression to the compared type within
the body of the following expression. This lets you do the following.

```kotlin
var bar: Any = "hello"

if (bar is String) {
  // implicit type cast to String within body
  println("$bar is ${bar.length} chars long")
}
```

You can also unsafely force a cast or try to perform a cast and then store null if
the cast fails.

```kotlin
val foo: String = "hello"
// val bar: Int = foo as Int // runtime-error: cannot cast string to int
val bar: Int? = foo as? Int // cast failed, bar is null
```

### Conversions
Explicit conversions don't happen in kotlin, instead each number has the following
explicit cast methods.
- `toByte()`
- `toShort()`
- `toInt()`
- `toLong()`
- `toFloat()`
- `toDouble()`
- `toChar()`

### Operators
Kotlin supports all of the basic comparison and summation operators from java. It
takes the python approach of *magic* methods, where if a class has a method with a
given name and is declared with the `operator` keyword then an operator call will be
substituted for the function call. An exhaustive list of such method names can be
found [here][operator-overloading].

[operator-overloading]: https://kotlinlang.org/docs/reference/operator-overloading.html

Kotlin substitutes `a == b` for `a.equals(b)`. The Java operator which compares
references between `a` and `b` is instead implemented as `a === b`.

bit operators have been abandoned, you instead have the following functions to
replicate the given affects.

| Function | Deprectated Operand       | Description              |
|----------|---------------------------|--------------------------|
| `shl`    | `<<`                      | Bit Shift Left           |
| `shr`    | `>>`                      | Bit Shift Right          |
| `ushr`   | `>>`                      | Unsigned Bit Shift Right |
| `and`    | `&&`                      | Bit Wise And             |
| `or`     | <code>&#124;&#124;</code> | Bit Wise Or              |
| `xor`    | `^`                       | Exclusive Or             |
| `inv`    | `~`                       | Bitwise Inversion        |

```kotlin
println(1 shl 2) // 4
```

### Generics
kotlin has simply generic rules based on *producers* and *consumers*. A type such as
`out T` is a producer, we can read values of type `T` from it. A type such as `in T`
is a `consumer` and can take values of type `T`.

```kotlin
fun copy(from: Array<out Any>, to: Array<Any>) {
    assert(from.size == to.size)
    for (i in from.indices)
        to[i] = from[i]
}

val ints: Array<Int> = arrayOf(1, 2, 3)
val any = Array<Any>(3) { "" }
copy(ints, any)
```

```kotlin
fun fill(dest: Array<in String>, value: String) {
    for (i in dest.indices) {
        dest[i] = value
    }
}
```

Any generic parameter can be declared with an upper bound, meaning any type you
supply for it must derive at least the given type.

```kotlin
// any T must be Comparable.
fun <T : Comparable<T>> sort(list: List<T>) { ... }

// To supple multiple upper bounds you have to use a where clause.
fun <T> copyWhenGreater(list: List<T>, threshold: T): List<String>
    where T : CharSequence,
          T : Comparable<T> {
    ...
}
```

There's also a wildcard generic which accepts any type. TODO expand.

```kotlin
fun takeAnyList(list: List<*>) { ... }
```

## Loops
### For Loops
Kotlin lacks support for `c` style for loops, but instead supports javas `foreach`
style loops based on the `Iterator` interface. This coupled with extension methods
lets you use a mixture of python like range statements.

```kotlin
fun demoLoop() {
  for (var i in 10 downTo 0 step 2) {
    print("$i ")
  }
}

demoLoop() // 10 8 6 4 2 0
```

### While Loops

```kotlin
var x = 0
while (x < 10) {
  println(x++)
}
```

### Do While Loops
```kotlin
var x = 10
do {
  println(x++)
} while (x < 10)
```

## Functions
### Extensions
You can define an **extension** method on an existing type just like ruby.

```kotlin
fun Int.printMe() {
  println("this is $this")
}

5.printMe() // this is 5
```

However if the type identifier for an extension matches a member function (one
declared in the body of the type declaration) then the member function takes
precedence over the extension one.

```kotlin
fun Int.toString(): String {
  return "a number"
}

println("this is ${5.toString()}") // this is 5
```

### Optional Arguments
```kotlin
fun add(a: Int, b: Int = 1): Int {
  return a + b
}

println(add(5, 2)) // 7
println(add(5, b=3)) // 8
```

### Varargs
```kotlin
fun printMe(vararg args: Any) {
  // args is an array of Any: Any[]
  for (arg in args) {
    println(arg)
  }
}

printMe("hello", "world", 5)
printMe(*arrayOf("hello", "world", 5)) // spread an array
```

### Lambdas
Kotlin supports both lambdas, and annonymous functions.

```kotlin
fun runMe(func: () -> Unit) {
    func()
}

// An annoymous function is just a function without a name.
runMe(fun() { println("I'm being run") }) // I'm being run

/*
 * if the last argument of a function is a function, then
 * you can supply this function in its own block outside of
 * the () as a lambda.
*/
runMe { println("I'm being run") } // I'm being run

/*
 * if a lambda function takes just one argument, that argument
 * can be accessed as `it` within the lambda body.
*/
fun runMeWithInt(i: Int, func: (Int) -> Unit) {
  func(i)
}

runMeWithInt(5) { println(it + 2) }
```

Returning from an anonymous function exits the anonymous function. Returning from a
lambda returns the enclosing function.

```kotlin
fun returnsFirstLambda(l: List<Int>): Int {
    l.map { return it }
    return -1
}

fun returnsFirstAnon(l: List<Int>): Int {
    l.map(fun(i: Int): Int { return i })
    return -1
}

val list = listOf(1,2,3,4,5)
returnsFirstLambda(list) // 1
returnsFirstAnon(list) // -1
```

### Infix
The [range]({{< relref "#for-loops" >}}) expression from before is an example of an
`infix` function. We can omit the leading `.` and the `()` to construct a cleaner
syntax.

```kotlin
infix fun Int.addNum(i: Int): Int {
  return this + i
}

5.addNum(3) // 8
5 addNum 3  // 8
```

You can only construct infix expressions when:
- the method is defined with a reciever type.
- the method has exactly one required parameter.

### Tail Recursion
Tail recursion isn't implicit, for a recursive function to gain the benefits of
[tail recursion][tailrec] it must be prefixed with `tailrec`.

[tailrec]: https://kotlinlang.org/docs/reference/functions.html#tail-recursive-functions

## Other Expressions
Kotlin lacks ternary expressions, `if else` functions as an expression type.

```kotlin
val i = true
println(if (i) "true" else "not true")
```

Pattern matching is done through the `when` expression.

```kotlin
val foo: Any = "hello"

when (foo) {
  is Double -> println("is Double")
  !is String -> println("isn't String")
  2 -> println("is 2")
  else -> {
    println("otherwise")
  }
}
```

The `with` expression lets you run methods without prefixing with the reciever type.

```kotlin
with(6) { "value is: ${toString()}" } // value is: 6
```

```kotlin
// You can alias a complex type using the `typealias` keyword.
// For example you could alias a function to something nicer.

typealias Stringifier<T> = T.() -> String
var s: Stringifier<String> = String::toString
s("hello world") // hello world
```

```kotlin
// the let function lets you bypass the need for an intermediate
// variable name. run some processes on an instance and then return
// the result.
5.let { it+6 } // 11

// with is a function which executes block with `this` as reciever and
// returns the result.
with(5) { this+6 } // 11

// the run function is the same, except it doesn't pass the instance
// as an argument, it instead passes it as a reciever.
5.run { this+6 } // 11

data class Person(var name: String, var age: Int)

// apply runs the passed lambda with this as the reciever and then
// returns the original instance (ignoring the result of the lambda).
Person("Adam", 20).apply {
    age = 25
    name = "Bruce"
}

// same as apply but `this` is passed as an instance.
Person("Adam", 20).also {
    it.age = 25
    it.name = "Bruce"
}


```

## Collections
Kotlin supports all the same collections as java. Including functions to make
constructing them easier. By default these functions create immutable instances of
these collections and have mutable alternatives. There are:

| Collection | Immutable Creator | Mutable Creator | Description                                                |
|------------|-------------------|-----------------|------------------------------------------------------------|
| List       | `listOf`          | `mutableListOf` | A non-finite collection of a fixed type.                   |
| Set        | `setOf`           | `mutableSetOf`  | A non-finite collection of uniqe elements of a fixed type. |
| Map        | `mapOf`           | `mutableMapOf`  | A mapping of keys of one type to entries of another type.  |
| Array      |                   | `arrayOf`       | A fixed size linear collection of a fixed type.                                                           |


```kotlin
val myList = listOf("foo", "bar", "baz") // immutable List<String>
myList.get(0) // "foo"
myList.getOrElse(10, "bag") // "bag"
myList[0] // foo
// myList.set(0, "bar") // unresolved function

val myMutableList = mutableListOf("foo", "bar", "baz")
myMutableList.set(0, "bar") // unresolved function

val myMap = mapOf("foo" to 0, "bar" to 1, "baz" to 2)
myMap["foo"] // 0
```

{{< notify "warn" "using the `key to value` syntax constructs a new pair instance for each element of the map. A less memory intensive approach would be." >}}

```kotlin
mutableMapOf<String, Int>().apply {
  this["foo"] = 0
  this["bar"] = 1
  this["baz"] = 2
}
```

### Constructors
The constructors of each of these classes let you pass lambdas to automate
construction. For example `List` takes a lambda which accepts the index and
returns the entry.

```kotlin
List(5) { i -> i * i } // [0, 1, 4, 9, 16]
```

### Operators
Kotlin supports running operators directly on collections, so you can do something
like:

```kotlin
val list = listOf(1, 2, 3)
list + 4 // [1, 2, 3, 4]
list - 3 // [1, 2]
list - listOf(1, 2) // [3]
```

### Member Functions
Collections have a rich set of function oriented methods for simplicity. These
include simple loops, mapping, filtering, sorting or converting to other collection
types.

{{< notify "note" "the `ed` suffixed functions such as `sorted` return a new collection with the transformation applied to them. The others mutate the existing collection, such as `sort`." >}}

{{< notify "note" "the `to` suffixed functions let you specify a destination to apply the operation into." >}}

```kotlin
mapOf("foo" to 1, "bar" to 1, "baz" to 2).forEach { key, value ->
  println("$key -> $value")
}

listOf("foo", "bar", "baz").map { println(it) }

Array(8) { it }.filter { it % 2 == 0 } // [0, 2, 4, 6]

val list = (1..5).toMutableList() // [1, 2, 3, 4, 5]

list.shuffled() // [5, 1, 3, 2, 4]

list.sorted() // [1, 2, 3, 4, 5]
list.sorted().reversed() // [5, 4, 3, 2, 1]

/* you can specify you're own comparator for sorting */
list.sortedWith(Comparator { a, b -> if (a < b) +1 else -1 }) // [5, 4, 3, 2, 1]
list.sortedWith(compareBy { it * -1 }) // [5, 4, 3, 2, 1]

/* The `By` suffixed functions first map each entry through
   the lambda and compares using the result. */
listOf("aaa", "bb", "c").sortedBy { it.length } // [c, bb, aaa]

/* the `as` prefixed series of functions return a new List which is
   interfaced to the same underlying list but ordered differently. */
val reversedList = list.asReversed()
reversedList // [5, 4, 3, 2, 1]
list // [1, 2, 3, 4, 5]
list.add(6)
list // [1, 2, 3, 4, 5, 6]
reversedList [6, 5, 4, 3, 2, 1]

/* true if at least one element passes predicate */
list.any { it == 1 }

/* true if no element passes predicate */
list.none { it > 10 }

/* true if every element passes predicate */
list.all { it < 10 }

/* associations convert a list to a map */
fun Int.square(): Int { return this * this }

list.associateWith { it.square() } // {1=1, 2=4, 3=9, 4=16, 5=25}
list.associateBy   { it.square() } // {1=1, 4=2, 9=3, 16=4, 25=5}

/* seperates into two sublists */
list.partition { it < 3 } // ([1, 2], [3, 4, 5])

/* chunk to sublists of length at most 2. */
list.chunked(2) // [[1, 2], [3, 4], [5]]

/* windowed gives you sliding window across the iterable */
list.windowed(2) // [[1, 2], [2, 3], [3, 4], [4, 5]]

/* take or remove elements from a list. */
list.take(2) // [1, 2]
list.takeLast(2) // [4, 5]
list.drop(2) // [3, 4, 5]
list.dropLast(2) // [1, 2, 3]

/* returns either the first element of a list, or the
   first element for which some predicate is true.

   NOTE also aliased to `find()` */
list.first { it % 2 == 0 } // 2

list.last { it % 2 == 0 } // 4

/* accumulate list elements, `fold()` takes an iniial value as well. */
list.reduce { a, b -> a + b } // 1+2+3+4+5 = 15
list.fold(6) { a, b -> a + b } // 1+2+3+4+5+6 = 21

/* use a lambda to calculate a key and then map group each
   entry by that key. */
listOf("foo", "bar", "baz").groupBy { it[0] } // {f=[foo], b=[bar, baz]}
```

### Sequences
The collections we've seen so far are iterable. Their constructed in their entirety
and then stored. `Sequence`s are kotlins attempt at lazy Iterables. They store a
series of operations (as lambdas) and then lazily apply them to each element of an
iterable, yielding the result.

For example:

```kotlin
val list (1..10).toList().map {
  it * it
}.filter {
  it % 2 == 0
}
```

This operation builds up three lists, first the range is turned too a list, then a
new list is made through the `map` call and finally we `filter` the result to produce
another new list.

Alternatively:

```kotlin
val seq = sequenceOf(1,2,3,4,5,6,7,8,9,10).map {
  it * it
}.filter {
  it % 2 == 0
}
```

In this case only the original sequence is stored. Whenever we iterate over `seq` we
apply the operations to each element of the sequence as they're required. Lazily
enumerating the collection.

## OOP
```kotlin
class Foo

val foo: Foo = Foo()
println(foo) // moe.kisara.learn.Foo@7dc5e7b4
```

the primary constructor is associated with the class declaration

```kotlin
class Bar(sVal: String) {
    // instance variables are declared in the class body
    val s = sVal
    val l = s.length

    // methods are also declared here
    fun barString() {
        return String.format("Foo{%s,%d}", this.s, this.l)
    }
}

Bar("hello world").barString() // Foo{hello world,11}
```

you can only have properties or method declarations in the class body, if you want to
evaluate stuff when the class is constructed you can wrap it in an init block.

```kotlin
class Baz(sVal: String) {
    init {
        println("first init block: $sVal")
        // you can't access instance fields in an init block before their
        // assigned.
        // println("first init block: ${this.s}")
    }

    val s = sVal

    // multiple blocks are collected into a single primary constructor call
    init {
        println("second init block: ${this.s}")
    }
}
```

{{< notify "note" "you can defer assigning a non-null property a value by using [lateinit](https://kotlinlang.org/docs/reference/properties.html#late-initialized-properties-and-variables)" >}}

```kotlin
// if you prefix a parameter in the primary constructor with
// val/var, it's automatically assigned at construction.
class Bag(val foo: String)
Bag("hello").foo // hello
```

```kotlin
// if you want to change the scope or add an annotation to the
// primary constructor, you must explicitly qualify it.
class Foo private @Inject constructor() {}
```

```kotlin
// secondary constructors (custructor overloads) can be defined in
// the class body.
class MultiConstructor(val foo: String) {
    // an overload with no parameters, must invoke primary constructor.
    constructor() : this("default foo") {}
}

MultiConstructor("hello world").foo // hello world
MultiConstructor().foo // default foo
```

```kotlin
class WithProperties {
    // kotlin lets you specify an optional getter/setter for a field
    // with its own access specifiers.
    var aString: String = "default-value"
        // the current value of the backing field can be accessed
        // through the `value` keyword
        get() = value
        // you can assign to the backing field through `field`
        private set(value) {
            field = value
        }

    fun setValue(s: String) {
        this.aString = s
    }

    val isEmpty get() = this.aString.isEmpty()
}

val wp = WithProperties()
wp.aString // "default-value"
wp.isEmpty // false

// wp.aString = "" // error: setter is private
wp.setValue("")

wp.aString // ""
wp.isEmpty // true
```

### Data Classes

destructuring

Data classes lets you automate a lot of the boilerplate in creating simply classes.
By default a `data class` overrides:
- `toString()`
- `getHash()`
- `equals()`

```kotlin
data class MyIntTuple(val i: Int, val j: Int)

val a = MyIntTuple(0, 0)
val b = MyIntTuple(0, 0)
val c = MyIntTuple(2, 2)

println(a) // MyIntTuple(i=0, j=0)

a == b // true
a != c // true

// you can also destructure data-class instances
val (x, y) = a
x // 0
y // 0
```

{{< notify "note" "the built in `Pair` class used by maps is defined using a data class, meaning you can destructure it while enumerating it." >}}

```kotlin
val map = mapOf("hello" to 0, "val" to 1)
for ((key, value) in map) {
    println("$key -> $value")
}
```

### Inheritance
By default everything in kotlin is final, to make things inheritable you have to mark
them as `open`.

```kotlin
open class Foo(val opt: Int) {
    open fun deriveMe() {
        println("deriveMe in Foo: ${this.opt}")
    }

    fun finalMethod() {
        println("finalMethod in Foo: ${this.opt}")
    }
}

// must supply a value for super primary constructor or generic values.
class Bar : Foo(1) {
    // overriden functions are open by default, to prevent this mark them
    // as final.
    final override fun deriveMe() {
        println("deriveMe in Bar: ${this.opt}")
    }
}

val foo = Foo(0)
foo.deriveMe() // deriveMe in Foo: 0
foo.finalMethod() // finalMethod in Foo: 0

val bar = Bar()
bar.deriveMe() // deriveMe in Bar: 1
bar.finalMethod() // finalMethod in Foo: 1
```

### Abstract Classes
Any class marked as `abstract` cannot be instantiated. Any methods in such a class
that're marked as `abstract` don't provide any implementations. It's up to any deriving
classes to fill out such methods.

```kotlin
abstract class Shape {
    abstract fun area(): Int
}

class Rectangle(val width: Int, height: Int) : Shape() {
    override fun area(): Int {
        return this.width * this.height
    }
}

val sh: Shape = Rectangle(5, 5)
sh.area() // 25
```

### Enum Classes
Enumerations are defined as a class. Each enum value is an instance of that class
with any fields or overridden methods associated with the class.

```kotlin
enum class ProtocolState {
    WAITING {
        override fun signal() = TALKING
    },

    TALKING {
        override fun signal() = WAITING
    };

    abstract fun signal(): ProtocolState
}
```

You can use enum classes in `when` expressions, and a compiler warning will be issued
if the expression isn't exhaustive.

```kotlin
val ps = ProtocolState.WAITING;
when (ps) {
    ProtocolState.WAITING -> println("waiting")
    ProtocolState.TALKING -> println("talking")
}
```

### Sealed Classes
A `sealed class` is like an enum, but applied over multiple subclasses. It functions
more like a tag, to mark multiple subclasses. Using the `when` clause across a sealed
class throws a compilation warning if the patterns cases aren't exhaustive.

```kotlin
sealed class Expr
data class Const(val number: Double) : Expr()
data class Sum(val e1: Expr, val e2: Expr) : Expr()
object NotANumber : Expr()

fun eval(expr: Expr): Double = when(expr) {
    is Const -> expr.number
    is Sum -> eval(expr.e1) + eval(expr.e2)
    NotANumber -> Double.NaN
    // the `else` clause is not required because we've covered all the cases
}
```

### Interfaces
An interface is like an abstract class, except you can supply default values for
interface methods or properties and a class can derive from multiple interfaces for
each class.

```kotlin
interface Animal {
    // abstract function
    fun move()

    // abstract field
    val species: String
}

interface Mamal : Animal {
    // create a new field with a default value
    // NOTE: you can't assign it as an initializer, it must
    //       be a property.
    val legCount: Int get() = 2

    // assign inherited field
    override val species: String get() = "Mamalian"
}

class Tiger(val name: String) : Mamal {
    override val species: String = "Tiger"
    override val legCount: Int = 4

    override fun move() {
        println("$name is moving")
    }
}

val tiger = Tiger("Atsushi")
tiger.species // tiger
tiger.legCount // 4
tiger.move() // Atsushi is moving
```

### Nested Classes
Classes can be nested, but all this does is give them an extra namespace to be
accessed.

```kotlin
class Foo(private val value: Int) {
    class Bar {
        fun baz() {
            println(value)
        }
    }
}

Foo.Bar().baz() // hello
```

On the other hand `inner` classes are defined in relation to an instance of their
containing class.

```kotlin
class Foo(private val value: Int) {
    inner class Bar {
        fun baz() {
            println(value)
        }
    }
}

Foo(1).Bar().baz() // 1
```

### Singletons
The `object` keyword can be used to quickly generate singletons (like javascripts
`Object`). Singletons can also extend interfaces or types.

```kotlin
object MySingleton {
    var username: String = "mohkale"
    // please god, no! ＼(º □ º l|l)/
    var password: String = "password"
}

MySingleton.username // mohkale
MySingleton.password // password
MySingleton.password = "something-much-more-secure"
```

```kotlin
// we can use singletons to construct ad-hoc types at runtime.
fun String.isCycle(): Boolean {
    val pos = object {
        var x: Int = 0
        var y: Int = 0
    }

    for (ch in this) {
        when (ch) {
            'L' -> pos.x -= 1
            'R' -> pos.x += 1
            'U' -> pos.y -= 1
            'D' -> pos.y += 1
        }
    }

    return pos.x == 0 && pos.y == 0
}

"LRUD".isCycle() // true
```

```kotlin
// the rules for anonymous singleton types is somewhat complicated
class C {
    // Private function, so the return type is the anonymous
    // object type. we can access `foo().x` at runtime.
    private fun foo() = object {
        val x: String = "x"
    }

    // Public function, so the return type is Any
    fun publicFoo() = object {
        val x: String = "x"
    }
}
```

#### Companion Objects
kotlin takes rubys approach to static methods, with dedicated singletons implementing
static functionality. You can declare singletons within a class definition and call
fields or methods they have directly from the enclosing class; with the added benefit
that a single singleton is shared across all invocations.

{{< notify "warn" "you can only specify one companion object per class" >}}

```kotlin
class Klass {
    companion object Foo {
        fun foo() {
            println("hello world")
        }
    }
}

Klass.foo() // hello world
Klass.Foo.foo() // hello world

// if you don't give the companion object a name, it uses `Companion`.
class Qlass {
    companion object {
        fun foo() {
            println("hello world")
        }
    }
}

Qlass.Companion.foo()
```

### Inline Classes
An inline class is akin to a `typealias` for a single type. It lets you wrap a
primitive type into a class, define methods on it as if its a class, but at runtime
it uses the underlying primitive instead of the class. This saves heap allocations
and speeds up operations.

```kotlin
inline class Password(val value: String)
```

### Delegation
Delegation is a design pattern where an interface is implemented in some other type,
and the current class just stores an instance of such a type and forwards any methods
to it.

Here the `Base` interface is implemented through a `BaseImpl` instance in the
`Derived` class.

```kotlin
interface Base {
    fun print()
}

class BaseImpl(val x: Int) : Base {
    override fun print() { print(x) }
}

class Derived(b: Base) : Base by b

Derived(BaseImpl(10)).print()
```

### Property Delegates
A delegated property is an
[interface](https://kotlinlang.org/docs/reference/delegated-properties.html#property-delegate-requirements)
which lets you automate some of the boilerplate in a property assignment.

```kotlin
fun fact(i: Int): Int = if (i <= 0) i else i + fact(i-1)

class Foo {
    val fact10: Int by lazy { fact(10) }
}

// the fact10 value is only calculated when its first accessed.
Foo().fact10
```

```kotlin
// delegates can even be used to extract entries from a map
val map = mapOf("a" to 0, "b" to 1)
val b: Int by map // 1
```

## Labels
Kotlin supports a rudimentary alternative to **c**s `goto`s using labels. labels are
declared using a trailing `@` such as `loop@`. Kotlin implicitly labels many constructs
such as classes, interfaces, etc.

```kotlin
fun foo() {
    listOf(1, 2, 3, 4, 5).forEach lit@{
        if (it == 3) return@lit // continue after the foreach loop.
        print(it)
    }
    print(" done with explicit label")
}
```

You can `continue` or `break` after an outer loop from an inner one.

```kotlin
loop@ for (i in 1..100) {
    for (j in 1..100) {
        if (...) break@loop
    }
}
```

You can use labels to reference the enclosing instance from the inner instance.

```kotlin
class Foo(private val value: Int) {
    inner class Bar {
        private val value: Int = 0

        fun baz() {
            println(value) // Foo.Bar.value
            println(this@Foo.value) // Foo.value
        }
    }
}
```

## Coroutines
Coroutine support is available in the `kotlinx.coroutines` package. Coroutines are
always declared within some [context][context]. The context determines how to spawn
the coroutine and when a context is disposed of all coroutines declared with it are
waited for until completion.

[context]: https://kotlinlang.org/docs/reference/coroutines/coroutine-context-and-dispatchers.html

```kotlin
// launch spawns a new coroutine, GlobalScope is the
// default and can be ommited.
val crt = GlobalScope.launch {
    delay(1000) // pauses current coroutine
    println("coroutine done")
}
println("main thread done")

crt.cancel() // propogates CancelException to coroutine
crt.join() // pause current coroutine until ctx finishes
// crt.cancelAndJoin() // alias for above
```

```kotlin
/* cancellation requires cooperation from the implementation. You have
 * to continually check if a cancellation is requested, if it is then a
 * CancellationException is thrown and the coroutine is silently killed. 
*/

// This coroutine never uses any of the suspend functions or checks if the
// coroutine is cancelled so even if you try to cancel it, it'll continue.
launch {
    var nextPrintTime = startTime
    var i = 0
    while (i < 5) {
        if (System.currentTimeMillis() >= nextPrintTime) {
            println("I'm sleeping ${i++} ...")
            nextPrintTime += 500L
        }
    }
}

/* the `isActive` field within the context of a coroutine can let you know
 * if the coroutine has not been cancelled yet.
*/

// This implementation can be cancelled.
launch {
    var nextPrintTime = startTime
    var i = 0
    while (i < 5 && isActive) {
        if (System.currentTimeMillis() >= nextPrintTime) {
            println("I'm sleeping ${i++} ...")
            nextPrintTime += 500L
        }
    }
}.join()
```

### Suspend Functions
to be able to use suspend functions (such as `delay`) in another function, it must be
marked `suspend`.

```kotlin
suspend fun printWorld() {
    delay(1000L)
    println("World!")
}

fun main() { doWorld() }
// Error Suspend function 'doWorld' should be called only
// from a coroutine or another suspend function

// runBlocking spawns a new coroutine, and blocks the calling
// coroutine until it finishes.
fun main() = runBlocking {
    printWorld()
}
```

#### Async
`async` differs from `launch` by eventually evaluating to some **result**. `launch`
just spawns a job which'll eventually finish. You await on `async` coroutines until
they give you a resulting value.

```kotlin
suspend fun someLongCalculation() {
    return 5
}

val a = async { someLongCalculation() }
val b = async { someLongCalculation() }
val res = a.await() + b.await()
```

### Error Handling
A cancellation exception is just another exception, so you can handle it with a
`try`, `catch` clause.

```kotlin
launch {
    try {
        repeat(1000) { i ->
            println("I'm sleeping $i ...")
            delay(500L)
        }
    } finally {
        // to invoke suspending functions in a cancelled coroutine,
        // you must use a non-cancelled context.
        withContext(NonCancellable) {
            println("cancelled")
            delay(1000L)
            println("returning")
        }
    }
}
```

By default when a child coroutine is cancelled, its parent coroutines are then
cancelled all the way up the hirearchy. The [supervisor][supervisor] pattern lets you
go the opposite route. Cancel a parent and then propogate the change down through to
all the children.

[supervisor]: https://kotlinlang.org/docs/reference/coroutines/exception-handling.html#supervision

### Scope
scope lets you group corutines together such that any coroutines declared within a
scope must finish before the scope can.

```kotlin
// spawn a new coroutine scope, synchronously waits until all
// coroutines spawned within it are completed.
coroutineScope {
    launch {
        delay(500L)
        println("Task from nested launch")
    }

    delay(100L)
    println("Task from coroutine scope")
}
```

### Mutability
There are multiple ways to avoid concurrent access issues.

[Thread local][ThreadLocal] is a datatype which lets you lock a value such that it
can't be modified across different threads. There's also plain old [mutex
locks][MutexLocks].

[ThreadLocal]: https://kotlinlang.org/docs/reference/coroutines/coroutine-context-and-dispatchers.html#thread-local-data
[MutexLocks]: https://kotlinlang.org/docs/reference/coroutines/shared-mutable-state-and-concurrency.html#mutual-exclusion

The most straightforward way to avoid race conditions is to use a [single threaded
context][stc] whenever your mutating a value across different coroutines.

[stc]: https://kotlinlang.org/docs/reference/coroutines/shared-mutable-state-and-concurrency.html#thread-confinement-coarse-grained

### Channels
Kotlin supports [go]({{< ref "go.md" >}}) like [channels][channels].
I.E. concurrent pipes through which you can send data across different asynchronous
runtimes.

[channels]: https://kotlinlang.org/docs/reference/coroutines/channels.html#channels

```kotlin
val channel = Channel<Int>()
launch {
    for (x in 1..5) channel.send(x * x)
    channel.close() // we're done sending
}

for (y in channel) println(y)
```
