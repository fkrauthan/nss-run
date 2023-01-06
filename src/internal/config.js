import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';

let import_;
try {
    // Node < 13.3 doesn't support import() syntax.
    import_ = require("./import").default;
} catch {}


const CONFIG_FILENAMES = {
    'nss-runfile.js': loadCjsThenMjs,
    'nss-runfile.cjs': loadCjs,
    'nss-runfile.mjs': loadMjs,
    'nss-runfile.babel.js': loadBabelJs,
};

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
    require(assemblePath(file));
}

async function loadMjs(file) {
    if (!import_) {
        throw new Error(
            "Internal error: Native ECMAScript modules aren't supported" +
            " by this platform.\n",
        );
    }

    await import_(assemblePath(file));
}

async function loadCjsThenMjs(file) {
    try {
        loadCjs(file);
    } catch (e) {
        if (e.code !== "ERR_REQUIRE_ESM") {
            throw e;
        }

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

async function tryLoad(file, loader, throwError = false) {
    try {
        console.log(chalk.blue("Detected '") + chalk.cyan(file) + chalk.blue("'..."));
        await loader(file);
        return true;
    } catch (e) {
        if (throwError) {
            throw e;
        }
        return false;
    }
}

export async function loadConfig() {
    for (const [file, loader] of Object.entries(CONFIG_FILENAMES)) {
        const exists = await fileExists(file);
        if (exists) {
            console.log(chalk.blue("Detected '") + chalk.cyan(file) + chalk.blue("'..."));
            await loader(file);
            return;
        }
    }

    console.log(chalk.red("Could not find a '") + (Object.keys(CONFIG_FILENAMES).map((f) => chalk.cyan(f)).join(chalk.red("' or '"))) + chalk.red("' in the current folder."));
    process.exit(-1);
}
