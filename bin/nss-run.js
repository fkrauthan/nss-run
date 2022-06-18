#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const packageJson = require('../package.json');

// eslint-disable-next-line import/extensions,import/no-unresolved
const nssRun = require('../lib/index');

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
if (fileExists('nss-runfile.js')) {
    // We found a run file that does not require babel
    console.log(chalk.blue("Detected '") + chalk.cyan('nss-runfile.js') + chalk.blue("'..."));
    require(assemblePath('nss-runfile.js')); // eslint-disable-line global-require,import/no-dynamic-require
} else if (fileExists('nss-runfile.babel.js')) {
    // We found a run file that does require babel
    try {
        require(path.resolve('.', 'node_modules', 'babel-register')); // eslint-disable-line global-require,import/no-dynamic-require
    } catch (ignored) {
        console.log(chalk.red("Found '") + chalk.cyan('nss-runfile.babel.js') + chalk.red("' but can not find '") + chalk.cyan('babel-register') + chalk.red("'. Make sure you added babel-register to your projects dependencies!"));
        process.exit(-2);
    }
    console.log(chalk.blue("Detected '") + chalk.cyan('nss-runfile.js') + chalk.blue("' and '") + chalk.cyan('babel-register') + chalk.blue("'..."));
    require(assemblePath('nss-runfile.babel.js')); // eslint-disable-line global-require,import/no-dynamic-require
} else {
    console.log(chalk.red("Can not find a '") + chalk.cyan('nss-runfile.js') + chalk.red("' or '") + chalk.cyan('nss-runfile.babel.js') + chalk.red("' in the current folder."));
    process.exit(-1);
}

// Check if task exists
console.log();
nssRun.processArgs(process.argv.slice(2))
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
