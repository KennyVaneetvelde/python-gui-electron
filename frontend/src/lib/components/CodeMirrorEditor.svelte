<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { EditorState } from '@codemirror/state';
	import type { Extension } from '@codemirror/state';
	import { EditorView, keymap } from '@codemirror/view';
	import { defaultKeymap, indentWithTab } from '@codemirror/commands';
	import { markdown } from '@codemirror/lang-markdown';
	import { languages } from '@codemirror/language-data';
	import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
	import { tags } from '@lezer/highlight';

	export let value = '';
	export let readonly = false;

	const dispatch = createEventDispatcher<{
		change: string;
	}>();

	let element: HTMLDivElement;
	let view: EditorView;

	const markdownHighlighting = HighlightStyle.define([
		{ tag: tags.heading1, fontSize: '2em', fontWeight: '700', color: '#2196f3', lineHeight: '1.5' },
		{
			tag: tags.heading2,
			fontSize: '1.5em',
			fontWeight: '600',
			color: '#2196f3',
			lineHeight: '1.4'
		},
		{
			tag: tags.heading3,
			fontSize: '1.3em',
			fontWeight: '600',
			color: '#2196f3',
			lineHeight: '1.3'
		},
		{
			tag: tags.heading4,
			fontSize: '1.2em',
			fontWeight: '600',
			color: '#2196f3',
			lineHeight: '1.3'
		},
		{
			tag: tags.heading5,
			fontSize: '1.1em',
			fontWeight: '600',
			color: '#2196f3',
			lineHeight: '1.2'
		},
		{
			tag: tags.heading6,
			fontSize: '1.05em',
			fontWeight: '600',
			color: '#2196f3',
			lineHeight: '1.2'
		},
		{ tag: tags.strong, fontWeight: '600', color: '#2196f3' },
		{ tag: tags.emphasis, fontStyle: 'italic', color: '#2196f3' },
		{ tag: tags.link, color: '#2196f3', textDecoration: 'underline' },
		{ tag: tags.url, color: '#2196f3' },
		{
			tag: tags.processingInstruction,
			color: '#FF5722',
			backgroundColor: 'rgba(255, 87, 34, 0.1)',
			borderRadius: '3px',
			padding: '0 3px'
		},
		{ tag: tags.monospace, color: '#FF5722', backgroundColor: 'rgba(255, 87, 34, 0.1)' },
		{ tag: tags.list, color: '#4CAF50' },
		{
			tag: tags.quote,
			color: '#9E9E9E',
			fontStyle: 'italic',
			backgroundColor: 'rgba(33, 150, 243, 0.1)',
			display: 'block',
			paddingLeft: '1em',
			borderLeft: '3px solid #2196f3'
		}
	]);

	const baseTheme = EditorView.theme({
		'&': {
			height: '100%',
			fontSize: '16px',
			lineHeight: '1.7',
			color: 'var(--foreground)',
			backgroundColor: 'transparent'
		},
		'.cm-scroller': {
			fontFamily:
				'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
			padding: '2rem'
		},
		'.cm-content': {
			caretColor: '#2196f3',
			padding: '0',
			maxWidth: '800px',
			margin: '0 auto'
		},
		'.cm-line': {
			padding: '0.2em 4px',
			marginBottom: '0.3em'
		},
		'&.cm-focused': {
			outline: 'none'
		},
		'.cm-activeLineGutter': {
			backgroundColor: 'transparent'
		},
		'.cm-gutters': {
			backgroundColor: 'transparent',
			border: 'none',
			userSelect: 'none'
		},
		'.cm-gutterElement': {
			padding: '0 8px 0 4px',
			opacity: '0.5',
			color: 'var(--muted-foreground)'
		},
		'.cm-cursor': {
			borderLeftColor: '#2196f3',
			borderLeftWidth: '2px'
		},
		'&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
			backgroundColor: 'rgba(33, 150, 243, 0.2)'
		},
		'.cm-activeLine': {
			backgroundColor: 'rgba(33, 150, 243, 0.05)'
		},
		// Markdown list styling
		'.cm-list-1, .cm-list-2, .cm-list-3': {
			color: '#4CAF50',
			fontWeight: '600'
		},
		// Code block styling
		'.cm-fenced-code': {
			backgroundColor: 'rgba(255, 87, 34, 0.1)',
			padding: '0.5em',
			borderRadius: '4px',
			margin: '0.5em 0'
		},
		// Link styling
		'.cm-url': {
			textDecoration: 'underline',
			opacity: '0.8'
		},
		// Task list styling
		'.cm-task-list': {
			color: '#4CAF50'
		}
	});

	const extensions: Extension[] = [
		baseTheme,
		syntaxHighlighting(markdownHighlighting),
		EditorView.lineWrapping,
		markdown({
			codeLanguages: languages,
			addKeymap: true,
			completeHTMLTags: true,
			extensions: []
		}),
		keymap.of([indentWithTab, ...defaultKeymap]),
		EditorState.readOnly.of(readonly),
		EditorView.updateListener.of((update) => {
			if (update.docChanged) {
				dispatch('change', update.state.doc.toString());
			}
		})
	];

	onMount(() => {
		const state = EditorState.create({
			doc: value,
			extensions
		});

		view = new EditorView({
			state,
			parent: element
		});

		return () => {
			view.destroy();
		};
	});

	$: if (view && value !== view.state.doc.toString()) {
		view.dispatch({
			changes: {
				from: 0,
				to: view.state.doc.length,
				insert: value
			}
		});
	}
</script>

<div class="h-full w-full" bind:this={element} />

<style>
	:global(.cm-editor) {
		height: 100%;
	}

	:global(.cm-editor .cm-scroller) {
		overflow: auto;
		padding: 0;
	}

	:global(.cm-editor .cm-content) {
		white-space: pre-wrap;
		word-break: break-word;
		word-wrap: break-word;
		padding: 0;
	}

	:global(.cm-editor .cm-line:has(.cm-heading)) {
		margin-top: 1em;
		margin-bottom: 0.5em;
	}

	:global(.cm-editor .cm-line:has(.cm-quote)) {
		margin: 1em 0;
	}

	:global(.cm-editor .cm-line:has(.cm-fenced-code)) {
		margin: 1em 0;
	}
</style>
