#!/usr/bin/env bash

cd nss-runfile.cjs
node ../../bin/nss-run test
cd ..

cd nss-runfile.mjs
node ../../bin/nss-run test
cd ..

cd nss-runfile.js
node ../../bin/nss-run test
cd ..
