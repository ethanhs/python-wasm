import { WorkerManager } from "./worker-manager.js";
import { WasmTerminal } from "./wasm-terminal.js";

const replButton = document.getElementById('repl')
const clearButton = document.getElementById('clear')

window.onload = () => {
    const terminal = new WasmTerminal()
    terminal.open(document.getElementById('terminal'))
    
    const text_codec = new TextDecoder()

    function b_utf8(s) {
        var ary = []
        for ( var i=0; i<s.length; i+=1 ) {
            ary.push( s.substr(i,1).charCodeAt(0) )
        }
        return text_codec.decode(new Uint8Array(ary) )
    }
    
    const stdio = {
        stdout: (s) => { terminal.print(b_utf8(s)) },
        stderr: (s) => { terminal.print(b_utf8(s)) },
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

    const pythonWorkerManager = new WorkerManager('/worker/worker.js', stdio, readyCallback)
}
