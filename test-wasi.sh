#!/usr/bin/env bash
set -e

exec ./run-python-wasi.sh -m test "$@"
