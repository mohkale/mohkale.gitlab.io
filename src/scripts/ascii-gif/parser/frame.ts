import createHtmlElement from 'create-html-element';

// interface RenderOptions
type RenderOptions = { [key: string]: any }

export default class AsciiFrame {
    span: number = 1;
    rows: string[] = [];
    styles: { [key: string]: string } = {};

    append(row: string): void {
        this.rows.push(row)
    }

    get styleEntries(): string[] {
        return Object
            .entries(this.styles)
            .map(([key, val]) => `${key}: ${val};`)
    }

    get empty(): boolean {
        return this.rows.length === 0;
    }
}
