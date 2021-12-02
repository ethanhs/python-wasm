#!/bin/env bash

shopt -s extglob

mkdir -p cpython/builddir/host
mkdir -p cpython/builddir/usr/local

# install emcc ports so configure is able to detect the dependencies
embuilder build zlib

pushd cpython/builddir/host
cp ../../../config.site-wasm config.site-wasm
CONFIG_SITE=config.site-wasm READELF=true ZLIB_LIBS="-s USE_ZLIB" emconfigure ../../configure -C --without-pymalloc --with-pydebug --host=wasm32-unknown-emscripten --build=$(../../config.guess) --with-build-python=$(pwd)/../build/python --with-freeze-module=$(pwd)/../build/Programs/_freeze_module

# Use Setup.stdlib and force rebuild of Makefile
ln -sfr Modules/Setup.stdlib Modules/Setup.local
rm Modules/config.c
make Modules/config.c

emmake make -j$(nproc)
make altinstall prefix=../usr/local

pushd ../usr/local
# not needed, as the binary is already loaded by the .html
# includes aren't need for distribution, various libraries
# won't be used in the web (at least for now)
rm -rf bin include lib/pkgconfig lib/libpython3.11d.a
rm -f lib/python3.11/_aix_support.py
rm -f lib/python3.11/_bootsubprocess.py
rm -rf lib/python3.11/_osx_support.py
rm -f lib/python3.11/antigravity.py
rm -rf lib/python3.11/asyncio
rm -rf lib/python3.11/concurrent
rm -rf lib/python3.11/config-3.11*
rm -rf lib/python3.11/ctypes
rm -rf lib/python3.11/curses
rm -rf lib/python3.11/dbm
rm -rf lib/python3.11/distutils
rm -rf lib/python3.11/encoding/*.py
rm -rf lib/python3.11/ensurepip
rm -rf lib/python3.11/idlelib
rm -rf lib/python3.11/lib2to3
rm -rf lib/python3.11/multiprocessing
rm -rf lib/python3.11/pydoc_data
rm -rf lib/python3.11/test
rm -rf lib/python3.11/tkinter
rm -rf lib/python3.11/turtle.py
rm -rf lib/python3.11/turtledemo
rm -rf lib/python3.11/venv
rm -f lib/python3.11/webbrowser.py
rm -rf lib/python3.11/wsgiref
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
emcc -Os -o python.html Programs/python.o libpython3.11d.a Modules/_decimal/libmpdec/libmpdec.a Modules/expat/libexpat.a -ldl -lm -s USE_ZLIB -s ASSERTIONS=1 --preload-file ../usr
popd
