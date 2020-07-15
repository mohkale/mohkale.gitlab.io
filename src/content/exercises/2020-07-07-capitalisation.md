---
title: Capitalization Check
source: dailybyte
date: 2020-07-05 13:25:00 +0000 UTC

tags:
  - ruby

challenge: |-
  Check whether a string is capitalised correctly. This is the case if all
  letters are capitalised, no letters are capitalised or only the first letter
  is capitalised.

runtime: "n"
language: ruby
solution: |-
  String.define_method :capitalized? do
      self == self.downcase ||
        self == self.upcase ||
        self[0] == self[0].upcase && self[1..] == self[1..].downcase
  end
---

## Test Cases
```ruby
"USA".capitalized? #=> true
"Calvin".capitalized? #=> true
"compUter".capitalized? #=> false
"coding".capitalized? #=> true
```

