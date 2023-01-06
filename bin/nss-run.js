#!/usr/bin/env node
const chalk = require('chalk');

const packageJson = require('../package.json');

// eslint-disable-next-line import/extensions,import/no-unresolved
const nssRun = require('../lib/index');
const nssRunLoadConfig = require('../lib/internal/config').default;

// Print out name and version
console.log(chalk.yellow(packageJson.name + ' (v' + packageJson.version + ')')); // eslint-disable-line prefer-template
console.log();

// Process build file
nssRunLoadConfig()
    .then(() => {
        // Check if task exists
        console.log();
        return nssRun.processArgs(process.argv.slice(2));
    })
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
