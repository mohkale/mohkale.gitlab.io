---
title: Tape Equilibrium
source:
  title: codility
  link: https://app.codility.com/programmers/lessons/3-time_complexity/tape_equilibrium/

challenge: |-
  A non-empty array $$A$$ consisting of $$N$$ integers is given. Array $$A$$ represents
  numbers on a tape. Any integer $$P$$, such that $$0 &lt; P &lt; N$$, splits this tape into
  two non-empty parts: $$A[0], A[1], ..., A[P − 1]$$ and $$A[P], A[P + 1], ..., A[N − 1]$$.

  The difference between the two parts is the absolute difference between the sum of the
  first part and the sum of the second part.

  $$|(A[0] + A[1] + ... + A[P − 1]) − (A[P] + A[P + 1] + ... + A[N − 1])|$$

  For example, consider array $$A$$ such that:

  ```text
  A[0] = 3
  A[1] = 1
  A[2] = 2
  A[3] = 4
  A[4] = 3
  ```

  We can split this tape in four places:

  ```text
  P = 1, difference = |3  − 10| = 7
  P = 2, difference = |4  −  9| = 5
  P = 3, difference = |6  −  7| = 1
  P = 4, difference = |10 −  3| = 7
  ```

  The smallest absolute difference in this case is $$1$$, so your solution should return $$1$$.

language: python
runtime: "n"
solution: |-
  def increasing_sum(arr):
    s = [0] * len(arr) # allocate everything at once
    s[0] = arr[0]
    for i, j in enumerate(arr[1:], start=1):
      s[i] = s[i-1] + j
    return s

  def tape_div(arr):
    inc_sum = increasing_sum(arr)
    dec_sum = increasing_sum(arr[::-1])[::-1]
    return min(abs(inc_sum[i-1] - dec_sum[i]) for i in range(1, len(arr)))

description: |-
  Maintain the sum of all elements while iterating forward through the array and
  while iterating backwards through it. Now we can calculate the absolute difference
  between each pivot of the array in constant time. For example, using our earlier
  value for $$A = [3,1,2,4,3]$$.

  ```text
              | 0  1  2  3  4 |
  ------------+---------------+
  Left->Right | 3  4  6 10 13 |
  Right->Left | 13 10 9  7  3 |

  P = 1, difference = | 10 -  3 | = 7
  P = 2, difference = | 9  -  4 | = 5
  P = 3, difference = | 7  -  6 | = 1
  P = 4, difference = | 3  - 10 | = 7
  ```

  Each `diff[i]` is equal to $$| \mathit{rl}[i] - \mathit{lr}[i-1] |$$. This approach
  is called [prefix-sums][ps].

  [ps]: https://codility.com/media/train/3-PrefixSums.pdf
---
