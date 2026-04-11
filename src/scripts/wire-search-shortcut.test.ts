import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { wireSearchShortcut } from './wire-search-shortcut';

describe('wireSearchShortcut', () => {
	let keydownHandler: ((e: KeyboardEvent) => void) | undefined;

	const mockWindow = {
		addEventListener: vi.fn((type: string, fn: EventListener) => {
			if (type === 'keydown') keydownHandler = fn as (e: KeyboardEvent) => void;
		}),
		removeEventListener: vi.fn((type: string, fn: EventListener) => {
			if (type === 'keydown' && fn === keydownHandler)
				keydownHandler = undefined;
		}),
	};

	beforeEach(() => {
		keydownHandler = undefined;
		vi.stubGlobal(
			'window',
			mockWindow as unknown as Window & typeof globalThis,
		);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.clearAllMocks();
	});

	function dispatchShortcut(metaKey: boolean, ctrlKey: boolean): void {
		const preventDefault = vi.fn();
		keydownHandler?.({
			metaKey,
			ctrlKey,
			key: 'k',
			preventDefault,
		} as unknown as KeyboardEvent);
	}

	it('invokes focus on Ctrl+K', () => {
		const focus = vi.fn();
		wireSearchShortcut(focus);
		expect(mockWindow.addEventListener).toHaveBeenCalledWith(
			'keydown',
			expect.any(Function),
		);
		dispatchShortcut(false, true);
		expect(focus).toHaveBeenCalledTimes(1);
	});

	it('invokes focus on Meta+K', () => {
		const focus = vi.fn();
		wireSearchShortcut(focus);
		dispatchShortcut(true, false);
		expect(focus).toHaveBeenCalledTimes(1);
	});

	it('does not invoke focus after cleanup', () => {
		const focus = vi.fn();
		const cleanup = wireSearchShortcut(focus);
		cleanup();
		expect(mockWindow.removeEventListener).toHaveBeenCalledWith(
			'keydown',
			expect.any(Function),
		);
		dispatchShortcut(false, true);
		expect(focus).not.toHaveBeenCalled();
	});
});
