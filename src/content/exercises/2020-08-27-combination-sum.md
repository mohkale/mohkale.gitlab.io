---
title: Combination Sum
source: dailybyte
tags: [kotlin]

challenge: |-
  Given a list of positive numbers without duplicates and a target number, find
  all unique combinations of the numbers that sum to the target. **NOTE**: You may
  use the same number more than once.

language: kotlin
solution: |-
  fun combinationSum(nums: List<Int>, target: Int): List<List<Int>> {
    val results = mutableListOf<List<Int>>();

    fun recursiveDo(solution: List<Int>, sum: Int, index: Int) {
      if (sum == target) {
        results.add(solution)
      } else {
        nums.asSequence().drop(index).forEachIndexed { i, num ->
          if (sum + num <= target) {
            recursiveDo(cloneListAdd(solution, num), sum+num, i+index)
          }
        }
      }
    }

    nums.forEachIndexed { i, value ->
      recursiveDo(listOf(value), value, i)
    }

    return results
  }

description: |-
  We recursively enumerate every combination of the input `nums` array and whenever
  we encounter a sum that adds up to `target` we add it to the `results` array (which
  we later return).

  At the recursive step we work from the current number (in `nums`) to the end of
  `nums`. For each number we check whether, after adding it to our `sum`, we
  still have a chance of reaching `target` at some later recursive step. If so we
  branch.

  **NOTE**: Working from the current position to the end of `nums` is used to
  guarantee the uniqueness of our `results`. If we let our solution work from
  the start of the array then one recursive invocation could recreate the work
  of an earlier one. For example if we allow working from the start of the array
  and use an array of `[2, 3]` with a target of `7`. The first invocation would
  give a result of `[2, 2, 3]`. The second invocation would give a result of
  `[3, 2, 2]`. These are the same solutions. Forbidding looking back means the
  runtime starting with `3` will never consider a solution that's followed with
  `2`; avoiding the duplicate.

  Addition is commutative, so *without loss of generality* we can conclude that only
  working from the current position to the end of the array doesn't lose us any valid
  combinations.
---

## Utils
```kotlin
fun <T> cloneListAdd(lst: List<T>, value: T): List<T> {
  val newList = lst.toMutableList()
  newList.add(value)
  return newList.toList()
}
```

## Tests
```kotlin
combinationSum(listOf(2,4,6,3), 6) // [[2, 2, 2], [2, 4], [6], [3, 3]]
```

## Potential Optimizations
### Avoiding Unecessary Stack Allocations
My implementation above has a strange quirk. In `recursiveDo` we're checking if
`sum + num <= target` but in the next allocation we're checking if `sum == target`.
Meaning we've checked `sum == target` twice. It's a minor performance penalty but
irksome all the same.

The reason for this was that... this was cleaner to write Σ(O_O).
- Having a `sum == target` check in both the top level of `recursiveDo` and each
  condition in the for loop would've been (completely IMO) code noise.
- Refactoring everything so we only check whether a solution is complete in the loop
  would work, but then we'd also have to add a check in each iteration of the
  `nums.forEachIndexed` loop outside of `recursiveDo`. And that would've felt like a
  forcing of concerns from `recursiveDo` into `combinationSum`... not to mention we'd
  have the same condition repeated in different places within the same function... yikes!.

So in conclusion, I stand by this implementation. Sometimes good code isn't always
efficient code ┐(￣ヘ￣)┌. Besides most good compilers should be able to pick up on
and optimize away the extra stack.

### Lazy Construction
I'm not a big fan of declaring variables (`results`) only to have other runtimes
mutate them. Not to mention this solution has to store the entire list of
combinations in memory, which for large lists would be intractable. It's possible to
implement this using sequences to lazily generate the combinations as they're required.

Actual memory performance might vary, seeing as for the very first value, we
end up constructing a `Sequence` instance for each recursive invocation.

```kotlin
fun combinationSum(nums: List<Int>, target: Int): Sequence<List<Int>> =
  sequence {
    fun recursiveDo(solution: List<Int>, sum: Int, index: Int): Sequence<List<Int>> =
      sequence {
        if (sum == target) {
          yield(solution)
        } else {
          nums.asSequence().drop(index).forEachIndexed { i, num ->
            if (sum + num <= target) {
              yieldAll(recursiveDo(cloneListAdd(solution, num), sum+num, i+index))
            }
          }
        }
      }

    nums.forEachIndexed { i, value ->
      yieldAll(recursiveDo(listOf(value), value, i))
    }
  }
```

At this point I'd probably refactor `recursiveDo` into its own function (not a local
closure)... but it'd end up taking 5 arguments. Maybe it makes more sense to wrap this
into a mixin.
