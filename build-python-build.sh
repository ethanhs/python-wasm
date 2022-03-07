#!/usr/bin/env bash
set -e

mkdir -p cpython/builddir/build
pushd cpython/builddir/build
../../configure -C
make -j$(nproc)
popd
