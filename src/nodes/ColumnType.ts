import Token from "./Token";
import TokenType from "./TokenType";
import Bind from "../nodes/Bind";
import type Node from "../nodes/Node";
import Type from "./Type";
import type Context from "./Context";
import { TABLE_OPEN_SYMBOL } from "../parser/Tokenizer";
import type Transform from "../transforms/Transform";
import type Translations from "./Translations";
import { TRANSLATE } from "./Translations"
import UnknownType from "./UnknownType";
import type TypeSet from "./TypeSet";
import type { NativeTypeName } from "../native/NativeConstants";

export default class ColumnType extends Type {

    readonly bar: Token;
    readonly bind?: Bind;

    constructor(bind?: Bind, bar?: Token) {
        super();

        this.bar = bar ?? new Token(TABLE_OPEN_SYMBOL, TokenType.TABLE_OPEN);
        this.bind = bind;

        this.computeChildren();

    }

    getGrammar() { 
        return [
            { name: "bar", types:[ Token ] },
            { name: "bind", types:[ Bind, undefined ] },
        ]; 
    }

    replace(original?: Node, replacement?: Node) { 
        return new ColumnType(
            this.replaceChild("bind", this.bind, original, replacement),
            this.replaceChild("bar", this.bar, original, replacement)
        ) as this; 
    }

    hasDefault() { return this.bind instanceof Bind && this.bind.hasDefault(); }

    computeConflicts() {}

    acceptsAll(types: TypeSet, context: Context): boolean {
        return types.list().every(type => 
            type instanceof ColumnType && 
            type.bind instanceof Bind && 
            this.bind instanceof Bind && 
            this.bind.getTypeUnlessCycle(context).accepts(type.bind.getTypeUnlessCycle(context), context)
        );
    }

    getValueType(context: Context) { return this.bind === undefined ? new UnknownType(this) : this.bind.getType(context); }

    getNativeTypeName(): NativeTypeName { return "column"; }

    getChildReplacement(): Transform[] | undefined { return undefined; }
    getInsertionBefore(): Transform[] | undefined { return undefined; }
    getInsertionAfter(): Transform[] | undefined { return undefined; }
    getChildRemoval(): Transform | undefined { return undefined; }
    
    getDescriptions(): Translations {
        return {
            "😀": TRANSLATE,
            eng: "A table column type"
        }
    }

}