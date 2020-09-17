---
title: Gradle
date: 2020-04-25

version: 5.6.4
language: Gradle (Kotlin)
wiki_link: https://docs.gradle.org/current/userguide/userguide.html
---

gradle is a build framework implemented in java. It has supports both
[groovy][groovy-wiki] and [kotlin][kotlin-wiki] for defining build tasks. Before you
venture any further, it's probably worth taking a look at my [Kotlin]({{< relref "kotlin.md" >}})
language notes (if you're not familliar with the language), because that's the
preferred build DSL for this guide.

gradle is implemented using the following configuration files:

| File                      | Description                                                                |
|:-------------------------:|:---------------------------------------------------------------------------|
| **build.gradle{.kts}**    | the script file in which tasks are implemented                             |
| **gradle.properties**     | configuration settings for the java build processIncluding the `buildDir`. |
| **settings.gradle{.kts}** | also specifies configuration settings the java build process               |


**gradle.properties** and **settings.gradle{.kts}** differ in two very important
ways. The former is a simple java
[properties](https://docs.oracle.com/javase/7/docs/api/java/util/Properties.html)
file, whereas the latter is a complete scriptable file which is compiled and executed
before any build scripts. Only one **settings.gradle{.kts}** file will be sourced per
build. You can find more information about the differences
[here](https://stackoverflow.com/questions/45387971).

[groovy-wiki]: https://en.wikipedia.org/wiki/Apache_Groovy
[kotlin-wiki]: https://en.wikipedia.org/wiki/Gradle

## Tasks
A gradle build script consists of projects & tasks. A task consists of inputs and
outputs; alongside a series of actions which turn inputs into outputs. When you
invoke a gradle build, you specify some tasks to be run, which're then processed and
ordered by:

- The task dependencies
- The '*must run before*' and '*should run before*' rules
- The appearence of the task in the command line

### Creating & Accessing Tasks
Every build consists of a configuration and a build phase. Task instances are created
and populated during the configuration phase, whereas the actual building (invocation
of tasks) takes place in a build phase.

```kotlin
tasks.register("foo") {
    println("woohoo, a new task")
}

val foo = tasks["foo"]
```

This registers new task (creates a `DefaultTask` instance) with the name `foo` and
then evaluates the body of the \{braces\} within the context of the object. You can
both register a task and store the created task object using [delegated
properties](https://kotlinlang.org/docs/reference/delegated-properties.html); however
the delegated registerer doesn't return a task instance, it instead returns a
[`Provider<T>`](https://docs.gradle.org/current/javadoc/org/gradle/api/provider/Provider.html)
instance. You can access the Task instance from it by using the [`Provider<T>.get()`]
method, however you can generally use the `Provider<T>` anywhere you would use a task
object.

```kotlin
val foo = tasks.registering {
    println("woohoo, a new task")
}

// tasks.named("foo") // is an alternative
// to tasks["foo"] but returns a Provider.
```

You can configure something to be done for a task during the build phase by
registering actions. Two of the most common actions are `doLast` and `doFirst`.

```kotlin
tasks.register("foo") {
    doLast  { println("hello world") }
    doLast  { println("goodbye world") }
    doFirst { println("lo and behold") }

    println("here's a new object")
}
```

```console
> ./gradlew foo
here's a new object

- Task :foo
lo and behold
hello world
goodbye world

BUILD SUCCESSFUL in 9s
1 actionable task: 1 executed
```

NOTE gradlew is a shell script standing for *gradle wrapper*; a gradle project can
use a wrapper instead of the gradle executeable. What a wrapper does, is ensure the
the same gradle version is always used to build/run the project (installing other
versions if your current version doesn't match).

### Path Syntax
There's a specified path syntax for selecting tasks to be run. A task by itself is
identified by it's name. A task within a project is identified by the project name
joined by **:**. A **:** suffix on a path represents one starting from the root
project, whereas the absence of it means *relative to the current project*.

### Inter Task Dependencies
Consider a gradle build using the command line `./gradlew foo bar baz`. The order in
which these three tasks are executed will, excluding any other relationships, match
the order in which they're stated. If you reorder them to `baz bar foo` the order of
outputs will also be reversed. One way of ordering the execution of some tasks are
literal dependencies, meaning for one task to complete, another should be run first.
This is done using the `dependsOn` method of
[`org.gradle.api.DefaultTask`][DefaultTask].

[DefaultTask]: https://docs.gradle.org/current/javadoc/org/gradle/api/DefaultTask.html

```kotlin
tasks.register("baz") {
    doLast {
        println("running task baz")
    }
}

tasks.register("bar") {
    dependsOn("baz")

    doLast {
        println("running task bar")
    }
}

tasks.register("foo") {
    dependsOn("bar", "baz")

    doLast {
        println("running task foo")
    }
}
```

*File*: build.gradle.kts

Now if we try to run all three tasks, regardless of which order we specify them, they
will be run with `baz` first (because it doesn't depend on any other task), followed
by `bar` (because baz has already been run and `bar` has no other dependencies) and
lastly `foo`.

```console
> ./gradlew -q foo bar baz
running task baz
running task bar
running task foo
```

```console
> ./gradlew -q bar foo baz
running task baz
running task bar
running task foo
```

### Avoiding Dependencies
An annoying consequence of explicit dependencies, is that running one command may
inadvertently invoke other commands you didn't intend to be invoked. For example, in
the previous build `./gradlew foo bar baz` could just as well be written `./gradlew
foo` and the tasks `bar` & `baz` will also be run. What we may instead want is a
relationship between tasks stating if two tasks, `taskA` & `taskB`, need to be run
`taskA` should always be run before `taskB`. Lo and behold, gradle has a mechanism
for this.

`mustRunAfter` & `shouldRunAfter` specify an ordering between tasks. The former
demands the ordering between two tasks, wheras the latter simply suggests it. Both
are needed in case `mustRunAfter` causes a cyclic ordering, in which case the build
would fail.

> You should use “should run after” where the ordering is helpful but not strictly required.

```kotlin
tasks.register("foo") {
    doLast {
        println("running task foo")
    }
}

tasks.register("bar") {
    shouldRunAfter(tasks["foo"])

    doLast {
        println("running task bar")
    }
}
```

*File*: build.gradle.kts

```console
> ./gradlew -q foo
running task foo
```

```console
> ./gradlew -q bar
running task bar
```

```console
> ./gradlew -q bar foo
running task foo
running task bar
```

Notice that no task other the ones specified in the command line are run. `foo` does
not cause `bar` to be run and vice versa. When both are specified, `foo` is run
before `bar` even when `bar` is specified before `foo`.

### Default Tasks
A default task ~~or tasks~~ is a set of tasks which is run for a project (or a build)
when no other information is present. For example, when you run `./gradlew` what task
is to be invoked for the project.

```kotlin
project("projectFoo") {
    tasks.register("foo") {
        doLast {
            println("running task foo")
        }
    }

    defaultTasks("foo")
}

defaultTasks(":projectFoo:foo")
```

*File*: build.gradle.kts

Now invoking `./gradlew` will run the task `foo` in the `projectFoo` directory. You
**cant** invoke the default tasks for a subproject from a higher level project
~~yet~~; however if you want to execute the default tasks for `projectFoo` as
specified by `projectFoo`, invoke gradle or gradlew from the `projectFoo` directory.

### Skipping Tasks
You can predicate the execution of a task using the `onlyIf` method of the task
instance. You can pass a block to it & if the block evaluates to false, the task will
be skipped.

```kotlin
tasks.register("foo") {
    doLast {
        println("running task foo")
    }

    onlyIf { !project.hasProperty("skipFoo") }
}
```

*File*: build.gradle.kts

The `foo` task will be skipped, ~~unless~~ the project ~~doesn't~~ does have the
property `skipFoo`. NOTE you can set a property of a build using the `-P` flag on the
gradle command line.

Alternatively, you can skip a task during it's execution by throwing the
`StopExecutionException`. This'll skip both the current action and any of the
remaining actions for the given task; however, it doesn't skip any of the following
tasks or the parent task for which the skipped task may depend.

```kotlin
tasks.register("foo") {
    doLast {
        println("running task foo")
    }

    doFirst {
        throw StopExecutionException()
    }
}

tasks.register("bar") {
    dependsOn(tasks["foo"])
    doLast {
        println("running task bar")
    }
}
```

*File*: build.gradle.kts

Now if we invoke the `bar` task, the foo task will attempt to be run, skipped, and then bar will complete.

```console
> ./gradlew -q bar
running task bar
```

Lastly, every task instace has an `enabled` flag, which if set to false will
automatically skip the task... no questions asked.

### Other Neat Tricks
#### Extra Task Properties
```kotlin
val foo by tasks.registering {
    extra["secret"] = "uryyb unpxre sevraq"
}

tasks.register("bar") {
    val secret = foo.get().extra["secret"]
    println("secret: $secret")
}
```
