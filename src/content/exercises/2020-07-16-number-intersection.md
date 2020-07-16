---
title: Number Intersection
source: dailybyte
# tags:

challenge: |-
  given two arrays of numbers (not guaranteed unique) return the set (unique) of
  numbers in both sets.

runtime: a+b
language: ruby
solution: |-
  def intersects(a, b)
    mem = {}
    a.each { |el| mem[el] ||= true }
    b.filter { |el| mem.delete el }
  end

---

## Analysis
we build a hashmap storing the characters that occur in `a` in $$\mathcal{O}(a)$$
time and then simply return the characters in `b` that match `a`. This has space
complexity and time complexity $$\mathcal{O}(n)$$ where `n` is the length of the
intersection of `a` and `b`.

{{< notify "note" "we've used `mem.delete` because otherwise if a character in `a` occurs more than once in `b`, then we'll end up including it in the return value more than once as well." >}}

## Test Cases
```ruby
intersects([2, 4, 4, 2], [2, 4]) # [2, 4]
intersects([1, 2, 3, 3], [3, 3]) # [3]
intersects([2, 4, 6, 8], [1, 3, 5, 7]) # return []
```

## Alternative Implementation
The ruby standard library has its own method to perform this kind of computation.

```ruby
def intersects(a, b)
  a.intersection b
end
```

### Another
If we can modify the input arrays in place, we can construct a solution with no space
complexity and $$\mathcal{O}(a \; log \; a + b \; log \; b)$$ time complexity. This
solution has a striking similarity to the [jewels and stones]({{< ref
"/exercises/2020-07-12-jewels-and-stones.md" >}}) solution.

```ruby
# @return [Integer] the index of the the first element
# in `arr` from `index` which doesn't equal `el`
def non_eq_index(arr, el, index=0)
  while index < arr.length && arr[index] == el
    index += 1
  end

  index
end

def intersects(a, b)
  a.sort!
  b.sort!

  res = []
  i, j = 0, 0
  while i < a.length && j < b.length
    if a[i] == b[j]
      res << a[i]
      i = non_eq_index(a, a[i], i)
      j = non_eq_index(b, b[j], j)
    elsif a[i] < b[j]
      i += 1
    else
      j += 1
    end
  end
  res
end
```

{{< notify "note" "we need the auxillary method `non_eq_index` to skip past repeat occurences of the same number in the input arrays." >}}
