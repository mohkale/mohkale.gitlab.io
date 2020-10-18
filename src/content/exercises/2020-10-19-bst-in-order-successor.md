---
title: BST In-Order Successor
source:
  title: KeepOnCoding
  link: https://www.youtube.com/watch?v=jma9hFQSCDk

challenge: |-
  Consider a binary search tree of arbitrary height with each node having links
  to its direct parent **and** its children. Given a node in the tree, n, return its
  in-order successor I.E. the smallest node in the tree with a larger value than n.

  For example consider the binary search tree:

  ```text
      20
     /  \
    9    25
   / \
  5   12
      /\
     11 14
  ```

  The node node 12 has an in-order successor of 14. The node 11 has a successor of 12.
  If we ignore the node 14, the node 12 has an in-order successor of 20.

language: python
runtime: "n"
solution: |-
  def inorder_successor(root):
    if root.right is not None:
      return smallest_child(root.right)
    return first_larger_parent(root)

  def smallest_child(root):
    while root.left is not None:
      # drill down left subtrees
      root = root.left
    return root.value

  def first_larger_parent(root):
    # crawl up the parent hirearchy until a larger parent is found.
    while root.parent is not None and root.value > root.parent.value:
      root = root.parent
    if root.parent is not None:
      return root.parent.value

description: |-
  The thing to notice about this problem is that there are two cases for every node
  in the tree.

  If the node has a right subtree, there's must be a node in that subtree that's larger
  than the current node (by the BST principle). In this case simply going down the right
  subtree and travelling as far left as possible to the smallest node in that tree is
  sufficient to find the in-order successor.

  In the case where there's no right subtree (eg. 14 or 25) the only place where a
  successor can exist is somewhere higher up in the tree. Implicitly we consider the
  first parent node that's larger than its child to be the first node in the tree
  larger than our start node n. It may help to visualise the sequence of nodes
  considered as a straight line. From node 14 we go `14 -> 12 -> 9 -> 20`. Observe
  that in each of these cases (except for 20) the value of the nodes is decreasing.
  That is because we're going upward from the right subtree so by the BST principle
  every child is larger than it's parent. When we reach 20, we're going up from the
  left subtree, meaning we've found the first node larger than our start node n. In
  the case of node `25` the sequence is `25 -> 20` and there's no in-order successor
  because 25 is the largest node in the tree.

  For my solution above I've simply compared these two conditions and called different
  methods to find the in order successor.
---

## Tree Implementation

We'll store the tree structure as a simple class, with an additional method to assign
the parent fields so we don't have to create the parents and then assign the children
separately.

```python
import dataclasses

@dataclasses.dataclass
class Node:
  value: int
  left:   Optional['Node'] = None
  right:  Optional['Node'] = None
  parent: Optional['Node'] = None

  @staticmethod
  def assign_parents(tree):
    def recursive_do(parent, node):
      if node is not None:
        node.parent = parent
        recursive_do(node, node.left)
        recursive_do(node, node.right)
    recursive_do(None, tree)
    return tree
```

## Test Cases
Let's recreate the tree from our example above.

```python
tree = Node.assign_parents(
  Node(20,
       Node(9, Node(5),
               Node(12, Node(11),
                        Node(14))),
       Node(25)))
```

Now lets find the successor for every node in the tree.

```python
inorder_successor(tree)                  # 20 => 25
inorder_successor(tree.left)             # 9  => 11
inorder_successor(tree.left.left)        # 5  => 9
inorder_successor(tree.left.right)       # 12 => 14
inorder_successor(tree.left.right.left)  # 11 => 12
inorder_successor(tree.left.right.right) # 14 => 20
inorder_successor(tree.right)            # 25 => None
```


