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
./build-python-emscripten-browser.sh
```

There will probably be errors, but that's just part of the fun of experimental platforms.

Assuming things compiled correctly, you can have emscripten serve the Python executable and then open http://localhost:8000/python.html in your browser:

```
./run-python-browser.sh
```

The CLI input is done via an input modal which is rather annoying. Also to get output you need to click `Cancel` on the modal...

## Developing
Once you've built the Emscripten'd Python, you can rebuild it via

```
./clean-host.sh
./build-python-emscripten-browser.sh
```
which will rebuild Python targeting emscripten and re-generate the `python.{html, wasm, js}`

## Test build artifacts
You can also download builds from our CI and test WASM build locally

* download the *wasm* build artifact bundle from the latest
  [CI workflow](https://github.com/ethanhs/python-wasm/actions?query=branch%3Amain)
  actions run.
* unzip ``wasm.zip``
* run a local webserver in the same directory as ``python.html``,
   e.g. ``python3 -m http.server``
* open http://localhost:8000/python.html
* enter commands into the browser modal window and check the web developer
  console (*F12*) for output. You may need to hit "Cancel" on the modal after sending input for output to appear.
