---
title: Symmetric Binary Tree Predicate
source: dailybyte
tags:
  - kotlin

challenge: |-
  Given a binary tree, assert whether it forms a reflection across its center.
  I.E. The left subtree has all the nodes of the right subtree, but going in
  the opposite direction. For example:

  ```text
     2
   /   \
  1     1     is a symmetric binary tree.
   \   /
    3 3

    2
   / \
  1   1       is not a symmetric binary tree.
   \   \
    3   3
  ```

runtime: "n"
language: kotlin
solution: |-
  fun isSymmetricTree(left: Tree?, right: Tree?): Boolean {
    val leftNil  = left  == null
    val rightNil = right == null

    if (leftNil && rightNil) {
      return true
    }

    // leftNil == rightNil means both are null or neither
    // are null. We've asserted that both are not null already
    // so this is just a cleaner way to check neither are null.
    return leftNil == rightNil &&
           left?.value == right?.value &&
           isSymmetricTree(left?.left, right?.right) &&
           isSymmetricTree(left?.right, right?.left);
  }

description: |-
  Recursively enumerate both the left and right subtrees in tandom, comparing the
  values of the root node in both trees at each step.

  The special case here is how we branch from one iteration to the next. In this case
  we compare the **left subtree** of the **left node** to the **right subtree** of
  the **right node** (and vice versa for the **left subtree** of the **right node**
  and the **right subtree** of the **left node**). This in affect asserts that the
  direction of a branch in one subtree is the inverse (or more aptly the symmetric
  reflection) of the same branch in the other subtree.

  Meaning these two branches:

  ```text
    1       1
   / \     / \
  2   3   2   3
  ```

  while being equal trees, are not symmetrically equal. Whereas these two trees:

  ```text
    1       1
   / \     / \
  3   2   2   3
  ```

  are symmetrically equal because:
  - the two root nodes (1) are equal.
  - The left subtree of the left node is symmetrically equal to the right subtree of the right node.
  - The right subtree of the left node is symmetrically equal to the left subtree of the right node.

  What my solution is doing is basically asserting this condition across every level
  of the tree.
---

## Test Cases
### Setup

We'll be implementing our trees using this class:

```kotlin
data class Tree(val value: Int, val left: Tree?=null, val right: Tree?=null)
```

And while not explicitly mentioned, the questions seems to be looking for a function
taking a single tree argument (instead of both left and right subtrees) so let's
create an auxiliary function to dispatch to our solution:

```kotlin
fun isSymmetricRoot(t: Tree): Boolean {
    // the current root node doesn't matter, so discard it.
    return isSymmetricTree(t.left, t.right)
}
```

Finally we'll be testing using the following tress:

```text
             2
tree_a:    /   \
          1     1

                1
              /   \
tree_b:      5     5
           /  \   /  \
          7    4 4    7

            1
           / \
tree_c:   5   5
           \    \
            7    7
```

Which in our implementation looks like:

```kotlin
val tree_a = Tree(2,
  Tree(1),
  Tree(1))

val tree_b = Tree(1,
  Tree(5,
    Tree(7),
    Tree(4)),
  Tree(5,
    Tree(4),
    Tree(7)))

val tree_c = Tree(1,
  Tree(5,
    null,
    Tree(7)),
  Tree(5,
    null,
    Tree(7)))
```

### Tests

```kotlin
isSymmetricRoot(tree_a) // true
isSymmetricRoot(tree_b) // true
isSymmetricRoot(tree_c) // false
```
