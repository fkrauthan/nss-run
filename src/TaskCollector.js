import chalk from 'chalk';

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
            return undefined;
        }

        let time = Date.now();

        console.log(chalk.blue(`> Running "${name}"...`));
        const ret = this.tasks[name].fn.apply(null, args);

        time = ((Date.now() - time) / 1000).toFixed(2);
        console.log(chalk.blue(`< Finished "${name}" in ${time}sec`));

        return ret;
    }

    printHelp() {
        console.log();

        console.log(chalk.bold('Available tasks:'));
        Object.keys(this.tasks).forEach((name) => {
            const options = this.tasks[name].options;
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
