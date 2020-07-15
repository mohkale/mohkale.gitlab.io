---
title: Decorators Are Awesome!
categories: programming
tags:
  - python
  - educational
---

<!-- TODO reword -->
As my first post on this blog, I wasn't sure what to write on. I'd prefer something
not too long, simple, and informative. After enough time, I decided I may as well
just talk about a feature of python I absolutely love :heart:. So let's discuss decorators.

## First Class Objects
Before that however, we should build some background. Python supports the concept of
functions as [first class objects][fco]. What this means, in relation to our current
topic, is that a function can be passed to another function, and a function can be
returned from another function.

[fco]: https://en.wikipedia.org/wiki/First-class_citizen

```python
def add_to(num):
  def adds_to_num(arg):
    return num + arg
  return adds_to_num
```

See what I mean? Running `add_to(5)` returns a function taking a single argument
which always adds `5` to that argument.

```python
adder = add_to(5)
adder(0) #=> 5
adder(5) #=> 10
adder(-5) # => 0
```

There's **two** important concepts at play here.
1. `add_to` returns a function, this is an application of first class objects.
2. every invocation of `add_to` forms a closure around `num`. I won't go into
   explaining what a closure is but, suffice it to say, this let's you call `add_to(2)`
   and `add_to(5)` simultaneously without the local value of `num` in the returned
   function being changed.

For those who would like to further explore the second point, look into
[lexical-scoping][lex] and [closures][closures].

[lex]: https://en.wikipedia.org/wiki/Scope_(computer_science)#Lexical_scoping
[closures]: https://en.wikipedia.org/wiki/Closure_(computer_programming)

### Side Note: Lambdas

Python has a specific form for declaring anonymous (inline) functions. The
[`lambda`][lambda] keyword can be used to construct a callable object which
doesn't possess a name.

[lambda]: https://docs.python.org/3/tutorial/controlflow.html#lambda-expressions

We could reword our above example to avoid having to explicitly name the
`adds_to_num` function.

```python
def add_to(num):
  return lambda arg: num + arg
```

## Decorators

Okay, now that we know a function can return another function. What if we took a
function, say `func`, made a new function which wraps around `func` and then return
that instead.

For those fammiliar with lisp, you may see parallels between the concept of a
decorator and [advising][advice] functions. That's no mistake. Decorators are
essentially pythons approach at function advice :grinning:.

[advice]: https://en.wikipedia.org/wiki/Advice_(programming)

**eg.** Let's postulate simple use case where I've got a function that takes a
single argument and I always want to add a certain constant to it before processing.

```python
CONSTANT = 3.14159265359

def foo(num):
  num = num + CONSTANT
  ...
```

Why don't I write another function which automates this addition?

```python
def add_constant(func):
  def new_func(num):
    num = num + CONSTANT
    return func(num)
  return new_func
```

`add_constant` is a function which accepts another function as an argument. For the
sake of this example the `func` argument should be a function which takes only a
single paramater. `add_constant` then creates a new function which adds the constant
onto `num`, before calling the original function.

While not too complicated an idea to grasp, this may be hard to follow. We're
creating a function which creates a function. It feels kind of roundabout. But the
appeal of decorators lies in apllication, not implementation.

We can apply this decorator to to the previous example like so.

```python
def foo(num):
  ...

foo = add_constant(foo)
```

These two approaches are functionally equivalent. It's up to the developer to decide
which approach to take.

NOTE this is a bad example of when it's a good idea to use decorators; We've replaced
a 1 line assignment with a 1 line assignment and a 5 line method. In this case, it
would've made more sense to create `add_constant` if we ended up adding `CONSTANT` in
a bunch of different functions and the addition in question wasn't as simple as
adding a single value.

### Syntax Sugar

This being python of course there's a nice to apply decorators while defining
functions. You've probably encountered the syntax before, whilst writing classes.

The previous example could just as well be written as:

```python
@add_constant
def foo(num):
  ...
```

