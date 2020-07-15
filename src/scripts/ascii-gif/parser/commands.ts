import { Command, ExecuteArgs } from './command';

import DummyArgument from './types/dummy';
import NumberArgument from './types/num';
import StyleArgument from './types/style';

interface Commands {
    [key: string]: Command
}

const commands: { [key: string]: Command } = {
    '-': {
        command: "name",
        argument: {
            name: new DummyArgument("name")
        },
        execute: function({ gif, args }) {
            gif.dataName = args.name as string;
        }
    },

    '$': {
        command: "fps",
        argument: {
            fps: new NumberArgument(),
        },
        execute: function({ gif, args }) {
            gif.fps = args.fps;
        }
    },

    '#': {
        command: 'comment',
        argument: {},
    },

    '"': {
        command: "animation-size",
        argument: {
            width:  new NumberArgument(),
            height: new NumberArgument(),
        },
        execute: function({ gif, args }) {
            gif.width  = args.width;
            gif.height = args.height;
        }
    },

    "|": {
        command: "frame-span",
        argument: {
            span: new NumberArgument()
        },
        execute: function({ gif, args }) {
            gif.frame.span = args.span;
        }
    },

    "%": {
        command: "add-row-to-frame",
        argument: {
            text: new DummyArgument("line")
        },
        execute: function({ gif, args }) {
            gif.frame.append(args.text);
        }
    },

    "@": {
        command: "source",
        argument: {
            source: new DummyArgument('source')
        },
        execute: function({ gif, args }) {
            gif.source = args.source;
        }
    },

    "+": {
        command: "style",
        argument: {
            style: new StyleArgument()
        },
        execute: function({ gif, args }) {
            let style = args.style;
            gif.frame.styles[style[0]] = style[1];
        }
    },

    "\\": {
        command: "new-frame",
        argument: {},
        execute: function({ gif }) {
            gif.makeFrame()
        }
    },

    "/": {
        command: "default-frame",
        argument: {
            frame: new NumberArgument()
        },
        execute: function({ gif, args }) {
            gif.defaultFrameIndex = args.frame;
        }
    }
}

export default commands;
