
export class WasmTerminal {

  constructor() {
    this.input = ''
    this.resolveInput = null
    this.activeInput = false
    this.inputStartCursor = null

    this.xterm = new Terminal(
      { scrollback: 10000, fontSize: 14, theme: { background: '#1a1c1f' }, cols: 100}
    );

    this.xterm.onKey((keyEvent) => {
      // Fix for iOS Keyboard Jumping on space
      if (keyEvent.key === " ") {
        keyEvent.domEvent.preventDefault();
      }
    });

    this.xterm.onData(this.handleTermData)
  }

  open(container) {
    this.xterm.open(container);
  }

  handleReadComplete(lastChar) {
    this.resolveInput(this.input + lastChar)
    this.activeInput = false
  }

  handleTermData = (data) => {
    if (!this.activeInput) {
      return
    }
    const ord = data.charCodeAt(0);
    let ofs;

    // TODO: Handle ANSI escape sequences
    if (ord === 0x1b) {
    // Handle special characters
    } else if (ord < 32 || ord === 0x7f) {
      switch (data) {
        case "\r": // ENTER
        case "\x0a": // CTRL+J
        case "\x0d": // CTRL+M
          this.xterm.write('\r\n');
          this.handleReadComplete('\n');
          break;
        case "\x7F": // BACKSPACE
        case "\x08": // CTRL+H
        case "\x04": // CTRL+D
          this.handleCursorErase(true);
          break;
        
      }
    } else {
      this.handleCursorInsert(data);
    }
  }

  handleCursorInsert(data) {
    this.input += data;
    this.xterm.write(data)
  }

  handleCursorErase() {
    // Don't delete past the start of input
    if (this.xterm.buffer.active.cursorX <= this.inputStartCursor) {
      return
    }
    this.input = this.input.slice(0, -1)
    this.xterm.write('\x1B[D')
    this.xterm.write('\x1B[P')
  }

  prompt = async () => {
    this.activeInput = true
    // Hack to allow stdout/stderr to finish before we figure out where input starts
    setTimeout(() => {this.inputStartCursor = this.xterm.buffer.active.cursorX}, 1)
    return new Promise((resolve, reject) => {
      this.resolveInput = (value) => {
        this.input = ''
        resolve(value)
      }
    })
  }

  clear() {
    this.xterm.clear();
  }

  print(message) {
    const normInput = message.replace(/[\r\n]+/g, "\n").replace(/\n/g, "\r\n");
    this.xterm.write(normInput);
  }
}