The `@decorator` syntax expands a function (or class) call such that it resolves to
`identifier = decorator(identifier)`. In the above example this would be `foo =
add_constant(foo)`.

It's that simple :smiley:.

## Nitpicking

That's all well and good, but it's not perfect. Firstly our decorators don't maintain
the original functions name or docstring. If you tried evaluating the above and then
printing `foo`, you'll probably get something like:

```sh
>>> foo
<function add_constant.<locals>.new_func at 0x6ffffac6dd0>
```

Similairly if you tried invoking `help` on it, you'd get the help of `new_func` not
the original function that was decorated (though in this case, `foo` doesn't have a
docstring so it doesn't really make difference).

Worry not though, the standard python library has ways to get around this. The
[functools][functools] module introduces the `update_wrapper` and `wraps` method.
More often then not you'll simply be using `wraps` so I'll elaborate on that one.

[functools]: https://docs.python.org/3/library/functools.html

`functools.wraps` updates the metadata associated with a function to make it appear
as another function. It's easier to show than to explain, so without further ado.

```python
import functools

def add_constant(func):
  @functools.wraps(func)
  def new_func(num):
    num = num + CONSTANT
    return func(num)
  return new_func
```

You apply the `wraps` method like a decorator onto the new method you've defined. If
you replace our previous definition of `add_constant` with this and then try to print
`foo` or access it's docstring, the correct metadata will be fetched even though the
decorator is in affect :grinning:.

```sh
>>> foo
<function foo at 0x6ffffac6b00>
```

While not mandatory, you **should** always do this; unless of course you have a valid
reason not to.

## Decorator Design Principles

This section elaborates on some of the cooler ways to design decorators. You don't
really need to read this, unless you're interested.

### Decorators With Arguments

A simple standard decorator is all well and good, but sometime you'd like to be able
to pass some configuration options to the decorator. The solution this problem is
simple; just create another function.

There's *basically* no limit to the amount of local scopes you can create within a
function so introduce another scope to hold the options.

Let's say I'd like a function to repeat upto 3 times, but I don't want to fix it to
only 3. I'd like the user to be able to pass how many times they'd like, defaulting
to 3 if nothings given.

```python
def repeat(times=10):
  def decorator(func):
    @functools.wraps(func)
    def wrapped(*args, **kwargs):
      for _ in range(times-1):
        func(*args, **kwargs)

      return func(*args, **kwargs)
    return wrapped
  return decorator
```

We've defined a decorator `repeat` taking an optional argument `times` that runs a
functions `times-1` times and then runs it once more, returning the value of the last
attempt.

We can now apply this to any function we want:

```python
@repeat()
def print_foo():
  print('foo')

@repeat(5)
def print_bar():
  print('bar')
```

NOTE: in this case, when not specifying a default value for `times` you still have to
include the parentheses. If you're not sure why, think about it; if you're still not
sure, leave a comment and I'll answer :smile:.

Invoking these functions in pythons REPL, we'd get:

```sh
>>> print_foo()
foo
foo
foo
None
>>> print_bar()
bar
bar
bar
bar
bar
None
```

### Class Based Decorators

Decorators don't have to be functions, they just need to be callable. To that end you
can also define decorators as classes.

In fact, the built in [property][property] decorator is implemented as a class with
[descriptors][descriptors]. Descriptors are a lesser known, albeit astonishing,
feature of python. I suggest anyone who intends to use python, in a professional
context, look into them.

[property]: https://docs.python.org/3/library/functions.html#property
[descriptors]: https://docs.python.org/3/howto/descriptor.html

To define a decorator as a class, you simply need to create a callable class and use
it like a decorator.

eg.

```python
class AddConstant:
  def __init__(self, func,
               constant=CONSTANT):
    self.constant = constant
    self.func = func

  def __call__(self, num):
    num = num + self.constant
    return self.func(num)

@AddConstant
def foo(num):
  ...
```

TODO use propper NOTE notify.

NOTE: the [\_\_call\_\_][call] magic method, let's an object behave as if it's a
function. You can instantiate `a = AddConstant()` and then call `a()` just like a
function.

[call]: https://docs.python.org/3/reference/datamodel.html#object.__call__

In this case the difference doesn't really make much sense. Why define it as a class
instead of a function? Well `foo` is now an object, not a function. That
means you can inspect and modify it's instance variables (and thus it's local
runtime).

