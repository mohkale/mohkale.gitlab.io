---
title: Equal Split (2 Array)
source: codility

challenge: |-
  Given 2 arrays $$A, B$$ of length `N` an equal-split `i` is defined such that the
  sums:
  - $$(A[1] + ... + A[i-1])$$
  - $$(A[i] + ... + A[n])$$
  - $$(B[1] + ... + B[i-1])$$
  - $$(B[i] + ... + B[n])$$

  are all equal. For example, given the arrays:

  ```text
       0  1   2  3  4
  A = [0, 4, -1, 0, 3]
  B = [-2, 4, 1, 0, 3]
  ```

  There're 2 equal splits at index 2 and index 3 where the sums are all equal to 3.

  Your challenge is to count the number of equal splits that exist for $$A,B$$.

runtime: "n"
language: python
solution: |-
  def eq_split_count(arr1, arr2):
    inc1 = prefix_sum(arr1)
    inc2 = prefix_sum(arr2)
    dec1 = prefix_sum(arr1[::-1])[::-1]
    dec2 = prefix_sum(arr2[::-1])[::-1]

    n = len(arr1) # or len(arr2)
    count = 0
    for i in range(n-1):
      if inc1[i] == dec1[i+1] and \
         inc1[i] == inc2[i] and \
         inc2[i] == dec2[i+1]:
        count += 1
    return count

description: |-
  The naive approach here would be, for each index `i` calculate the sum of all
  elements before `i` and after `i` for both arrays $$A,B$$. Incrementing a counter
  when both are equal. This approach would have $$\mathcal{O}(n^2)$$ time complexity because for
  each index `i` we enumerate all of both arrays once to calculate the sum.

  The optimisation here is remembering the sums for each split of the array and
  simply fetching them as required. This can be done using a simple prefix sum, for
  example with the array $$[0, 4, -1, 0, 3]$$:

  ```text
          0  1   2  3  4
  a    = [0, 4, -1, 0, 3]
  sums = [0, 4,  3, 3, 6]
  ```

  At index 1 the total sum on the left hand side of the array is 4. At index 2 it
  is 3 and at indedx `n-1` it is the sum of the entire array. To find out the sum
  on the other side of the array we can use a simple iterative algorithm:

  ```python
  def rev_prefix_sum(arr):
    if len(arr) == 0:
      return []
    mem = [0] * len(arr)
    mem[0] = sum(arr)
    for i in range(1, len(arr)):
      mem[i] = mem[i-1] - mem[i]
    return mem
  ```

  However for readabilities sake above I've used the same increasing prefix sum on
  the reverse of the original array, reversing the result after the fact. This has
  the same affect as the above algorithm, except it doesn't require a new function
  definition. In practice I'd suggest using `rev_prefix_sum` but I only came up with
  it after writing my solution, so it'll continue to use the current approach.

  After this its a simple matter of iterating (in linear time) through the array,
  incrementing a counter once the sums of a split at index `i` are all equal.
---

## Utils
Used to accumulate the sum from the start of the array to index `i` for each index
`i` in the array `arr`.

```python
def prefix_sum(arr):
  if len(arr) == 0:
    return []
  mem = [0] * len(arr)
  mem[0] = arr[0]
  for i in range(1, len(arr)):
    mem[i] = mem[i-1] + arr[i]
  return mem
```
