---
title: Avoid Code Smells With Lazy Iterables
tags:
  - python
  - educational
---

The other day, I finally got tired of `xdg-open` not working properly with KDE5 and
decided to fork and build my own open script from [pyxdg-open][pyopen]. Now I quite
liked using a python based file opener but while inspecting the source code I saw a
frequent use of a design pattern which I can only classify as *code-smell*. In this
post let's break down what I mean by code smell and ways to avoid it with lazy
iterables.

[pyopen]: https://github.com/wor/pyxdg-open

**NOTE**: The goal of this post isn't to insult or demean pyxdg-open. It's to use the
implementation to discuss design patterns. pyxdg-open is a great project and was
invaluable help for when I was building my own open script.

## Smell
It's worth stating the actual definition of code smell is quite fluid. It's often
subjective to each developer's own workflow and so others may not consider this a
smell. That said, [Girish Suryanarayana][rfsds] defines smells as:

> certain structures in the code that indicate violation of fundamental design
> principles and negatively impact design quality.

[rfsds]: https://www.amazon.co.uk/Refactoring-Software-Design-Smells-Technical/dp/0128013974

The specific smell I saw in abundance in [pyxdg-open][pyopen] was using parameters to
alter the return type of functions. For example, the script included a function to find
*.desktop* files which match some mimetype. For debugging, the function included a
parameter `find_all` (with a default value of False) that when `True` will cause the
function to return a list of acceptable file paths instead of just one. At a high
level, this amounts to:

```python
def find_desktop(*args, find_all=False):
  found = []
  for f in ...: # ... finds all desktop files
    if find_all:
      found.append(f)
    else:
      return f
  return found if find_all else None
```

Now to clarify, I don't consider the actual idea here to be flawed. Sometimes it
makes sense to parameterise the return type of a function. For example generic
functions (in statically typed languages) do this in abundance. The issue here is
that the same function can be used in two very different contexts and developers have
to remember this. There's no explicit check stopping someone from:

```python
for desktop_file in find_desktop(...):
  print(desktop_file)
```

which in this case would either:
- Cause a runtime exception because no desktop file was found and we're trying to
  iterate `None`.
- Output each character of the first path to the desktop file found because we're
  iterating the path string, not a list of paths.

The point I'm trying to make here is that dynamic languages should try to maintain
consistent return types, **or** make it explicit that the end user needs to handle the
varying possible return values.

## Tackling the Smell
So if you consider this approach *smelly*, how would you de*smell* it?

### Desmell With Abstraction
The most obvious approach would be to just always return all the paths (if you need
them) and let the end user extract the first one when they only need one. I'd
recommend splitting the solution into two functions, one that returns a collection
and another which picks out the first value from the collection.

```python
def find_all_desktops(*args):
  files = []
  for dfile in ...: # ... finds all desktop files
    files.append(dfile)
  return files

def find_desktop(*args):
  files = find_all_desktops(*args)
  if len(files) > 0:
    return files[0]
  return None
```

Now there's an implied caller contract where if you're looking for multiple entries
you should call `find_all_desktops` and if you're looking for just one (which may not
exist) you should call `find_desktop`. Both these functions have the same signature
so they can be invoked in the same way, even if you use the return value in different
ways.

### Optimising With Duplication
However there's a pretty big issue with the above approach. Finding *.desktop* files
can be expensive. It could take a lot of resources or time or calculations and when
you only need the first one, you shouldn't first find all of them. So why not copy
and paste the two and just exit with the first path found in `find_desktop`.

```python
def find_all_desktops(*args):
  files = []
  for dfile in ...: # ... finds all desktop files
    files.append(dfile)
  return files

def find_desktop(*args):
  for dfile in ...: # ... finds all desktop files
    return dfile
  return None
```

Okay. That works pretty well. You've managed to avoid finding all *.desktop* files
when you only need one, but duplication should be a last resort. It muddies up your
source code and means a change to a simple piece of logic in one component may need
to be applied to multiple other components. Being as **DRY** as possible is
important.

### Optimising With Iterables
#### Creating Lazy Iterables With Generators
The way I approached this problem was by using [generators][pygen]. A generator is a
special kind of iterable that's consumed lazily. When you create a generator function,
you write a blueprint for the kind of logic needed to generate the values in a
collection and then you let outside routines **consume** those values as they're
generated.

[pygen]: https://wiki.python.org/moin/Generators

Consider a basic function which lets you iterate over increasing square numbers.

```python
def squares(count):
  mem = []
  for i in range(1, count):
    mem.append(i * i)
  return mem
```

This is a classic, non-generator, based implementation which finds all the squares
(upto count) and then returns an array of them. There's quite a few issues with
implementing like this. What if you want to iterate upto very large counts? Try
`squares(1_000_000_000)` and leave your computer running overnight to see if it's
finished yet.

The generator based approach calculates values as their required:

```python
def squares(count):
  for i in range(1, count):
    yield i * i
```

When you instantiate a generator you get a generator object. 
Notice there's no delay from calling the function to getting the return value.

```python
>>> s = squares(1_000_000_000)
<generator object foo at 0x7fe5bb4e2900>
```

You can get the next value from a generator using the `next` method.

```python
> next(s)
1
> next(s)
4
> next(s)
9
```

**NOTE**: There's no way to backtrack through a generator. Once you've gotten a
value, you can't go back to access any previous values.

You can even run a for loop on a generator:

```python
>>> for o in squares(3):
>>>   print(o)
1
4
9
```

Once the generator function finishes, a `StopIteration` exception is raised when you
try to access the next value. The for loop silently suppresses this exception for you.

#### A Final Implementation
So using generators, here's how I de*smelled* the *`find_all`-parameter* code smell.

```python
def first(it):
  try:
    return next(it)
  except StopIteration:
    return None

def find_all_desktops(*args):
  for dfile in ...: # ... finds all desktop files
    yield dfile

def find_desktop(*args):
  return first(find_all_desktops(*args))
```

The `first` method takes a generator and returns its first value. If no-value is
generated, it returns `None`. `find_all_desktops` has been reimplemented as a
generator so it yields desktop files as it finds them, rather than finding all of
them at once and then returning them. `find_desktop` calls `first` on
`find_all_desktops`.

If you find this confusing, take a step back and look over it again. We've managed to
accurately separate the logic for finding all desktop files and finding just one
desktop file, whilst minimising code duplication and excess processing; all of this,
was possible because of laziness and iterables.

## Conclusion
I hope this post has been a good introduction to the value of laziness in modern
imperative languages. You don't have to use *smelly* design paradigms to write
efficient and readable code. Less is often more. I hope you'll take this opportunity
to check out [pyxdg-open][pyopen] and my own open script [xopen][xopen].

[xopen]: https://github.com/mohkale/dotfiles/blob/7b83961db3421c9293306f5fffd5f2f923be0d36/bin/xopen
