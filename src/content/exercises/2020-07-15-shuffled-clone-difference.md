---
title: Spot the Difference
source: dailybyte
# tags:

challenge: |-
  given a string `s` and a string `t` with `t` being `s` shuffled with optionally
  one extra character added, return this extra character or the empty string if it
  doesn't exist.

runtime: max(s+t)
language: python
solution: |
  from collections import Counter

  def string_diff(s: str, t: str) -> int:
      s_count = Counter(s)
      t_count = Counter(t)
      for ch in set(s+t):
          if abs(s_count[ch] - t_count[ch]) == 1:
              return ch
      return ''
description: |+
  count the number of times each character exists in `s` and `t` then return the
  character for which the absolute difference between the two is 1.
---


## Test Cases
```python
string_diff('foobar', 'barfoot') // 't'
string_diff('ide', 'idea') // 'a'
string_diff('coding', 'ingcod') // ''
```

## Potential Optimisations
Instead of using `counter` we can a single dictionary with occurences in `s` incrementing
the number and occurences in `t` decrementing it. Such as
[first unique character]({{< relref "2020-07-14-first-unique-character.md" >}}).
