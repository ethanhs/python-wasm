#!/bin/sh
set -e

export PATH="$PATH:/root/.wasmtime/bin"

cd cpython/builddir/wasi
# XXX hack, symlink sysconfig data into stdlib directory
ln -srf -t ../../Lib/ build/lib.wasi-wasm32-3.*/_sysconfigdata__wasi_wasm32-wasi.py
exec wasmtime run --mapdir .::../../ -- python.wasm "$@"
