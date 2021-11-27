#!/bin/env bash

export PYTHON_FOR_BUILD="$(pwd)/cpython/builddir/build/python"

pushd cpython/builddir/host
cp ../../../config.site-wasm config.site-wasm
CONFIG_SITE=config.site-wasm READELF=true ZLIB_CFLAGS="-s USE_ZLIB" emconfigure ../../configure -C --without-pymalloc --enable-big-digits=30 --with-pydebug --with-suffix=.wasm --with-ensurepip=no --disable-ipv6 --host=wasm32-unknown-emscripten --build=$(../../config.guess)
ln -sfr Modules/Setup.stdlib Modules/Setup.local
export FREEZE_MODULE=../build/Programs/_freeze_module
emmake make CROSS_COMPILE=yes FREEZE_MODULE=../build/Programs/_freeze_module PYTHON_FOR_BUILD=../build/python _PYTHON_HOST_PLATFORM=wasm32-unknown-emscripten -j$(nproc)
make altinstall prefix=../usr/local
pushd ../usr/local
# not needed, as the binary is already loaded by the .html
# includes aren't need for distribution
rm -rf bin include lib/pkgconfig lib/libpython3.11d.a
mkdir -p lib/lib-dynload
touch lib/lib-dynload/.gitignore
popd
emcc -Os -o python.html Programs/python.o libpython3.11d.a Modules/_decimal/libmpdec/libmpdec.a Modules/expat/libexpat.a -ldl -lm -s LZ4=1 --preload-file ../usr
popd
