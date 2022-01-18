
export class WorkerManager {
    constructor(workerURL, standardIO, readyCallBack) {
        this.workerURL = workerURL
        this.worker = null
        this.standardIO = standardIO
        this.readyCallBack = readyCallBack

        this.initialiseWorker()
    }

    async initialiseWorker() {
        if (!this.worker) {
            this.worker = new Worker(this.workerURL)
            this.worker.addEventListener('message', this.handleMessageFromWorker)
        }
    }

    async run(options) {
        this.worker.postMessage({
            type: 'run',
            args: options.args || [],
            files: options.files || {}
        })
    }

    handleStdinData(inputValue) {
        if (this.stdinbuffer && this.stdinbufferInt) {
            let startingIndex = 1
            if (this.stdinbufferInt[0] > 0) {
                startingIndex = this.stdinbufferInt[0]
            }
            const data = new TextEncoder().encode(inputValue)
            data.forEach((value, index) => {
                this.stdinbufferInt[startingIndex + index] = value
            })
    
            this.stdinbufferInt[0] = startingIndex + data.length - 1
            Atomics.notify(this.stdinbufferInt, 0, 1)
        }
    }

    handleMessageFromWorker = (event) => {
        const type = event.data.type
        if (type === 'ready') {
            this.readyCallBack()
        } else if (type === 'stdout') {
            this.standardIO.stdout(event.data.stdout)
        } else if (type === 'stderr') {
            this.standardIO.stderr(event.data.stderr)
        } else if (type === 'stdin') {
            // Leave it to the terminal to decide whether to chunk it into lines
            // or send characters depending on the use case.
            this.stdinbuffer = event.data.buffer
            this.stdinbufferInt = new Int32Array(this.stdinbuffer)
            this.standardIO.stdin().then((inputValue) => {
                this.handleStdinData(inputValue)
            })
        } else if (type === 'finished') {
            this.standardIO.stderr(`Exited with status: ${event.data.returnCode}\r\n`)
        }
      }
}
