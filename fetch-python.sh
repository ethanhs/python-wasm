#!/bin/env bash

git clone https://github.com/python/cpython.git
# make build directories for build (the current system architecture)
# and host, the emscripten/wasi architecture
mkdir -p cpython/builddir/build
mkdir -p cpython/builddir/host
mkdir -p cpython/builddir/usr/local
