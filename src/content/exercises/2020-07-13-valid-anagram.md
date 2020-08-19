---
title: Valid Anagram
source: dailybyte
tags: [golang]

challenge: |-
  given two strings, return whether the first is an anagram of the second.

runtime: "n"
language: go
solution: |-
  func IsAnagram(str, rts []rune) bool {
  	if len(str) != len(rts) {
  		return false
  	}

  	charCounts := make(map[rune]int)
  	for i := range str {
  		// ignore ok, when !ok returns 0
  		sCurrent, _ := charCounts[str[i]]
  		charCounts[str[i]] = sCurrent + 1

  		rCurrent, _ := charCounts[rts[i]]
  		charCounts[rts[i]] = rCurrent - 1
  	}

  	for _, v := range charCounts {
  		if v != 0 {
  			return false
  		}
  	}

  	return true
  }
description: |+
  enumerate through each character in both strings and count their occurences. A
  character appearing in the first string increases its count, whereas one appearing
  in the right string decreases its count. If by the end all the character counts
  balance out (each character appears the same number of times in both strings), then
  they're anagrams of each other.
---

## Test Cases
```go
IsAnagram([]rune("cat"), []rune("tac")) // true
IsAnagram([]rune("listen"), []rune("silent")) // true
IsAnagram([]rune("program"), []rune("function")) // true
```

## Alternative Implementation
An implementation with a larger time complexity but no space complexity is also
possible. We can simply sort both strings and compare them to each other. If their
anagrams then their sorted output must be equal.

```go
func sortRunes(str []rune) {
	sort.Slice(str, func(i, j int) bool { return str[i] < str[j] })
}

func IsAnagram(str, rts []rune) bool {
	if len(str) != len(rts) {
		return false
	}

	sortRunes(str)
	sortRunes(rts)

	for i := range str {
		if str[i] != rts[i] {
			return false
		}
	}

	return true
}
```
