---
title: Move Zeroes
source: leetcode
tags: [python]

challenge: |-
  Given an array of numbers `[0,1,0,3,12]` move all the zeroes to the end of the
  array while maintaining the relative ordering of the non-zero elements and
  minimising the total number of operations.

runtime: "n"
language: python
solution: |-
  def move_zeroes(arr):
      i, j = 0, 0
      while j < len(arr):
          if arr[j] == 0:
              j += 1
          else:
              if j != i:
                  arr[i] = arr[j]
              j += 1
              i += 1
      while i < len(arr):
          arr[i] = 0
          i += 1
      return arr
description: |-
  Enumerate through the array using two pointers. The first, `i`, points to the
  first element in the array which hasn't been moved yet. `j` is just our pointer
  to the current index while moving through the array.

  We take two passes through the array, the first simply overwrites any zero values
  with a non zero value and the second replaces the trailing elements that have been
  moved.

  ![diagram](./diagram.svg)

  The trick here is knowing that we always replace zero elements with non-zero
  elements, meaning we don't have to remember where the zero elements occur in the
  original array. Simply overwriting them is sufficient. The final value of `i` at
  the end of the first pass is the index after the new position of the last element
  in the initial array. In the graph above this would be where the second 3 occurs.
  Zeroing out from here to the end of the array is effectively the same as moving
  each zero element in the original array to the end.

  S.N. That description probably isn't very intuitive, but hopefully the diagram
  expresses it well enough.
---

## Test Cases
```python
move_zeroes([0,1,0,3,12]) # [1,3,12,0,0]
move_zeroes([1]) # [1]
```
