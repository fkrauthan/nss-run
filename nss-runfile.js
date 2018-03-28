const nssRun = require('./lib/index');

/**
 * Linting tasks
 */
nssRun.taskGroup('lint', ['lint:source', 'lint:bin', 'lint:nss-runfile'], { description: 'Lint the source code' });

nssRun.task('lint:source', () => nssRun.run('eslint ./src'));
nssRun.task('lint:bin', () => nssRun.run('eslint ./bin'));
nssRun.task('lint:nss-runfile', () => nssRun.run('eslint ./nss-runfile.js'));


/**
 * Doc generation task
 */
nssRun.task('doc', () => nssRun.run('jsdoc -d docs -R ./README.md ./src/index.js'), { description: 'Generates the plugin docs' });


/**
 * Internal testing task to test interactive commands
 */
nssRun.task('interactive-test', () => nssRun.run('./test/interactive.sh', {
    autoAnswer: [
        {
            search: 'enter your name:',
            answer: 'NSS Runfile\n',
        },
        {
            search: 'what is your age:',
            answer: '2\n',
            hide: true,
        },
    ],
}, { hidden: true }));
