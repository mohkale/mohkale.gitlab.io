/*
 * simple script to write some text to the DOM as if you had typed it
 * by hand.
 *
 */

export interface Options {
    initialTimeout?: number,
    minimumTimeout?: number, // quicker than this, don't bother waiting.
    writeAcceleration?: number,
    eraseAcceleration?: number,
    // finish delays must be greater than initial write speed
    writeFinishedDelay: number,
    eraseFinishedDelay: number,
    cursorBlinkRate: number,
    prepopulate: string?, // the string shown on the writer by default.
};

export const DEFAULT_OPTIONS: Options = {
    initialTimeout: 5000 / 60,
    minimumTimeout: 1250 / 60,

    writeAcceleration: (5000 / 60) * 0.08,
    eraseAcceleration: (5000 / 60) * 0.08,

    // finish delays must be greater than initial write speed
    writeFinishedDelay: 10000,
    eraseFinishedDelay: 1000,

    cursorBlinkRate: 600,
};

export enum WriteStates {
    Writing, Erasing, WaitingToErase, WaitingToWrite
};

/**
 * a blinking cursor to indicate that nothings being written.
 */
class Cursor {
    element: HTMLElement;

    constructor(options: Options) {
        this.element = document.createElement("div");
        this.element.classList.add("cursor");
        this.element.textContent = "|";
        this.element.style.display = 'inline-block';
        this.blinkRate = options.cursorBlinkRate || 100;
    }

    public  blinkRate?: number;
    private timeoutId?: number;

    /**
     * make the cursor start blinking, waiting {@param initialTimeout}
     * timeout on the first blink, and then defaulting to {@code this.blinkRate}
     * for the remaining blinks.
     */
    startBlinking = (initialTimeout?: number) => {
        if (this.timeoutId) this.toggleVisibility(); // skip first call
        this.timeoutId = setTimeout(this.startBlinking,
                                    initialTimeout || this.blinkRate);
    }

    stopBlinking(setVisible=true) {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = undefined;
        }

        this.visible = setVisible;
    }

    toggleVisibility() {
        this.visible = !this.visible;
    }

    get visible(): boolean {
        return this.element.style.visibility !== "hidden";
    }

    set visible(val: boolean) {
        this.element.style.visibility = val ? "" : "hidden";
    }
}

/**
 * class to construct and automate the writing of quotes to the
 * DOM in a human like way. The approach is slightly inspired by
 * [[https://github.com/mattboldt/typed.js/][typedjs]] but lacks more of the customisation options because I
 * didn't need them.
 *
 */
class AutoWriter {
    /**
     * create a new {@code AutoWriter} instance.
     *
     * @param parent the parent element. The autowriter attaches
     *               a new child element which it writes into.
     * @param quotes what the autowriter should write. It repeatedly
     *               writes a quote from this array, erases it and then
     *               writes another quote. When all quotes have been
     *               written, it shuffles the array and starts again.
     * @param options optional configuration variables. See {@code Options}.
     */
    constructor(public parent: HTMLElement,
                public quotes: string[],
                public options: Options = DEFAULT_OPTIONS) {
        if (parent.textContent && parent.textContent.length) {
            parent.textContent = parent.textContent + " ";
        }

        let container = document.createElement("div");
        container.style.display = 'inline-block';
        parent.appendChild(container);

        this.cursor = new Cursor(options);
        this.element = document.createTextNode("");

        container.appendChild(this.element);
        container.appendChild(this.cursor.element);

        this._timeout = this.options.initialTimeout;
        this.cursor.startBlinking();

        if (this.options.prepopulate as string) {
            this.element.textContent = this.options.prepopulate;
            this.changeState(WriteStates.WaitingToErase);
        }
    }

    element: Text;
    writeStatus = WriteStates.Writing;
    options: Options;
    private cursor: Cursor;
    private waitingTime  = 0;
    private quoteCounter = 0;
    private charCounter  = 0;
    private _timeout: number;

    get timeout() {
        return this._timeout;
    }

    set timeout(value: number) {
        if (value >= this.options.minimumTimeout) {
            this._timeout = value;
        }
    }

    begin = () => {
        setTimeout(this.update, this.options.initialTimeout);
    }

