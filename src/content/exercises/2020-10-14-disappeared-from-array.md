---
title: Numbers Disappeared in an Array
source: dailybyte

challenge: |-
  Given an array of integers where $$1 \leq a[i] \leq n$$ (n = size of array), some
  elements appear twice and others appear once. Find all the elements of `[1, n]`
  inclusive that do not appear in this array.

  For example:
  - `[4,3,2,7,8,2,3,1]` should return `[5,6]`

runtime: "n"
language: kotlin
solution: |-
  fun numbersDisappeared(arr: MutableList<Int>): List<Int> {
    for (num in arr) {
      // use abs because we might have made it -ve.
      val i = Math.abs(num)-1
      // make negative to mark index as existing.
      arr[i] = -Math.abs(arr[i])
    }

    val nums = mutableListOf<Int>();
    for ((i,j) in arr.withIndex()) {
      if (j > 0) {
        nums.add(i+1)
      }
    }

    return nums;
  }

description: |-
  The key point about this challenge is that the array contains exactly **n** elements. Even
  if a number in the range is missing, some other element will be duplicated to enforce this
  restriction. What this means is that we can repurpose the slots in the array to keep track
  of which elements we've encountered and therefore which elements we haven't encountered.

  For this implementation we mark a number i as existing in the array if $$arr[i] \lt 0$$ in the
  array after the initial for loop.
---

