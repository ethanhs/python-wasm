#!/bin/env bash

mkdir -p cpython/builddir/build
pushd cpython/builddir/build
../../configure -C
make -j$(nproc)
popd
