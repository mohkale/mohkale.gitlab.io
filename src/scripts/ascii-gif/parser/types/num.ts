import { ArgumentType, ParseArgs } from '../command';

const PARSE_NUM = /\d+/;

export default class NumericalArgumentType {
    argCount = 1;
    typeName = "number";

    parse({ args }: ParseArgs): number {
        let num = PARSE_NUM.exec(args[0]);

        if (num) { return parseInt(num[0]); } else {
            throw "argument isn't a valid number";
        }
    }
}
