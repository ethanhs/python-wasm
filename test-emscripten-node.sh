#!/usr/bin/env bash
set -e

exec node --experimental-wasm-threads --experimental-wasm-bulk-memory \
    cpython/builddir/emscripten-node/python.js \
    -m test "$@"