    update = () => {
        switch (this.writeStatus) {
            case WriteStates.Writing:
                this.updateWriting();
                break;
            case WriteStates.Erasing:
                this.updateErasing();
                break;
            case WriteStates.WaitingToErase:
                this.updateWaitingToErase();
                break;
            case WriteStates.WaitingToWrite:
                this.updateWaitingToWrite();
                break;
            default:
                console.error(`unknown writer state: ${this.writeStatus}`)
                break;
        }

        setTimeout(this.update, this.timeout);
    }

    private updateWriting() {
        let nextChar = this.getChar(true);

        if (nextChar) {
            this.element.textContent += nextChar;
            this.timeout -= this.options.writeAcceleration;
        } else {
            this.changeState(WriteStates.WaitingToErase);
        }
    }

    private updateErasing() {
        let str = this.element.textContent;

        if (str && str.length) {
            this.element.textContent = str.substring(0, str.length-1);
            this.timeout -= this.options.eraseAcceleration;
        } else {
            this.changeState(WriteStates.WaitingToWrite);
        }
    }

    /** wait until {@code this.options.eraseFinishedDelay} has expired. */
    private updateWaitingToErase() {
        if ((this.waitingTime -= this.timeout) < 0) {
            this.changeState(WriteStates.Erasing);
        }
    }

    /**
     * wait until {@code this.options.writeFinishedDelay} has expired
     * and then begin writing the next quote. If the next quote doesn't
     * exist then shuffle the quotes list and try again.
     */
    private updateWaitingToWrite() {
        if ((this.waitingTime -= this.timeout) < 0) {
            this.charCounter = 0;
            let lastQuote = this.getQuote(false);

            if (!this.getQuote(true)) {
                this.quoteCounter = 0;
                do {
                    shuffleArray(this.quotes);
                } while (this.getQuote(false) === lastQuote)
            }

            this.changeState(WriteStates.Writing);
        }
    }

    /**
     * get the quote the current {@code AutoWriter} should be
     * writing.
     *
     * @param increment return the next quote after the current
     *                  one.
     */
    getQuote(increment=false): string|undefined {
        let quote = this.quotes[this.quoteCounter];

        if (increment)
            this.quoteCounter = (++this.quoteCounter) % this.quotes.length;

        return quote;
    }

    /** get the current character from the current quote to write. */
    getChar(increment=false): string|undefined {
        let quote       = this.getQuote(),
            outOfBounds = this.charCounter >= quote.length,
            char        = outOfBounds ? undefined : quote[this.charCounter];

        if (increment && !outOfBounds) this.charCounter++;

        return char;
    }

    changeState(newState: WriteStates) {
        this.writeStatus = newState;
        this.timeout     = this.options.initialTimeout;

        switch (newState) {
            case WriteStates.WaitingToErase:
                this.cursor.stopBlinking();
                this.cursor.startBlinking(200);
                this.waitingTime = this.options.writeFinishedDelay;
                break;
            case WriteStates.WaitingToWrite:
                this.cursor.stopBlinking();
                this.cursor.startBlinking(200);
                this.waitingTime = this.options.eraseFinishedDelay;
                break;
            default:
                this.cursor.stopBlinking();
                break;
        }
    }
}

/**
 * randomly reorder the elements of array {@code a}.
 * partially sourced from {@link https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array}
 *
 * @param a the array of elements to be shuffled.
 */
function shuffleArray<T>(a: T[]): T[] {
    for (let i = a.length - 1; i > 0; i--) {
        // swap element at index i with element at j
        const j = Math.floor(Math.random() * (i + 1));

        const temp = a[i];
        a[i] = a[j];
        a[j] = temp;
    }

    return a;
}

/**
 * start an autowriter at the end of {@code element}, appending quotes.
 *
 * @param element the parent element to start writing to.
 * @param quotes  the array of strings to be written.
 * @param prefix  prepend to the input quotes before writing.
 */
export default function autoWriter(
    element: HTMLElement, quotes: string[],
    options: Options): AutoWriter|null {

    if (!element) {
        console.error('auto writer attempted with null element', element);
        return null;
    }

    console.debug('auto writer begun on element', element);
    let writer = new AutoWriter(element, shuffleArray(quotes), options);
    return writer;
}
