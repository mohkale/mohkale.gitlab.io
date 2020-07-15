/*
 * webpack loader to construct headers for ascii gif files. These headers are
 * just the default HTML element that should be shown if the gif fails to load
 * (for example, when javascript has been disabled).
 */

import * as fs from 'fs';
import * as path from 'path';
import * as webpack from 'webpack';
import { getOptions, interpolateName } from 'loader-utils';

import parse from './parser/index';

function destination(src: string, destName: string, destDir: string) {
    let srcName = path.basename(src, path.extname(src))

    if (!destName) {
        destName = srcName + '.header';
    } else {
        destName = interpolateName(this, destName, getOptions(this));
    }

    destDir = destDir || this.rootContext;
    return path.join(destDir, destName);
}

export default function(this: webpack.loader.LoaderContext, content: string): any {
    let sourcePath: string = this.resourcePath;
    let outputOptions = getOptions(this).output;
    let ext = outputOptions.extension || '.header';

    let srcParsed = path.parse(sourcePath);
    let dest = path.join(srcParsed.dir, srcParsed.name + ext);

    let output: string|undefined;
    try {
        output = parse(content).render();
    } catch (e) {
        this.emitError(`failed to parse file: ${sourcePath}\n${e}`);
    }

    if (output) {
        // emitFile has to be relative to ctx
        // this.emitFile(dest, output, null);
        let callback = this.async();
        fs.mkdir(path.dirname(dest), { recursive: true }, err => {
            if (err) return callback!(err);

            fs.writeFile(dest, output, 'utf-8', err => {
                if (err) return callback!(err);
                return callback!(null, '');
            });
        })
    }

    return '';
}
