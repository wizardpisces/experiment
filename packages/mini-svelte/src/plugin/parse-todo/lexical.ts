import { Node, NodeTypes } from "./ast";
import { InputStream } from "./inputStream";
export {
    Token,
    LexicalStream
}

type Token = {
    type: Node['type']
    value: string
}

type LexicalStream = {
    next: () => Token,
    peek: (n?: number) => Token,
    eliminateWhitespace: () => void,
    eof: () => boolean,
    getCoordination: InputStream['getCoordination'],
    setCoordination: InputStream['setCoordination'],
}

type PredictFn = (...args: any[]) => boolean


const UnknownToken: Token = {
    type: NodeTypes.UNKNOWN,
    value: 'Unknown'
}

const NullToken: Token = {
    type: NodeTypes.UNKNOWN,
    value: 'Null'
}


function is_whitespace(ch: string) {
    return " \t\n".indexOf(ch) >= 0;
}

export default function lex(input: InputStream): LexicalStream {
    return {
        ...input,
        next,
        peek,
        eliminateWhitespace,
        eof,
    }
    function read_while(predicate: PredictFn) {
        let str = "";
        while (!input.eof() && predicate(input.peek()))
            str += input.next();
        return str;
    }

    function readNext(): Token { // needs to do more in depth analyze for css selector
        read_while(is_whitespace);
        if (input.eof()) return NullToken;
        let ch = input.peek();


        // if (is_base_char(ch)) return maybeNamespace(read_string());
        // if (isClassStart(ch)) return readClassName();

        return UnknownToken;
    }

    function eliminateWhitespace() {
        read_while(is_whitespace);
    }
    /**
   * reset coordination after peek ll(n) lexical value
   * https://www.geeksforgeeks.org/construction-of-ll1-parsing-table/
   */
    function ll(n = 1) {
        let coordination = input.getCoordination()
        let tok: Token | null = readNext();

        while (--n) {
            tok = readNext();
        }

        input.setCoordination(coordination)
        return tok;
    }

    function peek(n = 1): Token {
        return ll(n);
    }

    function next(): Token {
        return readNext();
    }
    function eof() {
        return peek().type === NodeTypes.UNKNOWN;
    }
}