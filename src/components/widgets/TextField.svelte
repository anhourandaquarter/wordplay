<script lang="ts">
    import { onMount, tick } from 'svelte';
    import { withVariationSelector } from '../../unicode/emoji';
    import setKeyboardFocus from '@components/util/setKeyboardFocus';

    export let text = '';
    export let placeholder: string;
    export let description: string;
    export let validator: undefined | ((text: string) => boolean) = undefined;
    export let changed: undefined | ((text: string) => void) = undefined;
    export let done: undefined | ((text: string) => void) = undefined;
    export let fill = false;
    export let view: HTMLInputElement | undefined = undefined;
    export let border = true;
    export let right = false;
    export let defaultFocus = false;
    export let editable = true;
    export let classes: string[] | undefined = undefined;
    /** An optional ID applied to the data-id attribute*/
    export let id: number | undefined = undefined;
    export let kind: 'email' | 'password' | undefined = undefined;
    /** CSS length or nothing, setting the max-width of the field*/
    export let max: string | undefined = undefined;

    let width = 0;

    function handleInput() {
        if (changed && (validator === undefined || validator(text) === true))
            changed(text);

        // Restore input
        tick().then(() => {
            if (view) {
                setKeyboardFocus(view, 'Restoring focus after text edit.');
            }
        });
    }

    function setKind(kind: 'email' | 'password' | undefined) {
        if (view === undefined) return;
        if (kind === 'email' && view) view.type = 'email';
        else if (kind === 'password' && view) view.type = 'password';
        else view.type = 'text';
    }

    function handleKeyDown(event: KeyboardEvent) {
        const number = parseFloat(text);

        // Not moving past a boundary? Don't let anything handle the event. Otherwise bubble it.
        const movingPastStart =
            event.key === 'ArrowLeft' &&
            view &&
            view.selectionStart !== null &&
            view.selectionStart === 0;
        const movingPastEnd =
            event.key === 'ArrowRight' &&
            view &&
            view.selectionStart !== null &&
            view.selectionStart === text.length;

        // Stop propation on arrows unless moving past a boundary.
        if (
            event.key.length === 1 ||
            event.key === 'Backspace' ||
            (event.key.startsWith('Arrow') &&
                !movingPastStart &&
                !movingPastEnd)
        )
            event.stopPropagation();

        // Not a number or not an up/down arrow key? Return.
        if (isNaN(number)) return;

        // Handle increment/decrement.
        if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
        event.stopPropagation();
        text = (number + (event.key === 'ArrowUp' ? 1 : -1)).toString();
        handleInput();
    }

    onMount(() => {
        setKind(kind);
    });

    $: setKind(kind);
</script>

<div class="field">
    <input
        type="text"
        class={classes?.join(' ')}
        class:fill
        class:border
        class:right
        data-id={id}
        data-defaultfocus={defaultFocus ? '' : null}
        class:error={validator ? validator(text) === false : null}
        aria-label={description}
        aria-placeholder={placeholder}
        placeholder={withVariationSelector(placeholder)}
        style:width={fill ? null : `${width + 5}px`}
        style:max-width={max}
        disabled={!editable}
        bind:value={text}
        bind:this={view}
        on:input={handleInput}
        on:keydown={handleKeyDown}
        on:pointerdown|stopPropagation
        on:blur={() => (done ? done(text) : undefined)}
    />
    <span class="measurer" bind:clientWidth={width}
        >{text.length === 0
            ? placeholder
            : kind === 'password'
              ? '•'.repeat(text.length)
              : text.replaceAll(' ', '\xa0')}</span
    >
</div>

<style>
    .field {
        display: inline-block;
        position: relative;
    }

    [disabled] {
        color: var(--wordplay-inactive-color);
    }

    input {
        width: auto;
        height: 100%;
        background: none;
        font-size: inherit;
        font-family: inherit;
        font-weight: inherit;
        color: inherit;
        border: none;
        outline: none;
        min-width: 1em;
        cursor: text;
    }

    input::placeholder {
        font-family: var(--wordplay-app-font);
    }

    .measurer {
        display: inline-block;
        position: absolute;
        left: 0;
        top: 0;
        background: none;
        font-size: inherit;
        font-family: inherit;
        color: inherit;
        border: none;
        outline: none;
        visibility: hidden;
    }

    input.border {
        border-bottom: var(--wordplay-inactive-color) solid
            var(--wordplay-focus-width);
    }

    input.right {
        text-align: right;
    }

    input.fill {
        width: 100%;
    }

    input:focus {
        border-bottom: var(--wordplay-focus-color) solid
            var(--wordplay-focus-width);
    }

    input.error {
        color: var(--wordplay-error);
    }

    input::placeholder {
        color: var(--wordplay-inactive-color);
        font-style: italic;
        opacity: 1;
    }
</style>
