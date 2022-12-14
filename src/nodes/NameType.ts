import type Conflict from "../conflicts/Conflict";
import { UnknownTypeName } from "../conflicts/UnknownTypeName";
import Token from "./Token";
import Type from "./Type";
import type Node from "./Node";
import TypeVariable from "./TypeVariable";
import UnknownType from "./UnknownType";
import type Context from "./Context";
import Value from "../runtime/Value";
import type Definition from "./Definition";
import StructureDefinition from "./StructureDefinition";
import VariableType from "./VariableType";
import { NAME_NATIVE_TYPE_NAME } from "../native/NativeConstants";
import type Transform from "../transforms/Transform";
import Replace from "../transforms/Replace";
import NameToken from "./NameToken";
import type Translations from "./Translations";
import { TRANSLATE } from "./Translations"
import TypeInputs from "./TypeInputs";

export default class NameType extends Type {

    readonly name: Token;
    readonly types: TypeInputs | undefined;

    constructor(type: Token | string, types?: TypeInputs) {
        super();

        this.name = typeof type === "string" ? new NameToken(type) : type;
        this.types = types;

        this.computeChildren();

    }

    getGrammar() { 
        return [
            { name: "name", types: [ Token ] },
            { name: "type", types: [[ TypeInputs ]] },
        ];
    }

    replace(original?: Node, replacement?: Node) { 
        return new NameType(
            this.replaceChild("name", this.name, original, replacement),
            this.replaceChild("types", this.types, original, replacement)
        ) as this;
    }

    getName() { return this.name.getText(); }

    computeConflicts(context: Context): Conflict[] { 
        
        const conflicts = [];

        const def = this.resolve(context);
        // The name should be a structure type or a type variable on a structure that contains this name type.
        if(!(def instanceof StructureDefinition || def instanceof TypeVariable))
            conflicts.push(new UnknownTypeName(this));

        return conflicts; 
    
    }

    accepts(type: Type, context: Context): boolean {    
        const thisType = this.getType(context);
        return thisType === undefined ? 
            false : 
            thisType.accepts(type, context);
    }

    resolve(context: Context): Definition | undefined {

        // Find the name in the binding scope.
        return context.get(this)?.getBindingScope()?.getDefinitionOfName(this.getName(), context, this);

    }

    isTypeVariable(context: Context) { return this.resolve(context) instanceof TypeVariable; }

    getType(context: Context): Type {

        // The name should be defined.
        const definition = this.resolve(context);
        if(definition === undefined) return new UnknownType({ definition: this, name: this.name });
        else if(definition instanceof TypeVariable) return new VariableType(definition);
        else return definition instanceof Value ? definition.getType(context) : definition.getTypeUnlessCycle(context);

    }

    getNativeTypeName(): string { return NAME_NATIVE_TYPE_NAME; }

    getDescriptions(): Translations {
        return {
            "😀": TRANSLATE,
            eng: "A structure type"
        }
    }

    getChildReplacement(child: Node, context: Context): Transform[] | undefined {

        const definition = this.resolve(context);
        if(child === this.name)
            // Any StructureDefinition and Type Variable in
            return (this.getAllDefinitions(this, context)
                    .filter(def => 
                        (def instanceof StructureDefinition || def instanceof TypeVariable) && 
                        def !== definition &&
                        // If the current name doesn't correspond to a type, then filter the types down to those that match the prefix.
                        (this.getName() === "" || def.getNames().find(name => name.startsWith(this.getName()) !== undefined))
                    ) as (StructureDefinition|TypeVariable)[])
                    .map(def => new Replace(context, child, [ name => new NameToken(name), def ]))

    }

    getInsertionBefore() { return undefined; }
    getInsertionAfter() { return undefined; }
    getChildRemoval(): Transform | undefined { return undefined; }
}