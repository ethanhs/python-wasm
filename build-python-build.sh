#!/bin/env bash

cd cpython-build/
./configure --enable-optimizations
make regen-frozen
make -j
