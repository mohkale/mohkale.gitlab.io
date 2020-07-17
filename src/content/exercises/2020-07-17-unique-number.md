---
title: Unique Number
source: leetcode
tags: [kotlin]

challenge: |-
  given a non empty array of integers with the guarantee that every number occurs twice
  except one. Find the number that occurs only once.

runtime: "n"
language: kotlin
solution: |-
  fun uniqueNum(nums: List<Int>): Int {
      return nums.reduce { a, b -> a xor b }
  }
description:
  This implementation takes advantage of the fact that $$a \oplus b = c$$ and
  $$a \oplus c = b$$. That is exclusive-or is a reflective operation. Each occurence
  of a number twice in `nums` cancels itself out in `num` ($$a \oplus a = 0$$).
  Therefore if we xor every element, the bits remaining must correspond to the only
  element not cancelled out. I.E. The **unique** element.
---

## Test Cases
```kotlin
uniqueNum(listOf(1,2,3,2,1)) // 3
uniqueNum(listOf(1)) // 1
uniqueNum(listOf(2,2,1)) // 1
uniqueNum(listOf(4,1,2,1,2)) // 4
```
