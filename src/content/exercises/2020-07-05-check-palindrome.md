---
title: Check Palindrome
source: dailybyte
date: 2020-07-05 14:17:00 +0000 UTC
tags:
  - python

runtime: "n"
language: python
solution: |-
  def is_palindrome(s):
      l = len(s)

      for i in range(l // 2):
          if s[i] != s[l-i-1]:
              return False
      return True
description:
  For every pair of characters equidistant from the middle of the string, check
  whether the two characters match or not. If they don't then the string isn't a
  valid palendrome.
---

## Proof
**Loop Invariant**: At the end of each iteration of the loop, the characters $$i$$
places from the start of the string is the same as the character at index $$i$$ places
from the end of the string, or the function returns `False`.

- At the beginning of the loop $$i=0$$ and $$l-i-1=l-1$$ which is the index of the last
  character of the string. If these two are equal the loop continues, otherwise the
  loop ends and the function returns `False`.
- At the $$k^{th}$$ iteration the $$k^{th}$$ character is compared against the
  $$l-k-1$$<sup>st</sup> character which is where the $$k^{th}$$ character would be
  in the reversed input string. If the two are equal the loop continues, otherwise
  the characters aren't the same in the reversed string and the function returns
  `False`.
- At the end of the loop $$i=floor(len(l) / 2)$$. Let $$m=ciel(len(l) / 2)$$. $$i$$ is
  guaranteed to be $$m-1$$.
  - If the string has odd length then there's one character $$m$$ which has the same
    position regardless of if the string is reversed. The $$i^{th}$$
    ($$m-1$$<sup>st</sup>) character is therefore compared against $$l-i-1$$
    (I.E. the $$m+1$$<sup>st</sup>) character and if these two are equal the loop terminates
    and the string is a palindrome. Otherwise the loop terminates and the string was
    not a palindrome.
  - If the string has even length, then $$m-1$$st character is compared against the
    $$m$$<sup>th</sup> character and same logic as the other condition. In either
    case the loop invariant is maintained.

## Alternative Implementation
As shown in [reversing a string]({{< ref "./2020-07-04-reversing-a-string.md#alternative-implementation" >}}) python has a
simple syntax to reverse collections. Using this we can create a cleaner answer by
simply comparing our input string with its reversed value.

```python
def is_palindrome(s):
    return s == s[::-1]
```

However it should be stated that this isn't an [in-place][ip] solution. Python
constructs a new array and copies the contents of `s` to it when reversing using the
slice literal.

[ip]: https://en.wikipedia.org/wiki/In-place_algorithm
