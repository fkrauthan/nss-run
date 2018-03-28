import chalk from 'chalk';
import Promise from 'bluebird';

export default class TaskCollector {
    constructor() {
        this.tasks = {};
    }

    addTask(name, fn, options = {}) {
        // Do some basic validation
        if (!name) {
            throw new Error('Task requires a name');
        }
        if (typeof name !== 'string') {
            throw new Error('Task requires a name that is a string');
        }
        if (typeof fn !== 'function') {
            throw new Error(`Task ${name} requires a function that is a function`);
        }
        if (this.hasTask(name)) {
            throw new Error(`Task with name ${name} is already added`);
        }

        // Store the task
        this.tasks[name] = {
            name,
            fn,
            options,
        };
    }

    hasTask(name) {
        return !!this.tasks[name];
    }

    runTask(name, args = [], exitOnNotFound = false) {
        if (!this.hasTask(name)) {
            console.log(chalk.red(`No Task with name '${chalk.cyan(name)}' found`));
            if (exitOnNotFound) {
                process.exit(1);
            }
            return Promise.reject(new Error(`No Task with name '${name}' found`));
        }

        function finishRunTask(time) {
            const formattedTime = ((Date.now() - time) / 1000).toFixed(2);
            console.log(chalk.blue(`< Finished "${name}" in ${formattedTime}sec`));
        }

        return new Promise((resolve, reject) => {
            const time = Date.now();

            console.log(chalk.blue(`> Running "${name}"...`));
            Promise
                .resolve(this.tasks[name].fn.apply(null, args))
                .then((data) => {
                    finishRunTask(time);
                    resolve(data);
                })
                .catch((error) => {
                    finishRunTask(time);
                    reject(error);
                });
        });
    }

    printHelp() {
        console.log(chalk.bold('Available tasks:'));
        Object.keys(this.tasks)
            .sort()
            .forEach((name) => {
                const { options } = this.tasks[name];
                if (options.hidden) {
                    return;
                }
                if (options.description) {
                    console.log(`  ${chalk.cyan(name)} - ${options.description}`);
                } else {
                    console.log(`  ${chalk.cyan(name)}`);
                }
            });

        console.log();
    }
}
