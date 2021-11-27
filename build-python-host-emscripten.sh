#!/bin/env bash

export PYTHON_FOR_BUILD="$(pwd)/cpython/builddir/build/python"

pushd cpython/builddir/host
cp ../../../config.site-wasm config.site-wasm
CONFIG_SITE=config.site-wasm READELF=true emconfigure ../../configure -C --without-pymalloc --enable-big-digits=30 --with-pydebug --with-suffix=.wasm --with-ensurepip=no --disable-ipv6 --host=wasm32-unknown-emscripten --build=$(../../config.guess)
ln -sfr Modules/Setup.stdlib Modules/Setup.local
export FREEZE_MODULE=../build/Programs/_freeze_module
emmake make CROSS_COMPILE=yes FREEZE_MODULE=../build/Programs/_freeze_module PYTHON_FOR_BUILD=../build/python _PYTHON_HOST_PLATFORM=wasm32-unknown-emscripten -j$(nproc)
make altinstall prefix=../install
cp ../../../setpythonhome.js setpythonhome.js
emcc -o python.html Programs/python.o libpython3.11d.a Modules/_decimal/libmpdec/libmpdec.a Modules/expat/libexpat.a -ldl -lm --preload-file ../install --pre-js setpythonhome.js
popd
