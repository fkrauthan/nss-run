import path from 'path';
import chProcess from 'child_process';
import chalk from 'chalk';

import TaskCollector from './TaskCollector';

const taskCollector = new TaskCollector();

export { chalk };

export function processArgs([name, ...args]) {
    if (!name) {
        taskCollector.printHelp();
        return Promise.resolve();
    }
    return taskCollector.runTask(name, args.slice(1), true);
}

/**
 * @typedef {Object} TaskOptions
 *
 * @property {string} [description] - Provide a description for this task for the task list output
 * @property {boolean} [hidden=false] - When true hide this task from the task list output
 */

/**
 * Register a new task with the given name (do not use spaces in your name). If the task is
 * going to be called the provided callback will be executed. A task might return a `Promise`
 * to wait for async code to complete. Otherwise the task will be finished as soon as the
 * callback returns.
 *
 * @param {string} name - The unique task name
 * @param {function} fn - The task callback function (should return a Promise if async)
 * @param {TaskOptions} [options] - The task options
 */
export function task(name, fn, options) {
    return taskCollector.addTask(name, fn, options);
}

function validateTaskToExecute(name, item, arrayCount = 0) {
    if (Array.isArray(item) && arrayCount < 2) {
        item.forEach((i) => validateTaskToExecute(name, i, arrayCount + 1));
    } else if (typeof item !== 'string') {
        throw new Error(`Task ${name} ' tasks ${item} is not a string`);
    }
}

/**
 * Registers a new task (do not use spaces in your task name) that when called automatic
 * calls all provided task names in a sequence (`tasksToExecute` has to be a string array). If
 * you provide within the `tasksToExecute` array a array of strings the tasks in that sub array
 * are going to be executed in parallel before proceeding with the next sequence item.
 * The options are the same as the options for `task`.
 *
 * @param {string} name - The unique task name
 * @param {string[]} tasksToExecute - The task names to be executed (they will be executed in sequence. If you provide a array instead of a string as your array element all tasks within the inner array are getting executed in parallel)
 * @param {TaskOptions} [options] - The task options
 */
export function taskGroup(name, tasksToExecute, options) {
    validateTaskToExecute(name, tasksToExecute);

    return taskCollector.addTask(name, (...args) => (
        tasksToExecute.reduce((accumulator, currentValue) => (
            accumulator.then(() => {
                if (Array.isArray(currentValue)) {
                    return Promise.all(currentValue.map((t) => taskCollector.runTask(t, args, false)));
                }
                return taskCollector.runTask(currentValue, args, false);
            })
        ), Promise.resolve())
    ), options);
}

/**
 * This will execute a registered task with the given name. All arguments you pass
 * after the name will be directly passed thru to the tasks function callback.
 *
 * @param {string} name - The name of the task to run
 * @param {...any} [args] - Optional arguments that will be passed to the task
 * @returns {Promise} Always returns a promise which will be resolved when the task completes
 */
export function runTask(name, ...args) {
    return taskCollector.runTask(name, args, false);
}

/**
 * @typedef {Object} AutoAnswerItem
 *
 * @property {string} search - The string to search for in command output
 * @property {string|function} answer - The answer to pipe to the program. Can be either a value or a function that returns a value or Promise
 * @property {boolean} [hide=false] - Hide the answer from terminal output
 */

/**
 * @typedef {Object} RunOptions
 *
 * @property {string} [cwd] - The current working directory
 * @property {object} [env=process.env] - Environment variables to be passed down to the command. The `node_modules/.bin` folder is always added to `PATH`
 * @property {boolean} [stream=true] - Directly print out the process output to terminal
 * @property {boolean} [canFail=false] - Should promise be failed if program execution failed/returned error
 * @property {AutoAnswerItem[]} [autoAnswer=[]] - A list of auto answers to automated interactive program calls
 */

/**
 * Run given command as a child process and log the call in the output.
 *
 * @param {string} cmd - The command to execute
 * @param {RunOptions} [options] - Extra options to configure the run behaviour
 *
 * @return {Promise} Always returns a promise which will be resolved when the command completes
 */
export function run(cmd, options = {}) {
    /* eslint-disable no-param-reassign */
    options.env = options.env || process.env;
    options.stream = options.stream || true;
    options.canFail = options.canFail || false;
    options.autoAnswer = options.autoAnswer || [];
    const envPath = options.env.PATH ? options.env.PATH : process.env.PATH;
    options.env.PATH = [path.join(process.cwd(), 'node_modules', '.bin'), envPath].join(path.delimiter);
    /* eslint-enable no-param-reassign */

    console.log(chalk.bold(`>>> Executing ${chalk.cyan(cmd)}`));
    return new Promise((resolve, reject) => {
        const cmdProcess = chProcess.exec(cmd, options, (error, stdout, stderr) => {
            if (error) {
                if (options.canFail) {
                    reject(error);
                } else {
                    resolve(error);
                }
            } else {
                resolve(error ? `${stdout}\n${stderr}` : stdout);
            }
        });

        if (options.stream || options.autoAnswer) {
            let currentBuffer = '';
            cmdProcess.stdout.on('data', (data) => {
                if (options.stream) {
                    process.stdout.write(data);
                }

                if (options.autoAnswer.length > 0) {
                    currentBuffer += data.toString();
                    const autoAnswer = options.autoAnswer.find(({ search }) => currentBuffer.indexOf(search) !== -1);
                    if (autoAnswer) {
                        currentBuffer = '';

                        if (typeof autoAnswer.answer !== 'function') {
                            if (!autoAnswer.hide && options.stream) {
                                process.stdout.write(autoAnswer.answer);
                            } else if (options.stream && autoAnswer.answer.indexOf('\n') !== -1) {
                                process.stdout.write('\n');
                            }
                            cmdProcess.stdin.write(autoAnswer.answer);
                        } else {
                            return Promise
                                .resolve(autoAnswer.answer.apply())
                                .then((answer) => {
                                    if (!autoAnswer.hide && options.stream) {
                                        process.stdout.write(answer);
                                    } else if (options.stream && answer.indexOf('\n') !== -1) {
                                        process.stdout.write('\n');
                                    }
                                    cmdProcess.stdin.write(answer);
                                });
                        }
                    }
                }

                return Promise.resolve();
            });
            cmdProcess.stderr.on('data', (data) => {
                if (options.stream) {
                    process.stderr.write(data);
                }
            });
        }
    });
}
