#!/usr/bin/env bash
set -e

# https://github.com/WebAssembly/wasi-sdk
WASI_SDK=/opt/wasi-sdk
# https://github.com/singlestore-labs/wasix
WASIX_DIR=/opt/wasix

export PATH=${WASI_SDK}/bin:$PATH
export CC="ccache ${WASI_SDK}/bin/clang"
export LDSHARED="${WASI_SDK}/bin/wasm-ld"
export AR="${WASI_SDK}/bin/llvm-ar"

export CFLAGS="-isystem ${WASIX_DIR}/include"
export LDFLAGS="-L${WASIX_DIR}/lib -lwasix"

mkdir -p cpython/builddir/wasi

pushd cpython/builddir/wasi
CONFIG_SITE=../../Tools/wasm/config.site-wasm32-wasi \
  ../../configure -C \
    --host=wasm32-unknown-wasi \
    --build=$(../../config.guess) \
    --with-build-python=$(pwd)/../build/python \
    --disable-ipv6

make -j$(nproc)

# XXX hack
# Symlink pybuilddir.txt and build lib directory with sysconfig data into
# VPATH root. "--mapdir .::../../" uses VPATH root as CWD.
mkdir -p ../../build
ln -srf -t ../../ pybuilddir.txt
ln -srf -t ../../build/ build/lib.wasi-wasm32-3.*

popd
