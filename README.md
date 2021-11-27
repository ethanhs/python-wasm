# CPython on WASM

Build scripts and configuration for building CPython for Emscripten.

Pretty straight forward. First, [install emscripten](https://emscripten.org/docs/getting_started/downloads.html).
Then, run the following commands:

```shell
# get the Python sources
./fetch-python.sh
# build Python for the machine we are building on, needed before cross compiling for emscripten
./build-python-build.sh
# build Python cross-compiling to emscripten
./build-python-host-emscripten.sh
```

There will probably be errors, but that's just part of the fun of experimental platforms.

Assuming things compiled correctly, you can have emscripten serve the Python executable and open it in your browser.

```
emrun cpython-host/python.html
```

The CLI input is done via an input modal which is rather annoying. Also to get output you need to click `Cancel` on the modal...
