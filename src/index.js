import path from 'path';
import chProcess from 'child_process';
import chalk from 'chalk';
import Promise from 'bluebird';

import TaskCollector from './TaskCollector';

const taskCollector = new TaskCollector();

export { Promise };

export function processArgs([name, ...args]) {
    if (!name) {
        taskCollector.printHelp();
        return Promise.resolve();
    }
    return taskCollector.runTask(name, args.slice(1), true);
}

export function task(name, fn, options) {
    return taskCollector.addTask(name, fn, options);
}

function validateTaskToExecute(name, item, arrayCount = 0) {
    if (Array.isArray(item) && arrayCount < 2) {
        item.forEach(i => validateTaskToExecute(name, i, arrayCount + 1));
    } else if (typeof item !== 'string') {
        throw new Error(`Task ${name} ' tasks ${item} is not a string`);
    }
}

export function taskGroup(name, tasksToExecute, options) {
    validateTaskToExecute(name, tasksToExecute);

    return taskCollector.addTask(name, (...args) => (
        tasksToExecute.reduce((accumulator, currentValue) => (
            accumulator.then(() => {
                if (Array.isArray(currentValue)) {
                    return Promise.all(currentValue.map(t => taskCollector.runTask(t, args, false)));
                }
                return taskCollector.runTask(currentValue, args, false);
            })
        ), Promise.resolve())
    ), options);
}

export function runTask(name, ...args) {
    return taskCollector.runTask(name, args, false);
}

export function run(cmd, options = {}) {
    /* eslint-disable no-param-reassign */
    options.env = options.env || process.env;
    options.stream = options.stream || true;
    options.canFail = options.canFail || false;
    const envPath = options.env.PATH ? options.env.PATH : process.env.PATH;
    options.env.PATH = [path.join(process.cwd(), 'node_modules', '.bin'), envPath].join(path.delimiter);
    /* eslint-enable no-param-reassign */

    console.log(chalk.bold(`>>> Executing ${chalk.cyan(cmd)}`));
    return new Promise((resolve, reject) => {
        const cmdProcess = chProcess.exec(cmd, options, (error, stdout) => {
            if (error) {
                if (options.canFail) {
                    reject(error);
                } else {
                    resolve(error);
                }
            } else {
                resolve(stdout);
            }
        });

        if (options.stream) {
            cmdProcess.stdout.pipe(process.stdout);
        }
    });
}
