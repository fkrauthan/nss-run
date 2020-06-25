Changelog
=========

0.3.*
-----

* 0.3.1
  * Updated dependencies
  * Fixed a bug where the cli was never returing an error code even if execution failed

* 0.3.0
  * Updated dependencies
  * Exposed `chalk` for color support within tasks
  * Added `jsdoc` to all nss-runfile relevant functions
  * Added a new subsystem for the `run` method to automatic answer interactive programs


0.2.*
-----

* 0.2.1
  * Fixed the NPM version

* 0.2.0
  * Changed project direction and made everything async
  * Added promise as the way to go
  * Updated dependencies
  * Extended `taskGroup` to allow task execution in sequence and parallel (following the
    gulp syntax)

0.1.*
-----

* 0.1.3
  * Added sorting of task names for help output

* 0.1.2
  * Print out version on start
  * Fixed a possible error when using run

* 0.1.1
  * Exit process if initial task is not found
  * Fixed a bug with defaulting the run options

* 0.1.0
  * Initial Release
