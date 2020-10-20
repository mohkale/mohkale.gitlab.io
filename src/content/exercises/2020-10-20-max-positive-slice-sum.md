---
title: Max Positive Slice Sum
source: OA # ocado

challenge: |-
  Given an array A of size n, we define a slice $$(P,Q)$$ where $$0 \leq P \leq Q \lt
  0$$ and every i in $$[p..q]$$ (inclusive) is positive. Find the slice in A which has
  the largest sum.

  For example in the array `[1,2,-3,4,5,-6]` there are slices of `[1], [2], [1,2],
  [4], [5], [4,5]` with the slice having the largest sum being `[4,5]`.

language: python
runtime: "n"
solution: |-
  def max_pos_slice_sum(arr):
    maximum = -1
    for lower, upper in enumerate_slices(arr):
      # NOTE: can this be optimized?
      maximum = max(maximum, sum(arr[lower:upper+1]))
    return maximum

  def enumerate_slices(arr):
    """Find all non-negative slices of maximum length in arr."""
    i = 0
    while i < len(arr) and arr[i] < 0:
      # start from the first positive number in arr.
      i += 1

    lower = i
    while i < len(arr):
      if arr[i] < 0:
        yield lower, i-1
        # skip past all negative values until
        # the beginning of the next slice.
        while i < len(arr) and arr[i] < 0:
          i += 1
        lower = i
      else:
        i += 1
    if lower < i:
      yield lower, i-1

description: |-
  This problem is actually easier than it seems. While initially we're told to
  consider all possible slices in the array A, it's intuitively obvious that we only
  need to concern ourselves with the largest possible slices we can find.

  For the above example of `[1,2,-3,4,5,-6]` we can consider a slice of `[1]`, `[2]`
  and `[1,2]` seperately, but because slices consist only of positive values
  **considering just `[1,2]` is guranteed** to give a larger sum than `[1]` and `[2]`
  seperately.

  Knowing that we only care about the largest slices we can form, we just need to
  split the array A at every continuous sequence (1 or more) of negative values we
  can find. For `A=[1,2,-3,-4,5,6,-7]` we need to split it into `[1,2], [-3,-4],
  [5,6], [-7]` and intuitively disregard the splits consisting of only negative values.
  My `enumerate_slices` method above does exactly this, calling it creates an
  iterator over `arr` which returns the lower and upper indices (inclusive) of where
  the splits are in `arr`. Then we just need to maintain a maximum and update it with
  the sum of each found split.
---
