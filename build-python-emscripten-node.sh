#!/usr/bin/env bash
set -e

if command -v ccache 2>&1 >/dev/null; then
    export EM_COMPILER_WRAPPER=ccache
fi

mkdir -p cpython/builddir/emscripten-node

# install emcc ports so configure is able to detect the dependencies
embuilder build zlib bzip2

pushd cpython/builddir/emscripten-node
CONFIG_SITE=../../Tools/wasm/config.site-wasm32-emscripten \
  emconfigure ../../configure -C \
    --host=wasm32-unknown-emscripten \
    --build=$(../../config.guess) \
    --with-emscripten-target=node \
    --enable-wasm-dynamic-linking=no \
    --with-build-python=$(pwd)/../build/python \
    "$@"

emmake make -j$(nproc)

popd
