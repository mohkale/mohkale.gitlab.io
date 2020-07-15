import AsciiFrame from './frame'
import { exToPx, unitToPx } from '../../utils/utils';

import createHtmlElement from 'create-html-element';

let idCounter = 0

export default class AsciiGif {
    id: number;
    dataName?: string;
    fps: number = 5;
    width?: number;
    height?: number;
    frames: AsciiFrame[] = [];
    source?: string;
    defaultFrameIndex: number = 1;

    constructor() {
        this.id = ++idCounter;
    }

    get length(): number {
        return this.frames.length;
    }

    get frame(): AsciiFrame {
        if (this.frames.length === 0) {
            this.frames.push(new AsciiFrame())
        }

        return this.frames[this.frames.length-1];
    }

    get defaultFrame(): AsciiFrame {
        let index = this.defaultFrameIndex - 1;

        if (index >= this.length) {
            console.warn('default frame index out of range');
            index = 0;
        }

        return this.frames[index];
    }

    makeFrame(): void {
        if (!this.frame.empty) {
            this.frames.push(new AsciiFrame())
        }
    }

    render(frameRef?: number|AsciiFrame): string {
        let frame: AsciiFrame;

        // unassigned means use the default frame for gif
        if (!frameRef) frameRef = this.defaultFrameIndex;
        if (frameRef as number) {
            let index = frameRef as number;

            if (index > this.length)
                throw `index out of range: ${index}/${this.length}`

            frame = this.frames[index-1];
        } else {
            frame = frameRef as AsciiFrame;
        }

        return createHtmlElement({
            name: 'pre',
            html: frame.rows.join('\n'),
            attributes: {
                'class': 'ascii-frame',
                style: frame.styleEntries
            }
        });
    }
}
