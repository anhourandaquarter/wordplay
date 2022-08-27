import Node from "./Node";

export enum TokenType {
    EVAL_OPEN,     // (
    EVAL_CLOSE,    // )
    SET_OPEN,      // {
    SET_CLOSE,     // }
    LIST_OPEN,     // [
    LIST_CLOSE,    // ]
    BIND,          // :
    ACCESS,        // .
    FUNCTION,      // ƒ
    BORROW,        // ↓
    SHARE,         // ↑
    CONVERT,       // →
    DOCS,          // `
    NONE,          // ø
    TYPE,          // •
    TYPE_VAR,      // *
    ALIAS,         // ,
    LANGUAGE,      // /
    BOOLEAN_TYPE,  // ?
    TEXT_TYPE,     // ""
    NUMBER_TYPE,   // #
    JAPANESE,
    ROMAN,
    PI,
    INFINITY,    
    NONE_TYPE,     // !
    TABLE,         // |
    SELECT,        // |?
    INSERT,        // |+
    UPDATE,        // |:
    DELETE,        // |-
    UNION,         // |
    STREAM,        // ∆
    PREVIOUS,      // @
    ETC,           // …
    // These are the only operators eligible for unary, binary, or teriary notation.
    // We’ve included them for consistency with math notation and readability.
    UNARY_OP,      // e.g., ¬~
    BINARY_OP,     // +-×÷%<≤≥>&|
    CONDITIONAL,   // ?
    // Also supports escapes with \to encode various characters
    // The trailing text at the end encodes the format.
    // Text literals can also come in multiple formats, to encode multilingual apps in place.
    TEXT,          // ‘“«„“「‹(.*)‘”»”」›
    TEXT_OPEN,
    TEXT_BETWEEN,
    TEXT_CLOSE,
    // The optional negative sign allows for negative number literals.
    // The optional dash allows for a random number range.
    // The trailing text at the end encodes the unit.
    // Both commas and periods are allowed to cover different conventions globally.
    NUMBER,         // -?[0-9]+([.,][0-9]+)?(-[0-9]+([.,][0-9]+)?)[^\s]*
    DECIMAL,
    BASE,           // a number in base 2-16
    BOOLEAN,        // ⊥⊤
    NAME,           // (anything not the above)+
    UNKNOWN,        // Represents any characters that couldn't be tokenized.
    END
}

const TokenCategoryDelimiter = "delimiter";
const TokenCategoryRelation = "relation";
const TokenCategoryShare = "share";
const TokenCategoryEvaluation = "eval";
const TokenCategoryDocs = "docs";
const TokenCategoryLiteral = "literal";
const TokenCategoryName = "name";
const TokenTypeLiteral = "type";
const TokenCategoryOperator = "operator";
const TokenCategoryUnknown = "unknown";

