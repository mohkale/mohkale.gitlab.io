import AsciiGif from './gif'
import AsciiFrame from './frame';
import commands from './commands';

import * as util from 'util';
import { ParseArgs, Command } from './command';

/*
 * regular expression to split a line into command and args.
 */
const PARSE_GIF_COMMAND = /^(.):(?:((.+ ?)+))?/;

/**
 * trim a string, but also return the leading whitespace
 * section of the string.
 */
function verboseTrim(str: string): [string, string] {
    const regex = /(^\s+)/;
    let match   = regex.exec(str);
    let leading = ''; // whitespace

    if (match) leading = match[1];

    return [leading, str.slice(leading.length)];
}

// allow leading whitespace, but don't count
// '   ' as 3 arguments, count it as the seperator
// for one. eg.
//   '  hello' -> 1 argument ('  hello')
//   'hello  world' -> 2 arguments ('hello', '  world')
//   '  ' -> 0 arguments
function parseArgs_TrimToCount(line: string, count: number): number|null {
    let index = 0;

    for (let i=0; i < count; i++) {
        let [padding, lineTrimmed] = verboseTrim(line);

        // find where the next argument should start
        let search = lineTrimmed.search(' ');
        if (search === -1) {
            // no next argument, either string is empty (length == 0) or
            // this is the last argument (length > 0).
            search = line.length;
        } else {
            // next argument exists, make sure to add the padding pack on
            search += padding.length;
        }

        // failed to find {@code count} args
        if (search === 0) return null;

        index += search+1;
        line = line.slice(search+1);
    }

    return index;
}

function parseArgs(line: string, cmd: Command): { [key: string]: any } {
    line = line.repeat(1); // shallow clone line

    let result: { [key: string]: any } = {};

    for (let [key, argType] of Object.entries(cmd.argument)) {
        let argLine: string = '', argVals: string[];

        // when less then 0, the argCount is all remaining args
        if (argType.argCount <= 0) {
            // when argCount == 0, allow empty argument strings
            if (argType.argCount == 0 && line.length == 0) {
                throw `unable to supply argument ${key}, argument is empty`;
            }

            argLine = line;
            line = '';
        } else {
            let search, searchMaybe = parseArgs_TrimToCount(line, argType.argCount);
            if (searchMaybe) search = searchMaybe as number; else {
                throw `argument count mismtch: ${key} expected ${argType.argCount} arguments`
            }

            argLine = line.slice(0, search);
            line = line.slice(search)
        }

        result[key] = argType.parse({ line: argLine, args: argLine.trim().split(/\s+/) });
    }

    return result;
}

function executeCommand(gif: AsciiGif, command: string, line: string) {
    let spec = commands[command];

    if (spec.execute) {
        let parsedArgs = parseArgs(line, spec);
        spec.execute({gif: gif, args: parsedArgs});
    }
}

const commandKeys = Object.keys(commands);

export default function parse(src: string): AsciiGif {
    let lineNum = 0;

    let gif = new AsciiGif();
    for (let line of src.split('\n')) {
        lineNum++;

        // make a new frame if you reach an empty line
        if (!line.trim()) gif.makeFrame(); else {
            let match;

            if (match = PARSE_GIF_COMMAND.exec(line)) {
                // executeCommand(match);
                let command = match[1],
                    rest    = match[2] || "";

                if (!commandKeys.includes(command)) {
                    console.warn(`unknown command '${command}' found in gif with id: ${gif.id}`);
                } else {
                    try { executeCommand(gif, command, rest); } catch (e) {
                        throw `exception on line ${lineNum} for command ${command}: ${e}`
                    }
                }
            } else {
                throw `syntax violation on line ${lineNum} cannot parse: ${line}`
            }
        }
    }

    // delete last frame when it's empty
    if (gif.frame.empty) gif.frames.pop()

    return gif;
}
