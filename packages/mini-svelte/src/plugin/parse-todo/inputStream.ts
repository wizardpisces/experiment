import { Position } from './ast'

export type InputStream = {
    next: () => string,
    peek: () => string,
    setCoordination: (position: Position) => void,
    getCoordination: () => Position,
    eof: () => boolean,
    croak: (msg: string) => void,

}

export default function inputStream(input: string, filename: string): InputStream {

    let offset = 0, line = 1, column = 1;
    return {
        next,
        peek,
        setCoordination,
        getCoordination,
        eof,
        croak
    };

    function next() {
        let ch = input.charAt(offset++);

        if (ch == "\n") line++, column = 1; else column++;

        return ch;
    }

    function setCoordination(coordination: Position) {
        offset = coordination.offset;
        line = coordination.line;
        column = coordination.column;
    }

    function getCoordination() {
        return {
            offset,
            line,
            column
        }
    }

    function peek() {
        return input.charAt(offset);
    }

    function eof() {
        return peek() === "";
    }

    function croak(msg: string) {
        throw new Error(msg + " (" + line + ":" + column + ")");
    }
}