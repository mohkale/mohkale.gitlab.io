---
title: Same Leaves
source: dailybyte
tags:
  - typescript

challenge: |-
  Given two binary trees, return whether or not both trees have the same leaf sequence. Two
  trees have the same leaf sequence if both trees’ leaves read the same from left to right.

  For example the two trees:

  ```text
    8            8
   / \          / \
  2   29       2   29
    /  \         /  \
   3    9       3    9
    \
     4
  ```

  Have a leaf sequence of `[2, 4, 9]` & `[2, 3, 9]` respectively.

runtime: "Min(t1+t2)"
language: typescript
solution: |-
  function* preOrderTraverseLeaves(t?: Tree): Generator<number> {
    if (t === undefined) {
      return
    }

    if (isLeaf(t)) {
      yield t.value
    } else {
      yield* preOrderTraverseLeaves(t.left)
      yield* preOrderTraverseLeaves(t.right)
    }
  }

  function sameLeaves(t1: Tree, t2: Tree): boolean {
    const t1LeavesGen = preOrderTraverseLeaves(t1),
          t2LeavesGen = preOrderTraverseLeaves(t2);

    while (true) {
      const t1Leaf = t1LeavesGen.next(),
            t2Leaf = t2LeavesGen.next();

      if (t1Leaf.value !== t2Leaf.value ||
          t1Leaf.done  !== t2Leaf.done) {
        return false
      } else if (t1Leaf.done && t2Leaf.done) {
        break
      }
    }

    return true
  }

description: |-
  We construct two *generators* for each tree which generates the leaves of the tree.
  Each iteration we consume one leaf from each generator and assert whether they have
  the same value or not. We also check whether both generators finish at the same time
  or not (the idea being if one finishes while the other is running, the two must have
  a different number of leaves and therefore have a different leaf sequence).

  This is an in-place linear time solution.

  **NOTE**: the `function*` syntax is how javascript defines [lazy generators][generators].

  [generators]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators
---

## Tree Implementation
```typescript
interface Tree {
    value: number
    left?: Tree
    right?: Tree
}

function isLeaf(t: Tree) {
    return t.left === undefined &&
      t.right === undefined;
}
```

## Test Cases
### Setup
We'll be testing using the following trees:

```text
             1
tree_a:    /   \
          1     3

             7
tree_b:    /   \
          1     2

            8
           / \
tree_c:   2   29
            /  \
           3    9

              8
             / \
tree_d:     2  29
           /   /  \
          2   3    9
               \
                3
```

Which in our implementation looks like:

```typescript
const treeA: Tree = {
  value: 1,
  left: {
    value: 1
  },
  right: {
    value: 3
  }
}

const treeB: Tree = {
  value: 7,
  left: {
    value: 1
  },
  right: {
    value: 2
  }
}

const treeC: Tree = {
  value: 8,
  left: {
    value: 2
  },
  right: {
    value: 29,
    left: {
      value: 3
    },
    right: {
      value: 9
    }
  }
}

const treeD: Tree = {
  value: 8,
  left: {
    value: 2
  },
  right: {
    value: 29,
    left: {
      value: 3,
      right: {
        value: 3
      }
    },
    right: {
      value: 9
    }
  }
}
```

### Test Cases

```kotlin
sameLeaves(treeA, treeA) // true
sameLeaves(treeA, treeB) // false
sameLeaves(treeC, treeD) // true
```
