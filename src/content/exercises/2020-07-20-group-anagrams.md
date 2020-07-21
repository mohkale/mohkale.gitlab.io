---
title: Group Anagrams
source: leetcode
tags: [javascript]

challenge: |-
  given a collection of strings of lowercase characters, partition them into
  subsets according to which strings are anagrams of each other.

runtime: "s \\; log \\; s"
language: javascript
solution: |-
  function stringSort(str) {
      return str
        .split('')
        .sort()
        .join('')
  }

  function groupAnagrams(strings) {
      const mem = Object.fromEntries(
          strings.map(str => [str, stringSort(str)]))

      const map = {}
      strings.forEach((str) => {
          const hash = mem[str]
          if (map[hash]) {
              map[hash].push(str)
          } else {
              map[hash] = [str]
          }
      })
      return Object.values(map)
  }
description: |-
  Use the sorted string as a key to compare against other strings which you can
  then group. The runtime complexity is how long it takes to sort the longest
  string in the strings array.
---

## Test Cases
```javascript
groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"])
/*
[
  ["ate","eat","tea"],
  ["nat","tan"],
  ["bat"]
]
*/
```

## Alternative Implementation
Another way to approach this problem is by constructing a hashing function that
hashes anagrams to themselves, but different strings to a unique hash. I.E. a
string based, order insensitive, hashing function.

```javascript
function isPrime(i) {
    for (let j=2; j <= i / 2; j++) {
        if (i % j === 0) {
            return false
        }
    }

    return true
}

/* first prime number greater than {@code n}. */
function prime(n) {
    while (n++) {
        if (isPrime(n)) {
            return n
        }
    }
}

const mem = Object.fromEntries(
    'abcdefghijklmnopqrstuvwxyz'
    .split('')
    .reduce((acc, ch) => {
        let last = acc[acc.length - 1]
        if (last) {
            acc.push([ch, prime(last[1])])
            return acc
        } else {
            return [[ch, 2]] // firstPrime
        }
    }, []))

function strHash(str) {
    return str
        .split('')
        .map(ch => mem[ch])
        .reduce((a,b) => a * b)
}
```

`strHash` function first maps each possible character of the input through a
dictionary of primes and then returns the product of them. The primes are generated
beforehand in the `mem` object. Observe that:

```javascript
strHash('abc') // 30
strHash('cba') // 30
strHash('abd') // 42
strHash('adb') // 42
```

Our `strHash` correctly maps anagrams to the same hash value, but different strings
to different hash values. We can use this to construct a solution to our original
problem in linear time.

```javascript
function groupAnagrams(strings) {
    const map = {}
    strings.forEach((str) => {
        const hash = strHash(str)
        if (map[hash]) {
            map[hash].push(str)
        } else {
            map[hash] = [str]
        }
    })
    return Object.values(map)
}
```

Observe however that even if, in theory, the runtime of this algorithm is $$O(n)$$ it
has, in practice, major space complexity and runtime issues. Firstly multiplying each
hash value for each character takes an extremely long time for suitably long strings;
in a Turing machine multiplication is a constant time operation so this doesn't
matter but in real computing models it's a **real** issue. Secondly the hash result
for large strings is also a very large number. In javascript this isn't an issue
because there's no such thing as overflow, but in lower level languages you'd have to
use a bignum implementation.

Summary: This is a good solution in theory, bad in practice.
