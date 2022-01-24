#!/usr/bin/env bash

cp cpython/builddir/emscripten-browser/python.* browser-ui/worker/

pushd .
cd browser-ui
python3 server.py $@
popd
