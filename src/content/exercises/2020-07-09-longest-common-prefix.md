---
title: Longest Common Prefix
source: dailybyte
tags:
  - python

challenge: |+
  given an array of strings of varying length, find the longest common prefix that's
  shared across every element of the array. For example `[fox, fox, fob]` has a
  longest common prefix of `fo`.

# runtime: ""
language: python
solution: |-
  def is_prefix(strs, i):
    # assume each element in `strs` is at least as long as `i`.
    return len(set(x[:i] for x in strs)) == 1

  def lcp(strs):
    def recursive_lcp(lower, upper, best):
      if lower <= upper:
        return best

      mid = max((upper-lower) // 2, lower)
      if is_prefix(strs, mid):
        return recursive_lcp(mid+1, upper, mid)
      else:
        return recursive_lcp(lower, mid-1, best)

    max_len = min(len(a) for a in strs)
    longest = recursive_lcp(0, max_len, 0)
    return strs[0][:longest]
description:
  a binary search to find the largest index for which the substring [0, index] is
  shared across every string in `strs`.
---

## Proof
Observe that each recursive invocation of `recursive_lcp` either ends the recursion
or cuts the search space in half. Also observe that there's a finite number of
possible lengths for the longest common prefix. Therefore the algorithm must
eventually converge on a prefix shared by every string in `strs`

## Expanded Implementation
The above solution can be just as well implemented without recursion like so:

```python
def lcp(strs):
  longest = 0
  lower, upper = 0, min(len(a) for a in strs)

  while upper > lower:
    mid = max((upper - lower) // 2, lower)
    if is_prefix(strs, mid):
      longest = mid
      lower = mid+1
    else:
      upper = mid-1

  return strs[0][:longest]
```

## Possible Improvements
When we've found a valid prefix but not yet ended the loop, we don't need to keep
comparing the substring of entries from `lower` to `mid`. We can just compare from
`best` to `upper`.

For example, given the word list:
- for
- fox
- fob

If after the first iteration we've found the common prefix of `f`, the next iteration
will be checking if the substring from `0` to `1` has a common prefix:
- fo
- fo
- fo

Which it does, but we don't need to recompare the first column in every string again.
We **already** know that `f` is a common prefix so we can skip it and compare the
reamining string up to `mid`.

