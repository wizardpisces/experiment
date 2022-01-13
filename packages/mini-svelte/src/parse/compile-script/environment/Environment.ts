import { NodeTypes } from '../../type';

export enum Kind {
    FunctionDeclaration = NodeTypes['FunctionDeclaration'],
    VariableDeclarator = NodeTypes['VariableDeclarator']
}

export class Variable {
    private _value: any
    kind: Kind = Kind.VariableDeclarator // set default as VariableDeclarator
    constructor(kind: Kind, val: any) {
        this.kind = kind;
        this._value = val;
    }
    get value() {
        return this._value;
    }
    set value(val: any) {
        this._value = val;
    }
}

let returnValue: any = undefined
class BaseEnvironment {
    public setReturnValue(value: any = undefined) {
        returnValue = value
    }

    public getReturnValue() {
        /**
         * return value can only be accessed once
         */
        let ret = returnValue
        returnValue = undefined
        return ret;
    }
}

export class Environment extends BaseEnvironment {
    vars: {
        [kind: string]: {
            [name: string]: Variable
        }
    }
    parent!: Environment | null
    codeMap: Map<string, string> = new Map() // cover shallow code definition which could be accessed by template
    constructor(parent: Environment | null = null) {
        super()
        // this.vars = Object.create(parent ? parent.vars : null); //block prototype chain for lookup to find right top scope
        this.vars = {}
        this.parent = parent;
    }

    private lookup(name: string, kind: Kind): Environment | undefined {
        let scope: Environment | null = this;
        while (scope) {
            if (scope.vars[kind] && scope.vars[kind][name])
                return scope;
            scope = scope.parent;
        }
    }

    public isTopEnv() {
        return this.parent === null
    }

    public extend() {
        return new Environment(this);
    }

    public get(name: string, kind: Kind = Kind.VariableDeclarator) { // for update coresponding env
        let scope = this.lookup(name, kind);

        if (scope) {
            let res = {
                name,
                value: scope.vars[kind][name].value,
                env: scope
            }
            return res
        } else {
            throw Error(`[Environment]:${name} is not defined yet!`)
        }
    }

    public def(name: string, value: any = '', kind: Kind = Kind.VariableDeclarator) {
        if (!this.vars[kind]) {
            this.vars[kind] = {}
        }
        return this.vars[kind][name] = new Variable(kind, value);
    }

    public defCode(name: string, code: any) {
        this.codeMap.set(name, code)
    }
    public getCode(name: string) {
        return this.codeMap.get(name)
    }
}