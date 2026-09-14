#!/bin/sh
set -e
if [ -L node_modules ]; then
  rm -f node_modules
fi
npm install --prefix ../.. --include=dev
mkdir -p node_modules
ln -sfn ../../node_modules/next node_modules/next
ln -sfn ../../node_modules/react node_modules/react
ln -sfn ../../node_modules/react-dom node_modules/react-dom
test -f node_modules/next/package.json
