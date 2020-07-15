---
title: Vacuum Robot Route
source: dailybyte
date: 2020-07-05 18:28:00 +0000 UTC
tags:
  - go(lang)

challenge: |-
  Consider a vacuum cleaning robot which recieves a sequence of actions to determine
  the route it takes. This sequence is a string and each character of the string
  corresponds to a possible action: `L`, `R`, `U`, `D` for Left, Right, Up and Down
  respectively. Determine whether a robot will return to its start position at the
  end of the route.

runtime: "n"
language: go
solution: |-
  func routeIsCycle(route string) bool {
  	x, y := 0, 0
  	for _, ch := range route {
  		switch ch {
  		case 'L':
  			x -= 1
  		case 'R':
  			x += 1
  		case 'U':
  			y -= 1
  		case 'D':
  			y += 1
  		}
  	}
  	return x == 0 && y == 0
  }
description:
  The robot exists in a 2D plane and starts from some arbitrary position (0,0).
  Each action pushes the robot in some direction, modifying its position vector.
  For every action of the route apply the transformation to the robots position
  and simply assert whether the final position equals the start position.
---

## Test Cases
```go
routeIsCycle("LR") // => true
routeIsCycle("URURD") // => false
routeIsCycle("RUULLDRD") // => true
```
