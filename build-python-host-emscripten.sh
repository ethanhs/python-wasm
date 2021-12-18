#!/bin/env bash

shopt -s extglob

mkdir -p cpython/builddir/host

# install emcc ports so configure is able to detect the dependencies
embuilder build zlib

pushd cpython/builddir/host
CONFIG_SITE=../../Tools/wasm/config.site-wasm32-emscripten \
  emconfigure ../../configure -C \
    --host=wasm32-unknown-emscripten \
    --build=$(../../config.guess) \
    --with-build-python=$(pwd)/../build/python

emmake make -j$(nproc) python.html

popd
