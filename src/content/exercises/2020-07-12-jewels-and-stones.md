---
title: Jewels and Stones
source: dailybyte
tags: [python]

challenge: |-
  Given a string listing kinds of jewels and a string listing the kinds of stones you
  own, return the number of stones you have that're also jewels.

language: python
solution: |+
  def jewel_count(stones, jewels):
      stones, jewels = sorted(stones), sorted(jewels)

      count, i, j = 0, 0, 0
      while i < len(stones) and j < len(jewels):
          if stones[i] == jewels[j]:
              count += 1
              i += 1
          elif stones[i] < jewels[j]:
              i += 1
          else:
              j += 1
      return count
description: |+
  We sort both strings and then we place two markers at the beginning of each string,
  iterating through them in tandom. Once we're at a jewel that's also a stone, we
  increment our jewel count and push the stone marker forward. Otherwise when our
  stone marker is less than our jewel marker we know we'll never encounter a jewel
  worth less than our current stone and safely push the stone marker forward. Otherwise
  we push the jewel marker forward because we need to find a jewel worth at least as
  much as our stone.
---

## Test Cases
```python
jewel_count("ac", "abc") # 2
jewel_count("AaaddfFf", "Af") # 3
jewel_count("AYOPD", "ayopd") # 0
```

<!--
TODO time complexity
## Complexity Analysis
Pythons `sorted` function takes worst case $$\mathcal{O}(n \; log \; n)$$ time, therefore
sorting both the jewels and stones strings takes $$\mathcal{O}(max(j,s) \; log \; max(j,s))$$.
We then enumerate the stones string in tandom with the jewels string taking worst
case $$O(j+s)$$.
-->

## Alternative Implementation
Convert the `jewel` string to a set $$\mathcal{O}(j)$$ and then for each character in
the stones string, count if its in the `jewel` set. Checking for the presence of a
string in a set takes $$\mathcal{O}(1)$$ time so total time complexity adds up to
$$\mathcal{O}(j+s)$$

[tc-source]: https://wiki.python.org/moin/TimeComplexity#set

```python
def jewel_count(stones, jewels):
    return sum(1 for s in stones if s in set(jewels))
```
