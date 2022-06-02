#!/bin/sh
set -e

exec ./run-python-wasi.sh -m test "$@"
