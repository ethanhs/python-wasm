#!/bin/env bash

pushd cpython/builddir/build
../../configure -C
make -j$(nproc)
popd
