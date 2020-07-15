import AsciiGif from './gif';

/**
 * arguments passed to ArgumentType while parsing
 */
export interface ParseArgs {
    args: string[];
    /* args as an unsplit string */
    line: string;
}

/**
 * something which takes one or more argument strings and
 * produces a single value of type T.
 *
 * See also {@code Command.argument}
 */
export abstract class ArgumentType<T> {
    /* number of arguments the argument type should take
     * set to a value less than 0 to pass the rest of the
     * input. Set to 0 to have the same affect as -1, but
     * also throw an error if the line is empty. */
    argCount: number = 1;
    typeName: string = "type";
    abstract parse(args: ParseArgs): T;
}

/**
 *
 */
export interface ExecuteArgs {
    /* the current gif which is being populated */
    gif: AsciiGif;

    /* matches the key, value pairs in Command.argument
     * to their parsed values. */
    args: { [key: string]: any };
}

export interface Command {
    /* full name of the current command */
    command: string;

    /*
     * list of arguments the command should take.
     *
     * each argument is parsed using the associated value
     * producing a dictionary of arguments which are then
     * passed along to execute.
     */
    argument: { [key: string]: ArgumentType<any> };

    /* do whatever this command is supposed to do */
    execute?: (args: ExecuteArgs) => void
}