export const TokenKinds: Map<TokenType, string> = new Map();
TokenKinds.set(TokenType.EVAL_OPEN, TokenCategoryDelimiter);
TokenKinds.set(TokenType.EVAL_CLOSE, TokenCategoryDelimiter);
TokenKinds.set(TokenType.SET_OPEN, TokenCategoryDelimiter);
TokenKinds.set(TokenType.SET_CLOSE, TokenCategoryDelimiter);
TokenKinds.set(TokenType.LIST_OPEN, TokenCategoryDelimiter);
TokenKinds.set(TokenType.LIST_CLOSE, TokenCategoryDelimiter);
TokenKinds.set(TokenType.BIND, TokenCategoryRelation);
TokenKinds.set(TokenType.ACCESS, TokenCategoryRelation);
TokenKinds.set(TokenType.FUNCTION, TokenCategoryEvaluation);
TokenKinds.set(TokenType.BORROW, TokenCategoryEvaluation);
TokenKinds.set(TokenType.SHARE, TokenCategoryShare);
TokenKinds.set(TokenType.CONVERT, TokenCategoryShare);
TokenKinds.set(TokenType.DOCS, TokenCategoryDocs);
TokenKinds.set(TokenType.NONE, TokenCategoryLiteral);
TokenKinds.set(TokenType.TYPE, TokenCategoryRelation);
TokenKinds.set(TokenType.TYPE_VAR, TokenCategoryRelation);
TokenKinds.set(TokenType.ALIAS, TokenCategoryDelimiter);
TokenKinds.set(TokenType.LANGUAGE, TokenCategoryLiteral);
TokenKinds.set(TokenType.BOOLEAN_TYPE, TokenCategoryLiteral);
TokenKinds.set(TokenType.TEXT_TYPE, TokenTypeLiteral);
TokenKinds.set(TokenType.NUMBER_TYPE, TokenTypeLiteral);
TokenKinds.set(TokenType.JAPANESE, TokenCategoryLiteral);
TokenKinds.set(TokenType.ROMAN, TokenCategoryLiteral);
TokenKinds.set(TokenType.PI, TokenCategoryLiteral);
TokenKinds.set(TokenType.INFINITY, TokenCategoryLiteral);
TokenKinds.set(TokenType.NONE_TYPE, TokenTypeLiteral);
TokenKinds.set(TokenType.TABLE, TokenCategoryOperator);
TokenKinds.set(TokenType.SELECT, TokenCategoryOperator);
TokenKinds.set(TokenType.INSERT, TokenCategoryOperator);
TokenKinds.set(TokenType.UPDATE, TokenCategoryOperator);
TokenKinds.set(TokenType.DELETE, TokenCategoryOperator);
TokenKinds.set(TokenType.UNION, TokenCategoryOperator);
TokenKinds.set(TokenType.STREAM, TokenCategoryOperator);
TokenKinds.set(TokenType.PREVIOUS, TokenCategoryOperator);
TokenKinds.set(TokenType.ETC, TokenCategoryRelation);
TokenKinds.set(TokenType.UNARY_OP, TokenCategoryOperator);
TokenKinds.set(TokenType.BINARY_OP, TokenCategoryOperator);
TokenKinds.set(TokenType.CONDITIONAL, TokenCategoryOperator);
TokenKinds.set(TokenType.TEXT, TokenCategoryLiteral);
TokenKinds.set(TokenType.TEXT_OPEN, TokenCategoryLiteral);
TokenKinds.set(TokenType.TEXT_BETWEEN, TokenCategoryLiteral);
TokenKinds.set(TokenType.TEXT_CLOSE, TokenCategoryLiteral);
TokenKinds.set(TokenType.NUMBER, TokenCategoryLiteral);
TokenKinds.set(TokenType.DECIMAL, TokenCategoryLiteral);
TokenKinds.set(TokenType.BASE, TokenCategoryLiteral);
TokenKinds.set(TokenType.BOOLEAN, TokenCategoryLiteral);
TokenKinds.set(TokenType.NAME, TokenCategoryName);
TokenKinds.set(TokenType.UNKNOWN, TokenCategoryUnknown);

export default class Token extends Node {
    /** The one or more types of token this might represent. */
    readonly types: TokenType[];
    /** The text of the token */
    readonly text: string;
    /** Spaces and tabs preceding this token. */
    readonly space: string;
    /** The index in the source file at which this token starts. */
    readonly index: number;

    constructor(text: string, types: TokenType[], index: number=0, space: string="") {
        super();
        this.types = types.slice();
        this.text = text;
        this.space = space;
        this.index = index;
    }
    getIndex() { return this.index; }
    getLength() { return this.text.length; }
    getChildren() { return []; }
    getPrecedingSpace() { return this.space; }
    hasPrecedingSpace() { return this.space.length > 0; }
    hasPrecedingLineBreak() { return this.space.includes("\n"); }
    isnt(type: TokenType) { return !this.is(type); }
    is(type: TokenType) { return this.types.includes(type); }
    isName() { return this.is(TokenType.NAME); }
    toString(depth: number=0){ return `${"\t".repeat(depth)}${this.types.map(t => TokenType[t]).join('/')}(${this.space.length},${this.index}): ${this.text.replaceAll("\n", "\\n").replaceAll("\t", "\\t")}`; }
    toWordplay() { return this.space + this.text; }

    getConflicts() { return []; }

}