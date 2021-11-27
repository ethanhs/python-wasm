// Python uses PYTHONHOME to find the location of the interpreter.
// This sets PYTHONHOME to point to where it is installed
// TODO: maybe we should name the install location /usr/lib so
// this can happen automatically?
Module.preRun.push(function() {ENV.PYTHONHOME = "/install"})
