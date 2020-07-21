---
title: Middle of a Linked List
source: dailybyte
tags: [python]

challenge: |-
  given a non-empty, singly, linked list, return a pointer to the middle of the list.
  if the list contains an even number of elements, return the one closer to the end.

runtime: "n"
language: python
solution: |-
  def linked_list_middle(head):
    p1, p2 = head, head
    while p2 != None:
      p2 = p2.next
      if p2 == None:
        break
      p1 = p1.next
      p2 = p2.next
    return p1
description: |+
  Maintain two pointers with two different step widths. For every step forward the
  first pointer takes, make the other take 2. Once the second pointer has reached the
  end of the array, the first should be at the middle of it.
---


## Linked List Implementation
```python
class Node:
  def __init__(self, value, next=None):
    self.value = value
    self.next = next

  @classmethod
  def from_list(cls, lst):
    parent = None
    for elem in reversed(lst):
      parent = cls(elem, next=parent)
    return parent
```
