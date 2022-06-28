#!/bin/sh
set -e

export PATH="$PATH:/root/.wasmtime/bin"

cd cpython/builddir/wasi

# PYTHONPATH is relative to mapped cpython/ directory.
exec wasmtime run \
    --env PYTHONPATH=/builddir/wasi/$(cat pybuilddir.txt) \
    --mapdir /::../../ -- \
    python.wasm "$@"
