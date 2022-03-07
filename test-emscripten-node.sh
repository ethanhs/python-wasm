#!/usr/bin/env bash
set -e

if [ $# -eq 0 ]; then
    ARGS="-w -f node-tests.txt"
else
    ARGS="$@"
fi

exec node --experimental-wasm-threads --experimental-wasm-bulk-memory \
    cpython/builddir/emscripten-node/python.js \
    -m test $ARGS
