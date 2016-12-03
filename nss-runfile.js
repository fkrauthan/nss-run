const nssRun = require('./lib/index');

/**
 * Linting tasks
 */
nssRun.taskGroup('lint', ['lint:source', 'lint:bin', 'lint:nss-runfile'], { description: 'Lint the source code' });

nssRun.task('lint:source', () => {
    nssRun.run('eslint ./src');
});

nssRun.task('lint:bin', () => {
    nssRun.run('eslint ./bin');
});

nssRun.task('lint:nss-runfile', () => {
    nssRun.run('eslint ./nss-runfile.js');
});
