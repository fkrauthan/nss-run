UPGRADE FROM 0.1 to 0.2
=======================

* If you use `run` the method will always return a Promise (the callback parameter was removed)
* A task can return a Promise. If you do that it will wait until the Promise is resolved before 
  finishing this task otherwise it will finish the task as soon as the task method finishes.
* `runTask` will always return a promise that will be resolved when the executed task gets called

Common migration examples
-------------------------

### Example 1

```javascript
task("lint:test:unit", function () {
    run("eslint ./test/unit");
});
```

becomes

```javascript
task("lint:test:unit", function () {
    return run("eslint ./test/unit");
});
```

### Example 2

```javascript
task("lint:test:unit", function () {
    run("eslint ./test/unit");
    run("eslint ./test/unit2");
});
```

becomes (if tasks can run in parallel)

```javascript
task("lint:test:unit", function () {
    return Pomise.All(
        run("eslint ./test/unit"),
        run("eslint ./test/unit2")
    );
});
```

or (if tasks need to run in sequence)

```javascript
task("lint:test:unit", function () {
    return run("eslint ./test/unit")
        .then(function () {
            return run("eslint ./test/unit2");  
        });
});
```

### Example 3

```javascript
task("lint:test:unit", function () {
    runTask("test");
    run("eslint ./test/unit2");
});
```

becomes (if tasks can run in parallel)

```javascript
task("lint:test:unit", function () {
    return Pomise.All(
        runTask("test"),
        run("eslint ./test/unit2")
    );
});
```

or (if tasks need to run in sequence)

```javascript
task("lint:test:unit", function () {
    return runTask("test")
        .then(function () {
            return run("eslint ./test/unit2");  
        });
});
```
