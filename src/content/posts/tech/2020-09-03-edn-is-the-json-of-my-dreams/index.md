---
title: "EDN is the JSON of My Dreams"
tags:
  - lisp
  - educational

thumbnail:
  path: thumbnail.jpg
  source:
    link: https://www.lynda.com/AutoCAD-tutorials/Loading-LISP-file/542374/587369-4.html
    title: source
---

[EDN][edn] (aka the **Extensible Data Notation**) is a lisp like data serialisation
format. Think JSON, but written in **LISP**. I just spent the better part of an
hour migrating a python project I had that used JSON as a config format to EDN...
and I'm probably *never* going to use JSON when EDN is an option again.

[edn]: https://github.com/edn-format/edn

## How it looks
EDN is a subset of clojure, meaning in general, it looks just like lisp. This JSON
form:

```json
{
  "name": "mohsin kaleem",
  "born": 944611200,
  "tags": ["developer", "gamer", "weeb"]
}
```

is equivalent to the following EDN form.

```lisp
{:name "mohsin kaleem"
 :born 944611200
 :tags ["developer" "gamer" "weeb"]}
```

At the moment this may just looks somewhat like badly formatted JSON, but EDN has
more to offer than simple feature parity with JSON :grin:.

## Why I prefer it?
### Compactness
EDN has noticably less cruft than JSON. Part of this is opinion driven so it's
probably not a good measure of actual compactness, But EDN:
- Supports using symbols (the strange keywords prefixed with `:`) instead of strings
  as map keys. This reduces the character count by 2 in a lot of places.
- Makes comars completely optional. This is part of how maps (or alists) are
  written as `key value` in lisp. No seperator or identifier is required and key
  can be pretty much any arbitrary type. This also fixes one minor grievance I had
  with JSON, trailing comars were forbidden but leading comars are mandatory; in
  EDN comars are irrelevent.

That's really all the space reducing changes in place. It's not much, but part of it
is also how lisp code is formatted. The general convention around formatting readable
JSON is to spread each individual component over as many lines as required. This
means our previous sample JSON data would be rendered as:

```json
{
  "name": "mohsin kaleem",
  "born": 944611200,
  "tags": [
    "developer",
    "gamer",
    "weeb"
  ]
}
```

The equivalent EDN form from above is already prettified. There's a difference of 5
lines between prettified forms. That may not seem like much but my 3400 line config
went down to 2400 lines when switching.

### Collections, Collections, Collections
EDN has first class support for lists, vectors, sets and maps. The spec states that:

> A vector is a sequence of values that supports random access.

I take this to mean that lists are as they're in LISP (implemented using linked
lists) and vectors are arrays. In most implementations I don't think this difference
will matter much. The python version seems to parse both vectors and lists into a
immutable variant of the built in list type, but I appreciate that they clarified
the distinction. This just further reiterates that EDN is a serialisation format, not
simply a data interchange format.

Moving on from that tangent, here's how each data type is written:

```lisp
("item-1" 2 :item-3) ; list
["item-4" 5 :item-6] ; vector

#{"foo" "bar" "baz"} ; sets
;; values in a set must be unique

;; maps
{"item-7" "foo"
 8        "bar"
 :item-9  "baz"}
```

EDN also has `true`, `false`, `nil`, numbers, floating-point types etc. See the [spec][edn]
for more.

### Tagging to Runtime Types
This is the single coolest part about EDN in my opinion. You can tag values and let
the parser format them how you'd like. This works kind of like lisp-macros. Lets try
an example:

```lisp
{:items
 #with-index
 [{:name "mohkale"}
  {:name "shmokale"}
  {:name "lokale"}]}
```

Here I've got a map with a single item. The item has the key `:items` and the value
is an array of maps that's been tagged with the tag `with-index`. We attach a tag to
a value by prefixing the value with a `#` followed by the tag name. Now in our parser
we have to register the tag.

```python
import edn_format as edn

def with_index_tag(attrs):
  return [{**o, edn.Keyword('count'): i} for i, o in enumerate(attrs)]

edn.add_tag("with-index", with_index_tag)
```

Now when the EDN parser reaches our tagged `items` array. It'll parse it, and then pass
the result through to the `with_index_tag` function.

Now we can try to load our data:

```python
edn.loads(data)
# {
#   Keyword(items): [
#     {Keyword(name): 'mohkale', Keyword(count): 0},
#     {Keyword(name): 'shmokale', Keyword(count): 1},
#     {Keyword(name): 'lokale', Keyword(count): 2}
#   ]
# }
```

Voila, now each entry in our `items` array has a counter value added to it by our
parser. This is amazing. You can associate serialised data with concrete runtime
values **from the serialised data**.

My previous process for something like this was:
- parse data
- instantiate related classes with parsed data
- replaced parsed data with concrete instances

Now it's just:
- parse data

I leave it upto each class to create and associate a tag that can convert serialised
types to class instances. Something like:

```python
import edn_format as edn
from dataclasses import dataclass

@dataclass
class Foo:
  id: int
  msg: str

  @classmethod
  def from_edn(cls, attrs):
    return cls(**attrs)

edn.add_tag("Foo", Foo.from_edn)
```

And now you can parse directly to `Foo` instances.

```lisp
[#Foo { "id" 0 "msg" "hello world" }
 #Foo { "id" 1 "msg" "hello friend" }]
```

```python
edn.loads(data)
# [Foo(id=0, msg='hello world'), Foo(id=1, msg='hello friend')]
```

## Summary
In closing, I hope this article has been a fun introduction to EDN and will bring
some more attention to the format. The standard is still quite new, and slow to move,
but for a file format that's not really a bad thing.
