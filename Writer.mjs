export class Writer {
    constructor(element) {
        this.element = element
        this.onComplete = []
        this.callbackId = null
    }

    write(text) {
        this.text = text
        this.written = 0
        this.stop()
        return this.start()
    }

    onFrame() {
        if (this.written < this.text.length) {
            this.written += 1
            let text = this.text.substring(0, this.written)
            if (this.written < this.text.length) text += String.fromCharCode(0x2588)
            this.element.textContent = text
        } else {
            this.stop()
        }
    }

    start() {
        if (this.callbackId === null) {
            this.callbackId = window.setInterval(this.onFrame.bind(this), 10)
        }
        return new Promise((resolve, reject) => {
            this.onComplete.push(resolve)
        })
    }

    stop() {
        if (this.callbackId !== null) {
            window.clearInterval(this.callbackId)
            this.callbackId = null

            while (this.onComplete.length > 0) {
                this.onComplete.pop().call()
            }
        }
    }
}
