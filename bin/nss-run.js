#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const packageJson = require('../package.json');

// eslint-disable-next-line import/extensions,import/no-unresolved
const nssRun = require('../lib/index');
const nssRunConfig = require('../lib/internal/config');

// Add a simple file check
function assemblePath(fileName) {
    return path.resolve('.', fileName);
}

function fileExists(fileName) {
    try {
        fs.accessSync(assemblePath(fileName), fs.constants.R_OK);
        return true;
    } catch (ignored) {
        return false;
    }
}

// Print out name and version
console.log(chalk.yellow(packageJson.name + ' (v' + packageJson.version + ')')); // eslint-disable-line prefer-template
console.log();

// Process build file
nssRunConfig
    .loadConfig()
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
