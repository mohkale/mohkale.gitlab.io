---
title: Root to Leaf Path Sum
source: dailybyte
date: 2020-07-04 22:18:00 +0000 UTC
tags:
  - typescript

challenge: |-
  given a binary tree and a `target` sum, return whether there's a path in the tree
  (from root node to leaf node) which sums to target.

runtime: "n"
language: "typescript"
solution: |+
  function rootToLeafSum(node: TreeNode|undefined, target: number) {
    if (node === undefined)
      return false

    target -= node.value

    if (isLeaf(node)) {
      return target === 0
    } else {
      return rootToLeafSum(node.left, target) ||
             rootToLeafSum(node.right, target)
    }
  }

description: |+
  Enumerate the tree from root to leaves, decrementing `target` by the current nodes
  value at each recursive invocation. If by the time we reach a leaf node, `target` is
  `0`, it means the path we've traversed sums to exactly `target`. Only one such path
  needs to be found and the algorithm will terminate, backtracking through any
  pending recursive invocations.
---

## Tree Implementation

```typescript
type TreeNode = { value: number, left?: TreeNode, right?: TreeNode }

function isLeaf(node: TreeNode) {
  return node.left === undefined && node.right === undefined
}
```

## Test Cases
### Setup

We'll be testing using the following trees.

```text
               1
              / \
Tree A:      5   2
            /   / \
           1  12   29

              104
             /   \
Tree B:    39     31
          / \    /  \
         32  1  9    10
```

Which in our implementation looks like:

```typescript
const treeA: TreeNode = {
  value: 1,
  left: {
    value: 5,
    left: {
      value: 1
    }
  },
  right: {
    value: 2,
    left: {
      value: 12
    },
    right: {
      value: 29
    }
  }
}

const treeB: TreeNode = {
  value: 104,
  left: {
    value: 39,
    left: {
      value: 32
    },
    right: {
      value: 1
    }
  },
  right: {
    value: 31,
    left: {
      value: 9
    },
    right: {
      value: 10
    }
  }
}
```

### Tests
```typescript
rootToLeafSum(treeA, 15) // true
rootToLeafSum(treeA, 6) // false
rootToLeafSum(treeA, 1) // false
rootToLeafSum(treeB, 175) // true
rootToLeafSum(treeB, 135) // false
rootToLeafSum(treeB, 104) // false
```

## Potential Optimizations
At the moment we're evaluating every possible path in the tree recursively. This is
overkill, because when target becomes negative, continuing to traverse the tree won't
ever return to 0. We can cancel early and save (potentially) many recursive invocations.

```typescript
function rootToLeafSum(node: Node, target: number, sum?: number) {
  // ...
  if (target < 0)
    return false
  // ...
}
```

## Finding the Path
My *Algorithms and Complexity* professor once said that finding **if** a solution exists is
more important than finding **the solution itself**, because:

> if you know it exists, you'll have a method for finding what it is.

This exercise can demonstrate this principle perfectly. So *how do we determine what
path in the tree, from root node to leaf node, has a sum of `target`*? We can just
have `rootToLeafSum` return an array containing the current nodes value (when we find
the target sum) and then push each nodes value to it as you backtrack.

```typescript
function rootToLeafSum(node: TreeNode|undefined, target: number) {
  if (node === undefined)
    return []

  target -= node.value

  if (isLeaf(node)) {
    return target === 0 ? [node.value] : []
  } else {
    let subNodes = rootToLeafSum(node.left, target);
    if (subNodes.length === 0) {
      subNodes = rootToLeafSum(node.right, target);
    }

    if (subNodes.length !== 0) {
      subNodes.push(node.value)
    }

    return subNodes
  }
}
```

Observe that we have to explicitly check if the left subtree sums to target, and if
not we then check the right subtree. This is because javascript doesn't consider `[]`
(the empty array) to be falsy ~~unlike most other languages~~.

Either way, here's what we get from our [previous test cases](#tests).

```typescript
rootToLeafSum(treeA, 15) // [ 12, 2, 1 ]
rootToLeafSum(treeA, 6) // []
rootToLeafSum(treeA, 1) // []
rootToLeafSum(treeB, 175) // [ 32, 39, 104 ]
rootToLeafSum(treeB, 135) // []
rootToLeafSum(treeB, 104) // []
```
