---
title: Galton Board
source: dailybyte
tags: [clojure]

challenge: |-
  A ball is dropped into a special galton board where at each level in the board the
  ball can only move right or down. Given that the board has `m` rows and `n`
  columns, return the total number of unique ways the ball can arrive at the bottom
  right of the cell of the galton board.

  For example, with `m=2` and `n=2` there are two possible paths.
  - DOWN  -> RIGHT
  - RIGHT -> DOWN

language: clojure
solution: |-
  (defn path-count [n m]
    (if (or (= n 1) (= m 1))
        1
      (+ (path-count (- n 1) m)
         (path-count n (- m 1)))))

description: |-
  ### Formulating the Problem
  I think the hardest part about this challenge is visualising the problem.
  Consider a board with `n=4` and `m=5`.

  ![diagram](./board.svg)

  The ball is placed at the start index of `n=1` and `m=1`. At that point it can
  either move to the right or down a level. Eventually it's **guaranteed** to reach
  the position at `n=4` and `m=5`.

  A possible path can be:
  - RIGHT -> RIGHT -> RIGHT -> DOWN -> DOWN -> DOWN -> DOWN.
  - RIGHT -> DOWN -> RIGHT -> RIGHT -> DOWN -> DOWN -> DOWN.
  - ...

  You get the idea, we're trying to find the permutation of paths that can be formed
  in an `n * m` dimensional grid which all converge at the right hand side.

  ### Constructing a Solution
  Now that we've established the problem, how do we solve it? At each iteration we can
  either go right or down. Each direction we go creates a new possible path we can go
  to the goal. Our formulation of the problem has already shown that every path we take
  will *eventually* reach the goal (in the worst case reaching the edge of the
  board and only moving to the right or downwards until it reaches the goal).

  So we can construct a recursive solution where the number of paths to the goal is
  equal to the sum of the number of paths if we go down and the number of paths if
  we go to the right. That's the recursive part of my solution above. The base case
  stops when either `n` or `m` is reduced to 1. Technically it should be when
  **both** are reduced to `1` but seeing as we know there's only one possible path
  from that point to the goal we can shortcut past the calculations and count it as
  one path.
---

## Potential Optimizations
My solution above has an large runtime cost because its recalculating paths as it
recurses. Take for example the following scenario.

```text
+-----------+
| S |-- |   |
| | | | |   |
| |-|-> |   |
|   |   | G |
+-----------+
```

In this case we're viewing two different recursive invocations. The first decided to
go to the right at the start and then down twice. The second decided to go down twice
and then to the right. Both of them landed upon the same square on the board and both
of them are now going to independently try to find the number of paths from them to G.
Calculations are being recalculated at different invocations in the search tree, how
do we prevent this?

This is a perfect example to demonstrate [dynamic programming][dp]. At each level `i,
j`, the total path count is equal to the sum of the paths from `(i-1, j)` and `(i,
j-1)`. My recursive approach is an example of a top down approach, I break each
problem down into smaller subproblems which help me solve the big problem. The
approach I'm about to show is an example of bottom up design. I **start** from the
small problems and join them together to solve the big problems.

[dp]: https://en.wikipedia.org/wiki/Dynamic_programming

The difference might not be readily apparent, but hopefully you can identifiy it by
analyzing the difference between the algorithms.

```clojure
(defn path-count [n m]
  ;; create memory store
  (def mem (make-array Integer/TYPE m n))

  ;; initialise 1 dimensional depth
  (doseq [i (range m)]
    (aset-int mem i 0 1))
  (doseq [j (range n)]
    (aset-int mem 0 j 1))

  ;; accumulate path count
  (doseq [i (range 1 m)
          j (range 1 n)]
    (aset-int mem i j
      (+ (aget mem (- i 1) j)
         (aget mem i (- j 1)))))

  (aget mem (- m 1) (- n 1)))
```

Here we create a 2D array containing every possible `n, m` pair and the path
count associated with it. Starting with `n=1` and `m=1` we build up the answer
to `path-count(n, m)`.

```text
              j (n)
      | 1 | 1 | 1 | 1 | 1 |
i (m) | 1 | 2 | 3 | 4 | 5 |
      | 1 | 3 | 6 |   |   |
      | 1 |   |   |   |   |
```

We fill out the `mem` array left to right, top to bottom until we've calculated the
number of paths for `j=n` and `i=m`. Each `i, j` pair is assigned as the sum of the
values at `mem[i-1,j]` and `mem[i,j-1]`.

Observe that when `i=1` or `j=1` we set the number of paths to 1. This is because the
only path to the right hand side is when the ball keeps moving to the right or keeps
moving down. We know this for a fact.

**NOTE**: there's no need to keep the first dimension of `n` and `m` in memory. It's
always going to be 1. I've kept it in the above example to simplify the amount of
condition handling logic but in practice you shouldn't keep memory you don't need to.

### Advantages of Bottom Up
This approach never revisits the same `(i,j)` pair twice so it's guaranteed to never
repeat a calculation. This is where our bottom approach differs from the top down
one. Each subproblem isn't worked on independent from the larger problem we're trying
to solve.
