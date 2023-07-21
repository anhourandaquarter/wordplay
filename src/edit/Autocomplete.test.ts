import { test, expect } from 'vitest';
import Caret from './Caret';
import Project from '@models/Project';
import Source from '@nodes/Source';
import { getEditsAt } from './Autocomplete';
import type Node from '@nodes/Node';
import { getDefaultNative } from '@native/Native';
import Assign from './Assign';
import Replace from './Replace';
import NumberLiteral from '../nodes/NumberLiteral';
import Append from './Append';

const native = await getDefaultNative();

test.each([
    ['a:**', undefined, Assign, '0'],
    ['**', undefined, Append, '💬(_•""|[""])'],
    [`ƒ sum(a•? b•?) a & b\ns**`, undefined, Replace, 'sum(_•? _•?)'],
    [`ƒ sum(a•? b•?) a & b\nsum()**`, undefined, Replace, '(sum())'],
    [`"hi".**`, undefined, Replace, '"hi".📏()'],
    [`"hi".**`, undefined, Replace, '"hi" = _•\'\''],
    [
        `•Cat(hat•"")\nboomy: Cat("none")\nboomy.**`,
        undefined,
        Replace,
        'boomy.hat',
    ],
    // Selecting 2 should offer to replace with c
    [
        `c: 1\n1 + 2`,
        (node: Node) =>
            node instanceof NumberLiteral && node.toWordplay() === '2',
        Replace,
        'c',
    ],
])(
    'Code %s should have a transform ',
    (
        code: string,
        position: ((node: Node) => boolean) | undefined,
        kind: Function,
        edit: string
    ) => {
        // See if there's a placeholder for the caret.
        const insertionPoint = code.indexOf('**');
        if (insertionPoint >= 0)
            code =
                code.substring(0, insertionPoint) +
                code.substring(insertionPoint + 2);

        const source = new Source('test', code);
        const project = new Project(null, 'test', source, [], native);
        let resolvedPosition =
            position === undefined
                ? insertionPoint
                : source.nodes().find((node) => position(node));
        expect(resolvedPosition).toBeDefined();
        if (resolvedPosition !== undefined) {
            const caret = new Caret(
                source,
                resolvedPosition,
                undefined,
                undefined,
                undefined
            );
            const transforms = getEditsAt(project, caret);

            const match = transforms.find(
                (transform) =>
                    transform instanceof kind &&
                    transform.getNewNode(['en'])?.toWordplay() === edit
            );
            if (match === undefined) {
                console.log(
                    transforms
                        .map(
                            (t) =>
                                `${t.constructor.name}\t${t
                                    .getNewNode(['en'])
                                    ?.toWordplay()}`
                        )
                        .join('\n')
                );
            }

            expect(match?.getNewNode(['en'])?.toWordplay()).toBe(edit);
        }
    }
);
