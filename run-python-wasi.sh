#!/bin/sh
set -e

export PATH="$PATH:/root/.wasmtime/bin"

# PYTHONPATH is relative to mapped cpython/ directory.
exec wasmtime run \
    --env PYTHONPATH=/builddir/wasi/$(cat cpython/builddir/wasi/pybuilddir.txt) \
    --mapdir /::cpython/ -- \
    cpython/builddir/wasi/python.wasm "$@"
