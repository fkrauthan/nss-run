nss-run
=======

nss-run (not so simple run) is a very simplistic build tool.

Instead of something like `gulp` or `grunt` where you are
required to execute all your build steps thru plugins `nss-run`
just gives you a easy way to call any external tool without
having to find a special plugin first.

Get started
-----------

Install globally (for a command line script):

    npm install nss-run -g

Install in your project (to use nss-run api inside your `nss-runfile.js`):

    npm install nss-run --save-dev

If you want to use Babel (6.x)

    npm install babel-core babel-preset-es2015 babel-register --save-dev

Create a `nss-runfile.js` (if you don't wanna use babel) / `nss-runfile.babel.js` (if you wanna use babel)

```javascript
import { task, taskGroup, runTask, run } from "nss-run";

task("create:component", function (name) {
    console.log("Component with name " + name + " created");
});

task("lint", function () {
    runTask("lint:test");
    runTask("lint:source");
});

taskGroup("lint:test", ["lint:test:unit", "lint:test:integration"]);

task("lint:test:unit", function () {
    run("eslint ./test/unit");
});
task("lint:test:integration", function () {
    run("eslint ./test/integration");
});

task("lint:source", function () {
    run("eslint ./src");
});
```

Run:
```
nss-run create:component test
nss-run lint
nss-run lint:test
nss-run lint:test:unit
```

Tips:
* `./node_modules/.bin/` is included into PATH when running commands by `nss-run` api method
* Executing `nss-run` command without arguments displays list of all available tasks (+ description if available)
* `nss-run` will automatic require `babel-register` if it can not find a `nss-runfile.js` but 
  a `nss-runfile.babel.js` before including the runfile.

Why nss-run?
------------

Is there really a need for a new build tool? We already have Grunt, Gulp,
npm scripts, Makefile, runjs and many more.

Gulp and Grunt are very complex and require special plugins to run the tools
that make our nodejs development environment.

Makefiles require you to install a tool outside of the nodejs ecosystem which
makes getting started with a project harder then it needs to be.

npm scripts in my opionen are creating to much clutter within your package.json
Your dependency file should not need to know how to build your project.

runjs is already going into the right direction (and this tool is heavily inspired
by runjs). But some of the design decisions (it is to simpel) makes it hard to be
used for bigger projects where you just need a bit more flexibility in terms of
how you wanna organize your tasks.

nss-run provides you with an very simple way to execute command line tools, npm
installed tools as well as writing custom Javascript and using any npm library
to create your own simple processing. No need to wait until a plugin makes your
favorite tool available thru your build tool. I tried to combine my favorite part
of gulp (the task definition system) and the simplicity of runjs to create a simpel
(but not so simple ;)) build tool for any project size.

API
---

```javascript
import { task, taskGroup, runTask, run } from "nss-run";
```

**task(name, cb[, options])**

Register a new task with the given name (do not use spaces in your name). If the task is going to be called the
provided callback will be executed.

Options:

```javascript
{
    description: ..., // provide a description for this task for the task list output (String)
    hidden: ..., // Hide this task from the task list output (true/false) - default: false
}
```

Examples:

```javascript
task("test", function () {
    // my task logic here
});
task("test", function () {
    // my task logic here
}, {
    description: "My test description"
});
```

**taskGroup(name, tasksToExecute[, options])**

Registers a new task (do not use spaces in your task name) that when called automatic calls all provided task names in a 
sequence (`tasksToExecute` has to be a string array). The options are the same as the options for `task`.

Options:

```javascript
{
    description: ..., // provide a description for this task for the task list output (String)
    hidden: ..., // Hide this task from the task list output (true/false) - default: false
}
```

Examples:

```javascript
taskGroup("test", ["task1", "task2", "task3"]);
taskGroup("test", ["task1", "task2", "task3"], {
    description: "This task will call first task1, then task2 and last task3"
});
```

**runTask(name[, arg1[, ...]])**

This will execute a registered task with the given name. All arguments you pass
after the name will be directly passed thru to the tasks function callback.

Examples:

```javascript
runTask("lint");
runTask("lint", true, "my-second-argument");
```

**run(cmd[, options, cb])**

Run given command as a child process and log the call in the output. If `cb` is defined
output is automatic switched to async. If `async` true is supplied and no callback is 
provided a promise will be returned.

Options:

```javascript
{
    cwd: .., // current working directory (String)
    async: ... // run command asynchronously (true/false) - default: false
    stream: ... // directly log the process output (true/false) - default: true
}
```

Examples:

```javascript
run("rm -rf ./lib");
run("http-server .", { async: true }).then((stdout) => {
    log(stdout);
}).catch((error) => {
    throw error;
});
run("http-server .", { stream: false }, function(err, stdout) {
    if (err) throw err;
    log(stdout);
});
```