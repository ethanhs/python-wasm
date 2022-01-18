import { WorkerManager } from "./worker-manager.js";
import { WasmTerminal } from "./wasm-terminal.js";

const runButton = document.getElementById('run')
const replButton = document.getElementById('repl')
const clearButton = document.getElementById('clear')

window.onload = () => {
    const terminal = new WasmTerminal()
    terminal.open(document.getElementById('terminal'))

    const stdio = {
        stdout: (s) => { terminal.print(s) },
        stderr: (s) => { terminal.print(s) },
        stdin: async () => {
            return await terminal.prompt()
        }
    }

    runButton.addEventListener('click', (e) => {
        const code = document.getElementById('code').value
        // TODO: Support running code from a file
        pythonWorkerManager.run({
            args: ['main.py'],
            files: {'main.py': code}
        })
    })

    replButton.addEventListener('click', (e) => {
        // Need to use "-i -" to force interactive mode.
        // Looks like isatty always returns false in emscripten
        pythonWorkerManager.run({args: ['-i', '-'], files: {}})
    })

    clearButton.addEventListener('click', (e) => {
        terminal.clear()
    })

    const readyCallback = () => {
        runButton.removeAttribute('disabled')
        replButton.removeAttribute('disabled')
        clearButton.removeAttribute('disabled')
    }

    const pythonWorkerManager = new WorkerManager('/worker/worker.js', stdio, readyCallback)
}
