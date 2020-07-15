---
title: First Unique Character
source: dailybyte
tags: [typescript]

challenge: |-
  find the first unique character in a string. A character is unique if it occurs
  only once in the entire string.

runtime: "n"
language: typescript
solution: |+
  function firstUniqueChar(str: string) {
      let mem: {[key: string]: number} = {}
      for (let ch of str) {
          let current: number|null = mem[char]
          mem[ch] = (current) ? current+1 : 1
      }
      for (let [i, ch] of str.split('').entries()) {
          if (mem[ch] == 1) {
              return i
          }
      }
      return -1
  }

description: |+
  count how many times each character occurs in the string, then go through it in
  order and return the first character which occurs only once.
---

## Test Cases
```typescript
firstUniqueChar("abcabd") // 2
firstUniqueChar("thedailybyte") // 1
firstUniqueChar("developer") // 0
```
