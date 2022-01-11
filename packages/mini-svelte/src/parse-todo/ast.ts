export enum NodeTypes {
    TEXT = 'TEXT',
    UNKNOWN = 'UNKNOWN'
}
export interface Position {
    offset: number // from start of file
    line: number
    column: number
}

export interface SourceLocation {
    filename: string
    start: Position
    end: Position
    // source: string
}

export interface Node {
    [key: string]: any
    type: NodeTypes
    loc: SourceLocation
}
