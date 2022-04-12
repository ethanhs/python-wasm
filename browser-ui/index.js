import { WorkerManager } from "./worker-manager.js";
import { WasmTerminal } from "./wasm-terminal.js";

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

    replButton.addEventListener('click', (e) => {
        // Need to use "-i -" to force interactive mode.
        // Looks like isatty always returns false in emscripten
        pythonWorkerManager.run({args: ['-i', '-'], files: {}})
    })

    clearButton.addEventListener('click', (e) => {
        terminal.clear()
    })

    const readyCallback = () => {
        replButton.removeAttribute('disabled')
        clearButton.removeAttribute('disabled')
    }

    const pythonWorkerManager = new WorkerManager('./worker/worker.js', stdio, readyCallback)
}
