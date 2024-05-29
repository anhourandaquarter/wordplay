<script lang="ts">
    import OutputProperty from '@edit/OutputProperty';
    import OutputPropertyValueSet from '@edit/OutputPropertyValueSet';
    import PaletteProperty from './PaletteProperty.svelte';
    import type Project from '@models/Project';
    import type OutputExpression from '@edit/OutputExpression';
    import { Projects, locales } from '@db/Database';
    import getSequenceProperties from '../../edit/SequenceProperties';
    import Options from '../widgets/Options.svelte';
    import { getFirstName } from '@locale/Locale';
    import parseExpression from '@parser/parseExpression';
    import { toTokens } from '@parser/toTokens';
    import Evaluate from '@nodes/Evaluate';

    export let project: Project;
    export let outputs: OutputExpression[];
    export let editable: boolean;

    $: SequenceProperties = getSequenceProperties(project, $locales);

    // Create a mapping from pose properties to values
    let propertyValues: Map<OutputProperty, OutputPropertyValueSet>;
    $: {
        propertyValues = new Map();

        // Map the properties to a set of values.
        for (const property of SequenceProperties) {
            const valueSet = new OutputPropertyValueSet(property, outputs);
            // Exclue any properties that happen to have no values.
            if (!valueSet.isEmpty() && valueSet.onAll())
                propertyValues.set(property, valueSet);
        }
    }

    const sequenceOptions: string[] = [
        "custom",
        ...Object.keys($locales.get((l) => l.output.sequence))
    ];

    let selectedSequenceOption = "";
    $: { getSelectedSequenceOption(); }

    function switchSequenceOption(option: string | undefined) {
        const posesProperty = SequenceProperties.find(property => property.getName() === "poses");
        console.log(posesProperty);
        console.log(propertyValues);
        if (posesProperty !== undefined) {
            const posesOutputs = propertyValues.get(posesProperty);
            if (posesOutputs !== undefined && option !== "custom") {
                const newSequence = parseExpression(toTokens(`${option}()`));
                Projects.revise(
                    project,
                    project.getBindReplacements(
                        posesOutputs.getExpressions(),
                        posesProperty.getName(),
                        newSequence),
                );
            } else {
            }
        } else {
        }
    }

    function getSelectedSequenceOption() {
        const posesOutputs = new OutputPropertyValueSet(getSequenceProperties(project, $locales)[0], outputs);
        const sequenceInput = posesOutputs.getExpressions()[0].inputs[0];
        if (sequenceInput instanceof Evaluate) {
            // const function = sequenceInput.getFunction(/** context */);
            // compare with the functions from Project.shares.sequences
            selectedSequenceOption = "default";
        }
        selectedSequenceOption = "custom";
    }
</script>

<div class="sequence-properties">
    <Options
        value={selectedSequenceOption}
        label={$locales.get((l) => getFirstName(l.output.Sequence.option.names))}
        id="sequence-option-chooser"
        options={[
            ...sequenceOptions.map((sequence) => {
                return {
                    value: sequence,
                    label: sequence,
                };
            }),
        ]}
        change={(option) => switchSequenceOption(option)}
        width="10em"
    />
    {#each Array.from(propertyValues.entries()) as [property, values]}
        <PaletteProperty {project} {property} {values} {editable} />
    {/each}
</div>

<style>
    .sequence-properties {
        margin-left: var(--wordplay-spacing);
        padding-left: var(--wordplay-spacing);
        border-left: solid var(--wordplay-border-color)
            var(--wordplay-border-width);

        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        align-items: left;
        gap: var(--wordplay-spacing);
        width: 100%;
    }
</style>
