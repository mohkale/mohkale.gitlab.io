---
title: Passing Cars
source:
  title: codility
  link: https://app.codility.com/programmers/lessons/5-prefix_sums/passing_cars/

challenge: |-
  A non-empty array $$A$$ consisting of $$N$$ integers is given. The consecutive
  elements of array $$A$$ represent consecutive cars on a road.

  Array $$A$$ contains only zeroes and/or ones:

  $$0$$ represents a car traveling east, $$1$$ represents a car traveling west.
  The goal is to count passing cars. We say that a pair of cars $$(P, Q)$$,
  where $$0 \leq P &lt; Q &lt; N$$, is passing when $$P$$ is traveling to the east
  and $$Q$$ is traveling to the west.

  For example with an array A:
  ```text
  A[0] = 0
  A[1] = 1
  A[2] = 0
  A[3] = 1
  A[4] = 1
  ```

  We have five pairs of passing cars: $$(0, 1), (0, 3), (0, 4), (2, 3), (2, 4)$$, so your solution should return 5.

language: python
runtime: "n"
solution: |-
  def solution(arr):
    total = sum(arr)
    mem = [0] * len(arr)
    mem[0] = total
    for i, j in enumerate(arr[1:], start=1):
      mem[i] = mem[i-1] - j

    res = 0
    for i, j in enumerate(arr):
      if j != 0:
        continue
      res += mem[i]
    return res

description: |-
  The thing to notice about this problem is that for each zero we encounter, we
  add all the ones we encounter in the array after that zero.

  In the previous example, there's a zero at index $$0$$, there's $$3$$ passing cars
  ahead of it which we encounter at index $$1,3,4$$. Similairly we encounter another
  zero at index $$2$$ and encounter $$2$$ passing cars at index $$3,4$$.

  The best way to approach this problem is to keep track of how many cars are ahead
  of each car at each index. We could do this using a nested loop, running in $$\mathcal{O}(n^2)$$,
  but a more efficient approach would be to maintain a decreasing sum for each car index.
  The first half of my solution above assigns such a sum to the array `mem`. Beginning
  with the sum of all values in the array, each index subtracts the corresponding value in `A`
  from the index before it.

  For the example above this leaves us with:

  ```text
  mem[0] = 3
  mem[1] = 2
  mem[2] = 2
  mem[3] = 1
  mem[4] = 0
  ```

  Now we can just iterate from the start of the array to the end, incrementing a counter by the
  value of `mem[i]` for each $$i$$ where $$A[i] == 0$$. This gives us $$3+2 = 5$$ which is the
  correct answer for our example case.
---
