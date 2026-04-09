/**
 * Tooltip behavior for `.auto-xref` links (manual or build-time auto-xref).
 */

const SHOW_DELAY_MS = 200;

/** @type {HTMLElement | null} */
let tooltipEl = null;
/** @type {number | undefined} */
let showTimer = undefined;
/** @type {HTMLElement | null} */
let lastTrigger = null;

const prefersCoarse =
	typeof window !== 'undefined' &&
	window.matchMedia('(hover: none) and (pointer: coarse)').matches;

function getTooltip() {
	if (!tooltipEl) {
		tooltipEl = document.getElementById('auto-xref-tooltip');
	}
	return tooltipEl;
}

/**
 * @param {HTMLElement} trigger
 * @param {HTMLElement} tip
 */
function positionTooltip(trigger, tip) {
	const rect = trigger.getBoundingClientRect();
	/** Minimum inset from the viewport edge when clamping position. */
	const edgeMargin = 8;
	/** Space between the link and the tooltip (below or above). */
	const tooltipGap = 3;
	const tipRect = tip.getBoundingClientRect();
	let top = rect.bottom + tooltipGap;
	let left = rect.left + rect.width / 2 - tipRect.width / 2;
	left = Math.max(
		edgeMargin,
		Math.min(left, window.innerWidth - tipRect.width - edgeMargin),
	);
	if (top + tipRect.height > window.innerHeight - edgeMargin) {
		top = rect.top - tipRect.height - tooltipGap;
	}
	tip.style.left = `${left}px`;
	tip.style.top = `${top}px`;
}

/**
 * @param {HTMLElement} trigger
 */
function showForTrigger(trigger) {
	const tip = getTooltip();
	if (!tip) return;

	const term = trigger.getAttribute('data-term') ?? '';
	const def = trigger.getAttribute('data-definition') ?? '';
	const kind = trigger.getAttribute('data-kind') ?? '';

	tip.textContent = '';
	const kindEl = document.createElement('span');
	kindEl.className = 'auto-xref-tooltip-kind';
	kindEl.textContent = kind;
	const titleEl = document.createElement('strong');
	titleEl.className = 'auto-xref-tooltip-title';
	titleEl.textContent = term;
	const bodyEl = document.createElement('span');
	bodyEl.className = 'auto-xref-tooltip-body';
	bodyEl.textContent = def;
	tip.append(kindEl, titleEl, bodyEl);

	tip.removeAttribute('hidden');
	tip.style.display = 'block';

	const id = 'auto-xref-tooltip';
	tip.id = id;
	trigger.setAttribute('aria-describedby', id);

	positionTooltip(trigger, tip);
	lastTrigger = trigger;
}

function hide() {
	const tip = getTooltip();
	if (tip) {
		tip.setAttribute('hidden', '');
		tip.style.display = '';
	}
	if (lastTrigger) {
		const d = lastTrigger.getAttribute('aria-describedby');
		if (d === 'auto-xref-tooltip') {
			lastTrigger.removeAttribute('aria-describedby');
		}
		lastTrigger = null;
	}
}

/**
 * @param {HTMLElement} trigger
 */
function scheduleShow(trigger) {
	clearTimeout(showTimer);
	showTimer = window.setTimeout(() => {
		showForTrigger(trigger);
	}, SHOW_DELAY_MS);
}

function cancelShow() {
	clearTimeout(showTimer);
}

/**
 * @param {HTMLElement} el
 */
function isAutoXref(el) {
	return el.matches?.('a.auto-xref') ?? false;
}

document.addEventListener(
	'focusin',
	(e) => {
		const t = e.target;
		if (t instanceof HTMLElement && isAutoXref(t)) {
			scheduleShow(t);
		}
	},
	true,
);

document.addEventListener(
	'focusout',
	() => {
		cancelShow();
		hide();
	},
	true,
);

document.addEventListener(
	'click',
	(e) => {
		if (!prefersCoarse) return;
		const t = e.target;
		if (!(t instanceof Element)) return;
		const link = t.closest?.('a.auto-xref');
		if (!link) return;
		if (link.dataset.autoXrefArmed === '1') {
			delete link.dataset.autoXrefArmed;
			hide();
			return;
		}
		e.preventDefault();
		link.dataset.autoXrefArmed = '1';
		cancelShow();
		showForTrigger(/** @type {HTMLElement} */ (link));
	},
	true,
);

document.addEventListener('keydown', (e) => {
	if (e.key === 'Escape') {
		cancelShow();
		hide();
		document
			.querySelectorAll('a.auto-xref[data-auto-xref-armed]')
			.forEach((a) => {
				a.removeAttribute('data-auto-xref-armed');
			});
	}
});

document.addEventListener(
	'pointerover',
	(e) => {
		if (prefersCoarse) return;
		const t = e.target;
		if (!(t instanceof Element)) return;
		const link = t.closest?.('a.auto-xref');
		if (!link) return;
		scheduleShow(/** @type {HTMLElement} */ (link));
	},
	true,
);

document.addEventListener(
	'pointerout',
	(e) => {
		if (prefersCoarse) return;
		const t = e.target;
		if (!(t instanceof Element)) return;
		const link = t.closest?.('a.auto-xref');
		if (!link) return;
		const rel = e.relatedTarget;
		if (rel instanceof Node && link.contains(rel)) return;
		cancelShow();
		hide();
	},
	true,
);

window.addEventListener(
	'scroll',
	() => {
		if (lastTrigger) {
			const tip = getTooltip();
			if (tip && !tip.hasAttribute('hidden')) {
				positionTooltip(lastTrigger, tip);
			}
		}
	},
	{ passive: true },
);

window.addEventListener('resize', () => {
	if (lastTrigger) {
		const tip = getTooltip();
		if (tip && !tip.hasAttribute('hidden')) {
			positionTooltip(lastTrigger, tip);
		}
	}
});
