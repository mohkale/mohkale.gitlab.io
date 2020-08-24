---
title: Word Search
source: dailybyte
tags:
  - ruby

challenge: |-
  Given a 2D board that represents a word search puzzle and a string `word`, assert
  whether the given word can be formed in the puzzle by connecting cells only
  horizontally and vertically.

runtime: "\\text{cols} * \\text{rows} * \\text{len(word)} * log \\text{(len(word))}"
language: ruby
solution: |-
  class SearchMap
    attr_reader :map
    def initialize(map); @map = map; end
    def cols; @cols ||= map.length;    end
    def rows; @rows ||= map[0].length; end

    def search(word)
      map.each.with_index do |row, i|
        row.each.with_index do |entry, j|
          return true if entry == word[0] && search_path(word, i, j)
        end
      end

      false
    end

    private def search_path(word, x, y)
      ch, rest = word[0], word[1..]
      return true if rest.length.zero?

      map[x][y] = nil # prevent cycles

      path_found = false \
        || x > 0      && map[x-1][y] == rest[0] && search_path(rest, x-1, y) \
        || y > 0      && map[x][y-1] == rest[0] && search_path(rest, x, y-1) \
        || x < cols-1 && map[x+1][y] == rest[0] && search_path(rest, x+1, y) \
        || y < rows-1 && map[x][y+1] == rest[0] && search_path(rest, x, y+1)

      path_found
    ensure
      map[x][y] = ch if ch
    end
  end

description: |-
  First we go through each entry on the board to find the position of a letter that
  matches the first letter of our word. Then we start a recursive search across every
  path from that entry that eventually converges to our desired word.

  This implementation is slightly different to other recursive solutions I've worked
  on in the past. Here we're passing an already valid position (some point on the
  board). This is because there's *some extra logic* we want to handle before and just
  after we've branched. We then check each character to the left, right, below or
  above of the current character to see if it matches the next character in the word.
  If it does we strip off one character and recurse to the next position. This process
  repeats until we've found the word we want at least once, at which point [short-circuit][sc]
  evaluation avoids any unecessary extra work.

  [sc]: https://en.wikipedia.org/wiki/Short-circuit_evaluation

  Observe also that at each recursive step, we assign the current characters value to
  `nil` before branching. This is to prevent cycles in the search path. For example,
  if we didn't have this `nil` assignment and used the following search map:

  ```ruby
  [
    ['A', 'B', 'C']
  ]
  ```

  To search for the word `ABA`. It would return true because we start at `A` goto the right
  to find `B` and then go back left to find `A`. The problem never stated that cycles
  were forbidden, but I felt it makes little sense to allow them so I've actively accounted
  for them.

  **WARN**: This isn't a thread safe implementation. If two different threads tried
  running `SearchMap.search` on the same instance concurrently, then you would get
  inconsistent behaviour. A thread safe approach would either have to allow cycles
  or keep track of positions that've already been attempted while recursing instead
  of setting them to `nil`. The latter adds complexity that's out of the scope of this
  exercise, but a good challenge for any who want to try it.
---

## Test Cases
```ruby
sm = SearchMap.new([
  ['C','A','T','F'],
  ['B','G','E','S'],
  ['I','T','A','E']
])
```

```ruby
sm.search("CAT") # true
sm.search("TEA") # true
sm.search("SEAT") # true
sm.search("BAT") # false
sm.search("TIBI") # false

# snake pattern going across rows
sm.search("CBITGATEAESF") # true

# snake pattern going across columns
sm.search("CATFSEATIBGE") # true
```
