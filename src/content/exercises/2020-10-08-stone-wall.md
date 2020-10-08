---
title: Stone Wall
source:
  title: codility
  link: https://app.codility.com/programmers/task/stone_wall/

challenge: |-
  You are going to build a stone wall. The wall should be straight and $$N$$ meters long,
  and its thickness should be constant; however, it should have different heights in
  different places. The height of the wall is specified by an array $$H$$ of $$N$$ positive
  integers. $$H[I]$$ is the height of the wall from $$I$$ to $$I+1$$ meters to the right of
  its left end. In particular, $$H[0]$$ is the height of the wall's left end and $$H[N−1]$$
  is the height of the wall's right end.

  The wall should be built of cuboid stone blocks (that is, all sides of such blocks are
  rectangular). Your task is to compute the minimum number of blocks needed to build the
  wall.

  Write a function that, given an array $$H$$ of $$N$$ positive integers specifying the height of
  the wall, returns the minimum number of blocks needed to build it.

  For example, given array $$H$$ containing $$N = 9$$ integers:

  ```text
  H[0] = 8    H[1] = 8    H[2] = 5
  H[3] = 7    H[4] = 9    H[5] = 8
  H[6] = 7    H[7] = 4    H[8] = 8
  ```

  the function should return 7. See [here][source] for a pictural representation of this arrangement.

  [source]: https://app.codility.com/programmers/task/stone_wall/

runtime: "n"
language: python
solution: |-
  def solution(arr):
    stack = []
    count = 0

    for h in arr:
      while len(stack) > 0 and stack[-1] > h:
        stack.pop()
      if len(stack) == 0 or stack[-1] != h:
        count += 1
        stack.append(h)
    return count

description: |-
  The thing to note here is that we only need a new block when the height of the
  current block doesn't match the previous one. Consider $$H = [1, 1, 3]$$. We can use
  a single block to represent the first two heights and then require another block of
  height 2 on top of it to reach the third height.

  Another thing to note is that we can repurpose earlier blocks for new ones. Consider
  $$H = [1, 2, 1]$$. We can represent this using two blocks:
  - one 3 length block of height 1.
  - one 1 length block of height 1.

  ```text
     ---
     |X|
     ---
  ---------
  |   X   |
  ---------
  ```

  The pattern we can observe here is that as we encounter newer, taller, blocks we
  push back our current smaller blocks and consider only blocks of increasing height
  (eg. $$H = [1, 1, 2, 2, 3, 3, 1, 1]$$). Once we encounter a block that's smaller
  we go through the history of all smaller continuous blocks we have at that point
  until one matches our current height or we must begin a new block.

  **NOTE**: The actual arrangement of blocks is beyond the scope of this challenge,
  we are concerned only with the minimum number of blocks needed to satisfy $$H$$.

  For those familiar with data structures, this pattern of *last in first out* will
  probably remind you of a stack. In this solution we've implemented a rudimentary
  stack which we either exhaust or fill up using the above two conditions until the
  array of heights is all used.
---

