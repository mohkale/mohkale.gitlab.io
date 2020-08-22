---
title: String Case Permutations
source: dailybyte
tags:
  - golang

challenge: |-
  Given a string `s`, consisting of alphanumeric characters, enumerate all permutations
  of `s` with the condition that you can convert each character to either uppercase or
  lowercase. The result should **not** contain duplicates.

  For example, the string `"c7w2"` would enumerate `["c7w2", "c7W2", "C7w2", "C7W2"]`.

runtime: "n!"
language: go
solution: |-
  func casePermutations(s []rune, ch chan string) {
  	var casePermute func([]rune, []rune)
  	casePermute = func(s []rune, acc []rune) {
  		if (len(s) == 0) {
  			ch <- string(acc)
  		} else {
  			char, rest := s[0], s[1:]
  			charUpper := unicode.ToUpper(char)
  			charLower := unicode.ToLower(char)

  			if (charUpper == charLower) {
  				casePermute(rest, immutableAppend(acc, char))
  			} else {
  				casePermute(rest, immutableAppend(acc, charLower))
  				casePermute(rest, immutableAppend(acc, charUpper))
  			}
  		}
  	}
  	casePermute(s, make([]rune, len(s)))
  	close(ch)
  }

description: |-
  Recursively enumerate the string from left to right, changing the number of
  recursive invocations at each depth depending on the current character. The
  idea is to use recursion to build up each permutation of the string. Exploring
  different branches exhaustively when the branch condition has been met.

  For example, a complete path through the recursive search space for the
  string `"c7w2"` could be:

  | depth | `s`      | `char` | `acc`    | branched? | finished? |
  |-------|----------|--------|----------|-----------|-----------|
  | 0     | `"c7w2"` | `"c"`  | `""`     | `true`    | `false`   |
  | 1     | `"7w2"`  | `"7"`  | `"c"`    | `false`   | `false`   |
  | 2     | `"w2"`   | `"w"`  | `"c7"`   | `true`    | `false`   |
  | 3     | `"2"`    | `"2"`  | `"c7w"`  | `false`   | `false`   |
  | 4     | `""`     | `nil`  | `"c7w2"` | `false`   | `true`    |

  **NOTE**: The *branched?* column indicates whether this recursive step has produced
  only one sub-branch or more. This is the case when the current character has an
  uppercase and lowercase variant, which means the our solution must explore both
  possibilities.

  Observed that by the time `s` is reduced to the empty string, `acc` is a complete
  string and a valid case permutation of the original string.

  Lets try this again, this time exploring the branch where `c` was made into an
  uppercase character.

  | depth | `s`      | `char` | `acc`    | branched? | finished? |
  |-------|----------|--------|----------|-----------|-----------|
  | 0     | `"c7w2"` | `"c"`  | `""`     | `true`    | `false`   |
  | 1     | `"7w2"`  | `"7"`  | `"C"`    | `false`   | `false`   |
  | 2     | `"w2"`   | `"w"`  | `"C7"`   | `true`    | `false`   |
  | 3     | `"2"`    | `"2"`  | `"C7w"`  | `false`   | `false`   |
  | 4     | `""`     | `nil`  | `"C7w2"` | `false`   | `true`    |

  The only difference here is that we've added the uppercase `"C"` to the accumulator
  instead of the lower case one. This repitition of considering each character and
  expanding to a new recursive branch is how we can enumerate all permutations.

  Observe that yet again, by the time `s` is an empty string, we've reached a new
  **unique** `acc` value that is also another case permutation of the original string.
---

## Utils
These are the definitions of the functions that I've used in the solution and while
testing.

```go
/**
 * Append a value to a slice immutably. Returns a new slice, while leaving
 * the original slice in place.
 */
func immutableAppend(slice []rune, ch rune) []rune {
	clone := make([]rune, len(slice)+1)
	copy(clone, slice)
	clone[len(slice)] = ch
	return clone
}

/**
 * Run case permutations and then print the output as a slice.
 */
func printPermutations(s string) {
	ch := make(chan string)
	go casePermutations([]rune(s), ch)
	fmt.Print("[")
	for perm := range ch {
		fmt.Printf("%s,", perm)
	}
	fmt.Print("]")
}
```

## Test Cases
```go
printPermutations("c7w2") // [c7w2,c7W2,C7w2,C7W2,]
printPermutations("") // [,]
printPermutations("1234") // [1234,]
printPermutations("hello") // [hello,hellO,helLo,helLO,heLlo,heLlO,heLLo,heLLO,hEllo,hEllO,hElLo,hElLO,hELlo,hELlO,hELLo,hELLO,Hello,HellO,HelLo,HelLO,HeLlo,HeLlO,HeLLo,HeLLO,HEllo,HEllO,HElLo,HElLO,HELlo,HELlO,HELLo,HELLO,]
```
