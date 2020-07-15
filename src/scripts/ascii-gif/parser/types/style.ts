import { ArgumentType, ParseArgs } from '../command';

const PARSE_CSS = /^([A-Za-z0-9-]+): (.+);/;

type Style = [string, string];

export default class StyleArgumentType extends ArgumentType<Style> {
    argCount = -1;
    typeName = "css-style";

    parse({ line: arg }: ParseArgs): Style {
        let style;
        if ((style = PARSE_CSS.exec(arg.trim()))) {
            return [style[1], style[2]]
        } else {
            throw "invalid style decleration";
        }
    }
}
