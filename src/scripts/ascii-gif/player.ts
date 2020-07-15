import AsciiGif from './parser/gif'
import { exToPx, unitToPx } from "../utils/utils";

const ASCII_LINE_HEIGHT = exToPx(2.5);

export default class Player {
    gif: AsciiGif;
    elem: Element;
    // the current frame
    frameCounter = 0;
    // how many frames this frame has run for
    frameSpanCounter = 0;

    constructor(elem: Element, gif: AsciiGif) {
        this.gif = gif;
        this.elem = elem;

        if (!this.elem.style.lineHeight) {
            this.lineHeight = `${ASCII_LINE_HEIGHT}px`;
        }

        this.step = this.step.bind(this);

        this.setIndex(0);

        if (this.gif.frames.length > 1) {
            setTimeout(this.step, this.mpf);
        }
    }

    private setIndex(index: number) {
        this.frameCounter = index;
        this.frameSpanCounter = Math.max(this.gif.frames[this.frameCounter].span-1, 1);
        this.elem.innerHTML = this.gif.render(this.frameCounter+1);
    }

    step() {
        if (!this.frameSpanCounter--) {
            this.setIndex(++this.frameCounter % this.gif.length);
        }

        setTimeout(this.step, this.mpf);
    }

    // miliseconds-per-frame
    get mpf() {
        return 1000 / this.gif.fps;
    }
}