Let's say you decide, sometime after defining `foo` that now you'd like to add a
different constant to it. If you'd defined your decorator as a function, you'd need
to keep a backup of the original function and you'd need to re-apply the decorator
with a new constant. With the class based approach, you can simply reassign an
instance variable.

```python
foo.constant = some_other_variable
```

This has the intended affect, but it's straightforward, easy to read and best of all
still doesn't shatter the illusion that `foo` is a function (because `foo` is still
callable).

## A Practical Application

This has been a long... long, first post. I won't take up your time much longer.
Let's just show a simple example of where decorators could save you a tonne of
hassle.

Let's say you have a function which is liable to fail 2 out of 5 times. That is, if
you run it 100 times, 40 of those invocations are likely to throw an exception. Now
you'd like an easy way to be able to run the function upto 10 times, until either:

- it doesn't produce an error in which case you return the result.
- it produces an error and you've already ran it 9 times, so just let the error happen.

What I'm describing here is a retry mechanism for a hard to predict function. We can
implement this as a decorator.

```python
import functools

def retry(times):
  def decorator(func):
    @functools.wraps(func)
    def wrapped(*args, **kwargs):
      for i in range(times):
        try:
          return func(*args, **kwargs)
        except Exception as e:
          if i == times - 1:
            raise e # exhausted all attempts
    return wrapped
  return decorator
```

Any function decorated with `retry` will return immeadiately unless the `func` throws
an error. When an error is thrown, it'll simply try the function again unless it has
no more tries to give, in which case it lets the error happen.

Let's try it out.

```python
from random import randint as rand

@retry(10)
def bar():
  if rand(0, 100) > 50:
    raise Exception('too bad :(')

  return 'succeeded'
```

`bar` is a function which 50% of the time is going to throw an error. We've applied our
decorator such that the function is tried upto 10 times.

The appeal of applying decorators here is in the sheer elegance of the definition. We
don't need to complicate the body of the function to handle the error cases. We don't
need to define a new function to call `bar` that handles those error cases.

That's why **Decorators Are Awesome!**

## Addendum (28.04.2020)
[Above]({{< ref "#decorators-with-arguments" >}}) I stated that you **had** to include
empty parentheses for a decorator with optional arguments, even when you don't
provide the optional arguments (and just use the defaults). This isn't strictly true,
there's a relatively easy way to get around the need for parens.

```python
def repeat(func=None, times=10):
  def decorator(func):
    @functools.wraps(func)
    def wrapped(*args, **kwargs):
      for _ in range(times-1):
        func(*args, **kwargs)

      return func(*args, **kwargs)
    return wrapped

  if func:
    return decorator(func)
  return decorator
```

Compare this to our previous definition of repeat

```diff
- def repeat(times=10):
+ def repeat(func=None, times=10):
    def decorator(func):
      @functools.wraps(func)
      def wrapped(*args, **kwargs):

+
+   if func:
+     return decorator(func)
    return decorator
```

and you'll notice not much has changed, all we've really done added an extra
parameter to our decorator (for the function) and checked whether it's been supplied
or not. When it has, the default values for the remaining optional arguments are
used, otherwise TODO finish thought.

All 3 of the following are equivalent.

```python
def foo():
  print('foo')

foo = repeat(func=foo)
```

```python
@repeat
def foo():
  print('foo')
```

```python
@repeat()
def foo():
  print('foo')
```

NOTE: in the second case, the decorator call evaluates to `repeat(func=foo)` and in
the third call it evaluates to `repeat()(foo)`. Our new definition of `repeat` can
distinguish between the two *different* invocations and select the appropriate one.
