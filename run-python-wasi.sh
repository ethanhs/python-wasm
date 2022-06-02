#!/bin/sh
set -e

export PATH="$PATH:/root/.wasmtime/bin"

cd cpython/builddir/wasi
exec wasmtime run --mapdir .::../../ -- python.wasm "$@"
