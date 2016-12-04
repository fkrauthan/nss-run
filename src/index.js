import path from 'path';
import chProcess from 'child_process';
import chalk from 'chalk';
import Promise from 'bluebird';

import TaskCollector from './TaskCollector';

const taskCollector = new TaskCollector();

export function processArgs([name, ...args]) {
    if (!name) {
        taskCollector.printHelp();
        return undefined;
    }
    return taskCollector.runTask(name, args.slice(1), true);
}

export function task(name, fn, options) {
    return taskCollector.addTask(name, fn, options);
}

export function taskGroup(name, tasksToExecute, options) {
    tasksToExecute.forEach((item) => {
        if (typeof item !== 'string') {
            throw new Error(`Task ${name} ' tasks ${item} is not a string`);
        }
    });

    return taskCollector.addTask(name, (...args) => {
        tasksToExecute.forEach(t => taskCollector.runTask(t, args, false));
    }, options);
}

export function runTask(name, ...args) {
    return taskCollector.runTask(name, args, false);
}

export function run(cmd, options = {}, cb = undefined) {
    /* eslint-disable no-param-reassign */
    options.env = options.env || process.env;
    options.stream = options.stream || true;
    options.async = options.async || false;
    const envPath = options.env.PATH ? options.env.PATH : process.env.PATH;
    options.env.PATH = [path.join(process.cwd(), 'node_modules', '.bin'), envPath].join(path.delimiter);
    if (!options.async && options.stream) {
        options.stdio = options.stdio || 'inherit';
    }
    /* eslint-enable no-param-reassign */

    console.log(chalk.bold(`>>> Executing ${chalk.cyan(cmd)}`));
    if (options.async || !!cb) {
        return new Promise((resolve, reject) => {
            const cmdProcess = chProcess.exec(cmd, options, (error, stdout) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(stdout);
                }
            });

            if (options.stream) {
                cmdProcess.stdout.pipe(process.stdout);
            }
        }).asCallback(cb);
    }

    try {
        return chProcess.execSync(cmd, options);
    } catch (error) {
        console.log(chalk.red(`<<< ${chalk.cyan(cmd)} Command failed with exit code ${error.status}`));
        return error.stdout;
    }
}
