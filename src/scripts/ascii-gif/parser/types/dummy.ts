import { ArgumentType, ParseArgs } from '../command';

export default class DummyArgumentType extends ArgumentType<string> {
    constructor(name: string, parse?: (arg: ParseArgs) => string) {
        super();
        this.typeName = name;

        if (parse) {
            this.parse = parse;
        }
    }

    argCount = -1;

    parse({ line }: ParseArgs): string {
        return line;
    }
}
