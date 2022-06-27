#!/usr/bin/env bash
set -e

pushd cpython/builddir/emscripten-node
exec node \
    --experimental-wasm-threads \
    --experimental-wasm-bulk-memory \
    --experimental-wasm-bigint \
    python.js "$@"
