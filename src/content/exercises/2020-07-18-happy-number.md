---
title: Happy Number
source: leetcode
tags: [ruby]

challenge: |-
  A happy number is a number which through the following process eventually converges
  to 1. We take the number and then square each digit of its representation and then
  sum them. If this process loops indefinitely then we do not have a happy number.

# runtime:
language: ruby
solution: |-
  def sum_digits_squared(num)
    num.to_s
       .split('')
       .map { |i| i.to_i ** 2 }
       .reduce { |i, j| i + j }
  end

  def happy_num?(num)
    mem = []
    while num != 1
      return false if mem.include?(num)

      mem << num
      num = sum_digits_squared(num)
    end
    true
  end

description:
  Simply perform the desired operation until you converge at 1. The trick is detecting
  when you enter an infinite loop and accounting for it. In this case I track every
  number at each iteration and if I encounter the same number twice I conclude I've
  entered a loop and return false.
---

## Test Cases

using [all](https://mathworld.wolfram.com/HappyNumber.html) happy numbers under 100.

```ruby
happies = [1, 7, 10, 13, 19, 23, 28, 31, 32, 44, 49,
           68, 70, 79, 82, 86, 91, 94, 97, 100]

(2..100).each do |num|
  is_happy = happy_num?(num)
  if is_happy != happies.include?(num)
    if is_happy
      puts "FAILED: #{num} is happy when it shouldn't be"
    else
      puts "FAILED: #{num} is not happy when it should be"
    end
  end
end

# As with unix, silence is good :smile:.
```
