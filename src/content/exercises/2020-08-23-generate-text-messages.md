---
title: Generate Text Messages
source: dailybyte
tags:
  - kotlin

challenge: |-
  Given a string of digits, return all possible text messages those digits could
  send.

  **NOTE**: The mapping of digits to letters are:

  ```text
  0 -> null
  1 -> null
  2 -> "abc"
  3 -> "def"
  4 -> "ghi"
  5 -> "jkl"
  6 -> "mno"
  7 -> "pqrs"
  8 -> "tuv"
  9 -> "wxyz"
  ```

  For example, the digit sequence `"23"` would give:
  - `"ad"`
  - `"ae"`
  - `"af"`
  - `"bd"`
  - `"be"`
  - `"bf"`
  - `"cd"`
  - `"ce"`
  - `"cf"`

language: kotlin
solution: |-
  fun genMessages(digits: String, acc: String=""): Sequence<String> {
    return sequence {
      if (digits.length == 0 || !digitMap.containsKey(digits[0])) {
        yield(acc)
    	} else {
        val digitChars = digitMap[digits[0]]
        if (digitChars?.length == 0) {
          yieldAll(genMessages(digits.substring(1), acc))
        } else {
          digitChars?.forEach {
            yieldAll(genMessages(digits.substring(1), "$acc$it"))
          }
        }
      }
    }
  }


description: |-
  Recursively traverse each digit in `digits` from left to right. Substituting each
  character associated with that digit before branching to the remaining digits. We
  build up `acc` at each recursive invocation before branching to the next.
---

## Utils

```kotlin
val digitMap = mapOf(
  '0' to "",
  '1' to "",
  '2' to "abc",
  '3' to "def",
  '4' to "ghi",
  '5' to "jkl",
  '6' to "mno",
  '7' to "pqrs",
  '8' to "tuv",
  '9' to "wxyz",
)
```

## Test Cases

```kotlin
genMessages("23").toList() // [ad, ae, af, bd, be, bf, cd, ce, cf]
genMessages("203").toList() // [ad, ae, af, bd, be, bf, cd, ce, cf]
genMessages("123").toList() // [aad, aae, aaf, abd, abe, abf, acd, ace, acf, bad, bae, baf, bbd, bbe, bbf, bcd, bce, bcf, cad, cae, caf, cbd, cbe, cbf, ccd, cce, ccf]
```

## Potential Optimisations
There's quite a bit of repeated work involved in this solution. I implemented it as a
recursive generator out of concern for memory performance but there's no way to add
memoization because each generated value is discarded as soon as its consumed.

To understand what I mean by repeated work, consider this execution tree showing how
digits changes as we recurse:

```text
        (23,)
         /|\
        / | \
       /  |  \
      /   |   \
 (3,a)  (3,b) (3,c)
```

Each branch of the tree now seperately tries to work out the combination of messages
we can form with `03`, and predictably with just `3` when we reach another recursive
depth. This is intractable.

A better approach would be to work right-to-left instead of left to right, solving
`3`, then `03`, then `203`. Our tree would know look more like:

```text
        (3,d)                  (3,e)                  (3,f)
         /|\                    /|\                    /|\
        / | \                  / | \                  / | \
       /  |  \                /  |  \                /  |  \
      /   |   \              /   |   \              /   |   \
(23,ad)(23,bd)(23,cd)  (23,ae)(23,be)(23,ce)  (23,af)(23,bf)(23,cf)
```

Now of course we've got three different trees running in parallel, but the benefit is
that lower levels of the tree don't repeat any work done by levels higher up. There's
no wasted repeat calculations. Lets try implementing this.

```kotlin
fun genMessagesImproved(digits: String): List<String> =
  digits.toCharArray().foldRight(listOf<String>()) { digit, acc ->
    val chars = digitMap[digit]
    if (chars == null || chars.length == 0) {
      return@foldRight acc
    }

    if (acc.size == 0) {
      return@foldRight chars?.toCharArray().map { ch -> ch.toString() }
    } else {
      val newMsgs = mutableListOf<String>()
      chars.forEach { ch ->
        acc.forEach {
          newMsgs.add("$ch$it")
        }
      }
      return@foldRight newMsgs
    }
  }
```

This is a non-lazy solution which avoids any repeated work. Being non-lazy it ends up
keeping the entire list of permutations in memory. It's probably possible to make
both a lazy and non-wasteful solution, but I'm kind burnt out now. Maybe I'll try
doing so later :stuck_out_tongue_winking_eye:.
