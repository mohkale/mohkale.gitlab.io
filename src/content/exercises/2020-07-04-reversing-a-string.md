---
title: Reversing a String
source: dailybyte
date: 2020-07-04 19:50:32 +0000 UTC
tags:
  - python

runtime: "n"
language: python
solution: |+
  def reverse(s):
    s = [x for x in s]
    l = len(s)
    for i in range(l // 2):
        s[i], s[l-i-1] = s[l-i-1], s[i]
    return ''.join(s)
description:
  for every pair of characters leading to the middle of the string, swap them.
---

## Proof
**Loop Invariant**: at the end of each iteration of the loop, the character at index $$i$$
and the character at index $$l-i-1$$ is at its correct position in the reversed string.

Let $$m$$ be the middle of the string. This is equal to $$floor(len(s)/2)$$.

- In the first iteration $$i=0$$. The first character ($$0$$) is moved to the end of the
  string and the last character ($$l-i-1$$) is moved to the start of the string.
  Maintaining the loop invariant.
- In the $$k^{th}$$ iteration, for any $$k$$ less than $$m$$, the $$k^{th}$$ value is
  $$m-k$$ characters from the middle of the string and $$2m-k-1$$ characters from its
  position in the reversed string. $$2m=l$$. Thus the $$k^{th}$$ value is moved to
  the $$l-k-1$$<sup>st</sup> position and the $$l-k-1$$<sup>st</sup> value is moved
  to the $$k^{th}$$ position. Maintaining the loop invariant.
- At the end of the loop there's a case split depending on if the string length is
  odd or even.
  - If the string is odd then $$i=m-1$$. The $$m-1$$<sup>st</sup> and the
    $$m+1$$<sup>th</sup> characters are swapped. Loop invariant holds and the loop
    terminates.
  - If the string is even then $$i=m-1$$ and this character is swapped with
    $$l-(m-1)-1$$<sup>st</sup> character which is the character next to $$i$$ (I.E
    $$i+1=m$$). The last pair of characters is swapped. The loop invariant holds and
    the loop terminates.

{{< notify "note" "in the case where the string is odd, the `m`th character isn't moved because it's position is the same in the reversed string as it was in the original." >}}

## Alternative Implementation
Python itself has a simple clean way to reverse collections. Here's the language
specific solution.

```python
def reverse(s):
    return s[::-1]
```
