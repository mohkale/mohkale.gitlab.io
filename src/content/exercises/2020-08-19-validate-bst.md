---
title: Validate Binary Search Tree
source: dailybyte
tags:
  - golang

challenge: |-
  Given a binary tree containing unique values, assert whether the tree is a valid
  binary search tree.

runtime: "n"
language: go
solution: |-
  func validBst(t *Tree) bool {
  	if (t == nil) {
  		return true
  	}

  	if (t.left  != nil && t.left.value  > t.value ||
  		t.right != nil && t.right.value < t.value) {
  		return false
  	}

  	return validBst(t.left) && validBst(t.right)
  }

description: |-
  Recursively assert the **Binary Search Tree** condition on every node on the tree. I.E.
  - If this node has a left subtree then the root of that tree must be less than
    the current node.
  - If this node has a right subtree then the root of that tree must be greater than
    the current node.
  - Both the left subtree and right subtree are also binary search trees.
---

## Tree Implementation
```go
type Tree struct {
	value int
	left, right *Tree
}
```

## Test Cases
### Setup

We'll be testing using the following tree structures:

```text
            2
Tree a:   /   \
         1     3

            1
Tree b:   /   \
         2     3
```

```go
tree_a := Tree{2,
	&Tree{1, nil, nil},
	&Tree{3, nil, nil},
}

tree_b := Tree{1,
	&Tree{2, nil, nil},
	&Tree{3, nil, nil},
}
```

### Tests
```go
validBst(&tree_a) // true
validBst(&tree_b) // false
```
