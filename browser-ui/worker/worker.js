class StdinBuffer {
    constructor() {
        this.sab = new SharedArrayBuffer(128 * Int32Array.BYTES_PER_ELEMENT)
        this.buffer = new Int32Array(this.sab)
        this.readIndex = 1;
        this.numberOfCharacters = 0;
        this.sentNull = true
    }

    prompt() {
        this.readIndex = 1
        Atomics.store(this.buffer, 0, -1)
        postMessage({
            type: 'stdin',
            buffer: this.sab
        })
        Atomics.wait(this.buffer, 0, -1)
        this.numberOfCharacters = this.buffer[0]
    }

    stdin = () => {
        if (this.numberOfCharacters + 1 === this.readIndex) {
            if (!this.sentNull) {
                // Must return null once to indicate we're done for now.
                this.sentNull = true
                return null
            }
            this.sentNull = false
            this.prompt()
        }
        const char = this.buffer[this.readIndex]
        this.readIndex += 1
        // How do I send an EOF??
        return char
    }
}

const stdoutBufSize = 4;  // Maximum bytes for UTF-8 char
const stdoutBuf = new Uint8Array(stdoutBufSize)
let index = 0;
let tailOctets = 0;

// Return tail octets for this character https://sethmlarson.dev/blog/utf-8
const countTailOctets = (charCode) => {
    if (charCode >> 7 == 0b0) return 0;
    if (charCode >> 5 == 0b110) return 1;
    if (charCode >> 4 == 0b1110) return 2;
    if (charCode >> 3 == 0b11110) return 3;
}

const stdout = (charCode) => {
    stdoutBuf[index] = charCode;
    charCode = stdoutBuf[index];
    index++;
    if (tailOctets > 0) {
        tailOctets--;
    } else {
        tailOctets = countTailOctets(charCode);
    }
    if (tailOctets == 0) {
        postMessage({
            type: 'stdout',
            stdout: new TextDecoder("utf-8").decode(stdoutBuf.slice(0, index).buffer),
        })
        stdoutBuf.fill(0);
        index = 0;
    }
}

const stderr = (charCode) => {
    if (charCode) {
        postMessage({
            type: 'stderr',
            stderr: String.fromCharCode(charCode),
        })
    } else {
        console.log(typeof charCode, charCode)
    }
}

const stdinBuffer = new StdinBuffer()

var Module = {
    noInitialRun: true,
    stdin: stdinBuffer.stdin,
    stdout: stdout,
    stderr: stderr,
    onRuntimeInitialized: () => {
        postMessage({type: 'ready', stdinBuffer: stdinBuffer.sab})
    }
}

onmessage = (event) => {
    if (event.data.type === 'run') {
        // TODO: Set up files from event.data.files
        const ret = callMain(event.data.args)
        postMessage({
            type: 'finished',
            returnCode: ret
        })
    }
}

importScripts('python.js')
