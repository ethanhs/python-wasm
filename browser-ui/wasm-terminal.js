class BufferQueue {

  constructor(xterm) {
    this.buffer = [];
  }

  isEmpty() {
    return this.buffer.length == 0;
  }

  lastLineIsIncomplete() {
    return !this.isEmpty() && !this.buffer[this.buffer.length-1].endsWith("\n");
  }

  hasLineReady() {
    return !this.isEmpty() && this.buffer[0].endsWith("\n");
  }

  addData(data) {
    let lines = data.split(/(?<=\n)/g);
    if (this.lastLineIsIncomplete()) {
      this.buffer[this.buffer.length-1] += lines.shift();
    }
    for (let line of lines) {
      this.buffer.push(line);
    }
  }

  nextLine() {
    return this.buffer.shift();
  }
}

export class WasmTerminal {

  constructor() {
    this.inputBuffer = new BufferQueue();
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

  handleTermData = (data) => {
    const ord = data.charCodeAt(0);

    data = data.replace(/\r\n|\r|\n/g, "\n")
    if (data.length > 1 && data.includes("\n")) {
      // Handle pasted data
      let alreadyWritten = 0;
      if (this.input != '') {
        // If line already had data on it, merge pasted data with it
        this.inputBuffer.addData(this.input);
        alreadyWritten = this.input.length;
        this.input = '';
      }
      this.inputBuffer.addData(data);
      if (this.activeInput) {
        let line = this.inputBuffer.nextLine();
        this.writeLine(line.slice(alreadyWritten));
        this.resolveInput(line);
        this.activeInput = false;
      }
    } else if (!this.activeInput) {
      this.inputBuffer.addData(data);
    // TODO: Handle ANSI escape sequences
    } else if (ord === 0x1b) {
    // Handle special characters
    } else if (ord < 32 || ord === 0x7f) {
      switch (data) {
        case "\r": // ENTER
        case "\x0a": // CTRL+J
        case "\x0d": // CTRL+M
          this.resolveInput(this.input + this.writeLine('\n'));
          this.input = '';
          this.activeInput = false;
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

  writeLine(line) {
    this.xterm.write(line.slice(0, -1))
    this.xterm.write('\r\n');
    return line;
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
    if (this.inputBuffer.hasLineReady()) {
        return new Promise((resolve, reject) => {
          resolve(this.writeLine(this.inputBuffer.nextLine()));
          this.activeInput = false;
        })
    } else if (this.inputBuffer.lastLineIsIncomplete()) {
      // Hack to ensure cursor input start doesn't end up after user input
      setTimeout(() => {this.handleCursorInsert(this.inputBuffer.nextLine())}, 1);
    }
    return new Promise((resolve, reject) => {
      this.resolveInput = (value) => {
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
