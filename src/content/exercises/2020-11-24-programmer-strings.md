---
title: Programmer Strings
source: OA # THG

challenge: |-
  Given a string `s` a *programmer* string `t` is a substring of `s` that contains all
  the characters in the string programmer. For example `"aprogrammera"` has a programmer
  string starting at index 1. `"ammerprog"` is also a programmer string (starting at index 0).

  Given a string `s` that's guaranteed to have two none-overlapping programmer strings find the
  distance between these two programmer strings. For example `"programmerprogrammer"` has a
  distance of 0, `"programmeraprogrammer"` has a distance of 1.

  NOTE: We only care about the distance between the two furthest apart programmer strings.
  `"programmerprogrammerprogrammer"` has a distance of 10, not 0.

language: python
runtime: "n"
solution: |-
  class CounterWithLen(object):
    def __init__(self, it):
      self.mem = {}
      self.length = len(it)
      for ch in it:
        self.mem[ch] = self.mem.get(ch, 0) + 1

    def deduct(self, ch):
      if ch in self.mem and self.mem[ch] > 0:
        self.mem[ch] = self.mem[ch]-1
        self.length -= 1

  def programmer_ind(s, start, step):
    counter = CounterWithLen('programmer')
    i = start
    while len(s) > i >= 0:
      counter.deduct(s[i])
      if counter.length == 0:
        # completed programmer string here.
        return i
      i += step
    return -1

  def programmer_strings(s):
    start = programmer_ind(s, 0, 1)
    end   = programmer_ind(s, len(s)-1, -1)

    if start == -1 or end == -1:
      # should be impossible... but just in case.
      return 0

    # it's guaranteed that a *non-overlapping* programmer string
    # occurs in s so we don't need to check whether end>start.
    return end-start-1

description: |-
  This problem could be more easily phrased as:
  > Have we found all the characters in a programmer string.

  If we can guarantee that condition in linear time than finding the distance
  between two programmer strings becomes as straightforward as simply finding
  the first programmer string and the last programmer string and finding the
  distance between them.

  To assert whether we've found a programmer string I've created a special counter
  class `CounterWithLen`. This class takes an input string and produces a dict mapping
  from character to frequencies. It also keeps track of the sum of all the frequencies
  currently in the Counter. In `programmer_ind` I start at one end of the string and
  for each character I encounter I decrement the same counter in `CounterWithLen`
  (avoiding any negative values). Once the sum of all the counts in the counter become
  0 all the characters in the input string have been encountered (at least as many
  times as they occur in that string). This gives me a quick way to find the index of a
  programmer string.

  I then find these indexes from the start of the string and then end of it and then
  return the difference between them.
---


## Test Cases

```python
programmer_strings('progxrammerrxproxgrammer') # 2
programmer_strings('programmerprogrammer') # 0
programmer_strings('xprogxrmaxemrppprmmograeiruu') # 2
```
