---
title: Array Product Excluding Self
source:
  title: leetcode
  link: https://leetcode.com/explore/challenge/card/30-day-leetcoding-challenge/530/week-3/3300/

challenge: |-
  Given an array of non-zero positive integers, return an output array with each
  element at index $$i$$ is equal to the product of all the numbers in the original
  array excluding the $$i^{th}$$ number. For example:

  ```python
  product_except_self([1,2,3,4]) # [24,12,8,6]
  ```

runtime: "n"
language: python
solution: |-
  from functools import reduce

  product_accumulate = lambda acc, x: \
    [x] if len(acc) == 0 else [*acc, acc[-1] * x]

  def product_except_self(nums):
    left_prods  = reduce(product_accumulate, nums, [])
    right_prods = reduce(product_accumulate, nums[::-1], [])[::-1]
    get_product = lambda i: \
      (left_prods[i-1]  if i > 0           else 1) * \
      (right_prods[i+1] if i < len(nums)-1 else 1)

    return [get_product(i) for i in range(len(nums))]

description: |-
  This solution takes advantage of the fact that multiplication is commutative.
  $$(a * b) * c$$ is equal to $$a * (b * c)$$. We construct two arrays, one
  containing the product of all numbers going left to right, and the other right
  to left.

  | Original    | 1  | 2  | 3  | 4  |
  |-------------|:--:|:--:|:--:|:--:|
  | Left->Right | 1  | 2  | 6  | 24 |
  | Right->Left | 24 | 24 | 12 | 4  |

  Now lets consider the calculations we need to make to get the `product_except_sum`
  result.

  $$
  \begin{eqnarray}
    &[& \\
    & & (2  &*& 3  &*& 4), \\
    & & (1) &*& (3 &*& 4), \\
    & & (1  &*& 2) &*& (4), \\
    & & (1  &*& 2  &*& 3), \\
    &]&
  \end{eqnarray}
  $$

  Observe that a pattern emerges. The final value for each index $$i$$ consists of
  the products of the numbers before $$i$$ and the products of the numbers after
  $$i$$. In the special case for $$i = 0$$ and $$i = \text{len(nums)}-1$$, its simply
  the product of all the numbers aside from them.

  Observe that the above can be reduced, using the left->right and right->left
  arrays we defined above, to:

  $$
  \begin{eqnarray}
    &[& \\
    & &   & & 24 & \qquad (&               & & \text{right}[1]&) \\
    & & 1 &*& 12 & \qquad (&\text{left}[0] &*& \text{right}[2]&) \\
    & & 2 &*& 4  & \qquad (&\text{left}[1] &*& \text{right}[3]&) \\
    & & 6 & &    & \qquad (&\text{left}[2] & &                &) \\
    &]&
  \end{eqnarray}
  $$

  As we increment $$i$$ from 0 to the end of the array we pick values in `left` and
  `right` adjacent to $$i$$ and multiply them to get the product. So in affect we
  cache the products of all values before each index, and after each index (in two
  arrays) and then pick them as we enumerate the array to get the appropriate products.
---
