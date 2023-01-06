import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';

// eslint-disable-next-line no-underscore-dangle
let import_;
try {
    // Node < 13.3 doesn't support import() syntax.
    // eslint-disable-next-line global-require
    import_ = require('./import').default;
} catch (e) { /* empty */ }

function assemblePath(fileName) {
    return path.resolve('.', fileName);
}

async function fileExists(fileName) {
    try {
        await fs.access(assemblePath(fileName), fs.constants.R_OK);
        return true;
    } catch (ignored) {
        return false;
    }
}

function loadCjs(file) {
    // eslint-disable-next-line import/no-dynamic-require,global-require
    require(assemblePath(file));
}

async function loadMjs(file) {
    if (!import_) {
        throw new Error(
            "Internal error: Native ECMAScript modules aren't supported"
            + ' by this platform.\n',
        );
    }

    await import_(`file://${assemblePath(file)}`);
}

async function loadCjsThenMjs(file) {
    try {
        loadCjs(file);
    } catch (e) {
        await loadMjs(file);
    }
}

function loadBabelJs(file) {
    try {
        require(path.resolve('.', 'node_modules', '@babel', 'register')); // eslint-disable-line global-require,import/no-dynamic-require
    } catch (ignored) {
        console.log(chalk.red("Found '") + chalk.cyan(file) + chalk.red("' but can not find '") + chalk.cyan('@babel/register') + chalk.red("'. Make sure you add @babel/register to your projects dependencies!"));
        process.exit(-2);
    }
    loadCjs(file);
}

const CONFIG_FILENAMES = {
    'nss-runfile.js': loadCjsThenMjs,
    'nss-runfile.cjs': loadCjs,
    'nss-runfile.mjs': loadMjs,
    'nss-runfile.babel.js': loadBabelJs,
};

export default async function loadConfig() {
    // eslint-disable-next-line no-restricted-syntax
    for (const [file, loader] of Object.entries(CONFIG_FILENAMES)) {
        // eslint-disable-next-line no-await-in-loop
        const exists = await fileExists(file);
        if (exists) {
            console.log(chalk.blue("Detected '") + chalk.cyan(file) + chalk.blue("'..."));
            // eslint-disable-next-line no-await-in-loop
            await loader(file);
            return;
        }
    }

    console.log(chalk.red("Could not find a '") + (Object.keys(CONFIG_FILENAMES).map((f) => chalk.cyan(f)).join(chalk.red("' or '"))) + chalk.red("' in the current folder."));
    process.exit(-1);
}
