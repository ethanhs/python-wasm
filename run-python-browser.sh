#!/bin/env bash

cp cpython/builddir/emscripten-browser/python.* browser-ui/worker/

pushd .
cd browser-ui
../cpython/builddir/build/python server.py $@
popd
