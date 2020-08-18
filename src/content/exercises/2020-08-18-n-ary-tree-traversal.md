---
title: Level Based Tree Traversal
source: dailybyte
tags:
  - ruby

challenge: |-
  Given a tree, return the level order traversal of the tree. The level order
  traversal of the tree enumerates the tree while collecting all elements at
  the same depth into an array.

runtime: "n"
language: "ruby"
solution: |-
  def level_tree_traverse(node, res, depth=0)
    if res[depth]
      res[depth] << node.value
    else
      res[depth] = [node.value]
    end

    node.children.each do |child|
      level_tree_traverse(child,  res, depth+1)
    end

    res
  end

description:
  Recursively enumerate the tree while maintaining a counter indicating the current
  depth (relative to the root node). At each recursive invocation, populate the index
  at the current depth in the `res` array with the the current nodes value.
---

## Tree Implementation

```ruby
Tree = Struct.new("Tree", :value, :children) do
  def initialize(value, children=[])
    super
  end
end
```

## Test Cases
### Setup

We'll be testing using the following trees:

```text
                  8
Tree A:         / | \
               2  3  29

                  2
                / | \
               1  6  9
Tree B:       /   |   \
             8    2    2
                / | \
              19 12 90
```

```ruby
tree_a = Tree.new(
  8, [
    Tree.new(2),
    Tree.new(3),
    Tree.new(29),
  ]
)

tree_b = Tree.new(
  2, [
    Tree.new(1, [
      Tree.new(8)
    ]),
    Tree.new(6, [
      Tree.new(2, [
        Tree.new(19),
        Tree.new(12),
        Tree.new(90),
      ])
    ]),
    Tree.new(9, [
      Tree.new(2)
    ])
  ]
)
```

### Tests

```ruby
level_tree_traverse(tree_a, []) # [[8], [2, 3, 29]]
level_tree_traverse(tree_b, []) # [[2], [1, 6, 9], [8, 2, 2], [19, 12, 90]]
```
