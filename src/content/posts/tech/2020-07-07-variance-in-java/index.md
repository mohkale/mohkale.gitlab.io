---
title: Variance in Java
tags:
  - java
  - educational
---
**Variance** is a cool sounding word I've always had difficulty wrapping my head around.
I recently decided to start learning [kotlin]({{< ref "/notes/langs/kotlin.md" >}}) and
in doing so I brushed up against java and type generics again. Now I think I
finally have a good handle on it so lets try explaining variance in java.

[source]: https://kotlinlang.org/docs/reference/generics.html#variance

## The Syntax
To start let's clarify how java represents generics syntactically.

```java
List<String> strings;
```

Here I've declared the variable `strings` to be a `List` which holds instances of the
type `String`. Meaning I'm able to add as many **strings** as I need.

```java
strings = new ArrayList<>();
strings.add("hello");
strings.add("friend")
```

The benefit of generics here is that you get compile time safety both when adding
values and extracting values. You can't, for example, add an `int` to `strings` without
`javac` barfing a error.

```java
strings.add(5);
// Main.java:8: error: incompatible types: int cannot be converted to String
//         list.add(5);
//                  ^
// 1 error
```

## Invariance
Javas generic type system is *invariant*. This means you can't assign a generic
`Foo<T>` to a type `Foo<U>` even when `U` extends `T`. Therefore something like
the following is not possible:

```java
List<String> strings;
List<Object> objects = strings;
```

even though, because `String` is a subtype of `Object`, the following is perfectly
valid:

```java
String foo = "hello";
Object obj = foo;
```

### why?
The reasons javas generics are invariant is to prevent later runtime errors when
manipulating the casted type. If you could cast `List<String>` to `List<Object>`
then you could do the following:

```java
List<String> strings = new ArrayList<>();
List<Object> objects = strings;
objects.add(5); // runtime error
```

The important thing to understand here is that when we do `objects =
strings`, we're not copying all the elements of `strings` to a new
List after casting them to `Objects`. We're storing a reference to our
existing list (`strings`) in a new variable with a different type.

Diagramatically the memory layout will probably look something like this:

{{< figure src="images/memory-ref.svg" caption="memory assignment reference" >}}

Both `strings` and `objects` points to an `ArrayList<String>` instance.

Now an unsuspecting user that has a reference to our `strings` List will, sometime
down the line, try to enumerate the List and do something with the string such as
`String.substring()` and the program will crash or have undefined behaviour because
it's using an `int` as a `String`.

That's why Javas type system is invariant and this kind of behaviour is forbidden at
compile time. Preventing runtime runtime errors.

## Bypassing Invariance
Java introduced wildcards to get around the issues of invariance. There are two types
of wildcards which gives you read only or write only access to a generic type.

{{< notify "note" "what i mean by writeonly/readonly doesn't mean the type is immutable. You can still, for example, call `List.clear()` without needing guarantees about the underlying type of the List." >}}

Given a type hirearchy like the following:

```java
class A {}
class B : A {}
class C : A {}
class D : C {}
```

### Covariance
`List<? extends T>` puts an upper bound on the kinds of values the supplied List can
take. We now have a guarantee that every element of this list can at least be used as
a `T` so we can box it upto `T` when retrieving from the list. We've been granted
read only access.

```java
List<D> notWild = new ArrayList<>();
notWild.add(new D());
notWild.add(new D());
notWild.add(new D());
notWild.add(new D());

// D extends A so this is OK.
List<? extends A> wild = notWild;

// NOTE the most we know about list is every
// element is at least an A, so we box to A.
for (A i : wild) {
    System.out.println(i);
}
```

We still can't add anything to `list` because there's no guarantee about what type
the underlying list is, but we're able to read from the list. We've constructed a
**producer** of `A`s.

### Contravariance
`List<? super E>` puts a lower bound on the kinds of values the list can take. We can
assign any list with a type that `E` inherits from to this list. Everything in the
list is guaranteed to be at least an `E` so we can add as many `E`s as we need to it.

```java
List<A> notWild = new ArrayList<>();

// A is a supertype of C, so this is OK.
List<? super C> wild = notWild;
wild.add(new C());
wild.add(new C());

// we can even add a subtype of C
wild.add(new D());
```

We've constructed a **Consumer** of `C`s.

## Conclusion
That's all I have to say on this topic, generic types are essential to
working with more complex inheritance hirearchies and hopefully this
article has summaried some of the pain points of working with them in
the java language.
