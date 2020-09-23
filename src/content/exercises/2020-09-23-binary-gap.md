---
title: Binary Gap
source:
  title: codility
  link: https://app.codility.com/programmers/lessons/1-iterations/binary_gap/

challenge: |-
  A binary gap within a positive integer $$N$$ is any maximal sequence of
  consecutive zeros that is surrounded by ones at both ends in the
  binary representation of $$N$$.

  For example:

  | Number | Binary         | Gaps      |
  |--------|----------------|-----------|
  | 9      | $$1001$$       | 2         |
  | 529    | $$1000010001$$ | 4, 3      |
  | 20     | $$10100$$      | 1         |
  | 15     | $$1111$$       | N/A       |
  | 32     | $$100000$$     | N/A       |

  Write a function that will return the length of the longest binary gap in
  some number $$N$$. Assume that $$N$$ is a number in the range
  $$[1..2,147,483,647]$$.

runtime: "n"
language: python
solution: |-
  def bit_is_zero(num, bit):
    return num & (1 << bit) == 0

  MAX_BITS = 32
  def start_pow(n):
    for i in reversed(range(0, MAX_BITS+1)):
      if not bit_is_zero(n, i):
        return i
    return 0

  def binary_gap(N):
    start = start_pow(N)
    max_z, current_z = 0, 0

    # no need to include start because we know it's 1.
    for i in reversed(range(0, start)):
      if bit_is_zero(N, i):
        current_z += 1
      else:
        max_z = max(max_z, current_z)
        current_z = 0
    return max_z

description: |-
  The approach here is quite simple. We start from the largest non-0 bit in the
  representation of the number $$N$$ and move downwards towards the smallest power
  of 2. We also keep a running count of the number of zeroes we've encountered.
  Every time we encounter a one, we remember only the biggest continuous
  sequences of zeroes we've encountered so far and then reset our counter.

  By the end of the loop `max_z` will contain the longest binary gap in $$N$$.

  **NOTE**: We could've just as well converted our binary number to a binary string
  and repeat this same process with characters instead of bits. The advantage here is
  that:
  - Space complexity is $$\mathcal{O}(1)$$. We don't need any extra memory to find
    the longest binary gap. Converting the number to a string would take 8 times the
    amount of memory this solution does （／．＼）.
  - We don't need to come up with an algorithm to accurately convert a decimal number
    to a binary string. Technically python already has functions for this, but if it's
    going to form a core part of our solution, we should be able to implement it
    ourselves.
---
