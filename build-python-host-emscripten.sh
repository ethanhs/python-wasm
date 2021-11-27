#!/bin/env bash

shopt -s extglob

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
# includes aren't need for distribution, various libraries
# won't be used in the web (at least for now)
rm -rf bin include lib/pkgconfig lib/libpython3.11d.a
rm -rf lib/python3.11/test
rm -rf lib/python3.11/config-3.11d
rm -rf lib/python3.11/tkinter
rm -rf lib/python3.11/turtledemo
rm -rf lib/python3.11/wsgiref
rm -rf lib/python3.11/lib2to3
rm -rf lib/python3.11/venv
rm -rf lib/python3.11/idlelib
rm -rf lib/python3.11/distutils
rm -rf lib/python3.11/encoding/*.py
find lib/python3.11 -type f \( -iname \*.opt-1.pyc -o -iname \*.opt-2.pyc \) -delete
# os.py is a marker for finding the correct lib directory
# so its important to keep
cd lib/python3.11
zip -9 -r ../python311.zip * -x lib/python3.11/os.py
rm -vrf !(os.py|encoding/__pycache__)
cd ../..
mkdir -p lib/python3.11/lib-dynload
touch lib/python3.11/lib-dynload/.gitignore
popd
emcc -Os -o python.html Programs/python.o libpython3.11d.a Modules/_decimal/libmpdec/libmpdec.a Modules/expat/libexpat.a -ldl -lm -s USE_ZLIB --preload-file ../usr
popd
