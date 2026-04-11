import { initOramaQuickSearch } from './orama-search-ui';
import { bindSearchPaletteShortcut } from './search-keyboard-shortcut';

const MOBILE_PANEL_ENTER = 'animate-ss-mobile-panel-enter';
const MOBILE_PANEL_LEAVE = 'animate-ss-mobile-panel-leave';

class SiteSearch extends HTMLElement {
	private onDocClick = (e: MouseEvent) => {
		if (!this.mobilePanel || this.mobilePanel.hidden) return;
		if (this.contains(e.target as Node)) return;
		this.closeMobile();
	};

	private unbindShortcut: (() => void) | undefined;

	private mobileToggle: HTMLButtonElement | null = null;
	private mobilePanel: HTMLElement | null = null;
	private mobileInput: HTMLInputElement | null = null;
	private desktopInput: HTMLInputElement | null = null;

	constructor() {
		super();
		this.mobileToggle = this.querySelector('.ss-mobile-toggle');
		this.mobilePanel = this.querySelector('#ss-mobile-search-panel');
		this.mobileInput = this.querySelector('#ss-mobile-q');
		this.desktopInput = this.querySelector('#ss-desktop-q');
		this.syncQueryFromUrl();

		this.mobileToggle?.addEventListener('click', () => {
			const open = this.mobileToggle?.getAttribute('aria-expanded') === 'true';
			if (open) this.closeMobile();
			else this.openMobile();
		});

		this.unbindShortcut = bindSearchPaletteShortcut(() => {
			this.focusSearch();
		});

		this.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && this.mobilePanel && !this.mobilePanel.hidden) {
				e.stopPropagation();
				this.closeMobile();
			}
		});
	}

	connectedCallback() {
		document.addEventListener('click', this.onDocClick, true);

		const mobileInput = this.querySelector<HTMLInputElement>('#ss-mobile-q');
		const mobilePanel = this.querySelector<HTMLElement>(
			'#ss-mobile-quick-results',
		);
		const desktopInput = this.querySelector<HTMLInputElement>('#ss-desktop-q');
		const desktopPanel = this.querySelector<HTMLElement>(
			'#ss-desktop-quick-results',
		);
		if (mobileInput && mobilePanel) {
			initOramaQuickSearch({ input: mobileInput, panel: mobilePanel });
		}
		if (desktopInput && desktopPanel) {
			initOramaQuickSearch({ input: desktopInput, panel: desktopPanel });
		}
	}

	disconnectedCallback() {
		document.removeEventListener('click', this.onDocClick, true);
		this.unbindShortcut?.();
		this.unbindShortcut = undefined;
	}

	private isWide(): boolean {
		return window.matchMedia('(min-width: 50rem)').matches;
	}

	private prefersReducedMotion(): boolean {
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}

	private clearMobileToggleMotionStyles(): void {
		if (!this.mobileToggle) return;
		this.mobileToggle.style.transition = '';
		this.mobileToggle.style.transform = '';
	}

	private runMobileToggleOpenFlip(first: DOMRect): void {
		const btn = this.mobileToggle!;
		requestAnimationFrame(() => {
			const last = btn.getBoundingClientRect();
			const dx = first.left - last.left;
			const dy = first.top - last.top;
			if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
				return;
			}
			btn.style.transition = 'none';
			btn.style.transform = `translate(${dx}px, ${dy}px)`;
			requestAnimationFrame(() => {
				btn.style.transition = 'transform 0.25s ease';
				btn.style.transform = '';
				const done = (e: TransitionEvent): void => {
					if (e.propertyName !== 'transform') return;
					btn.removeEventListener('transitionend', done);
					this.clearMobileToggleMotionStyles();
				};
				btn.addEventListener('transitionend', done);
			});
		});
	}

	private runMobileToggleCloseFlip(first: DOMRect): void {
		const btn = this.mobileToggle!;
		requestAnimationFrame(() => {
			const last = btn.getBoundingClientRect();
			const dx = first.left - last.left;
			const dy = first.top - last.top;
			if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
				this.clearMobileToggleMotionStyles();
				return;
			}
			btn.style.transition = 'none';
			btn.style.transform = `translate(${dx}px, ${dy}px)`;
			requestAnimationFrame(() => {
				btn.style.transition = 'transform 0.25s ease';
				btn.style.transform = '';
				btn.addEventListener(
					'transitionend',
					(e: TransitionEvent) => {
						if (e.propertyName !== 'transform') return;
						this.clearMobileToggleMotionStyles();
					},
					{ once: true },
				);
			});
		});
	}

	private openMobile(): void {
		if (!this.mobilePanel || !this.mobileToggle) return;

		const first = this.mobileToggle.getBoundingClientRect();

		this.mobilePanel.classList.remove(
			MOBILE_PANEL_LEAVE,
			'pointer-events-none',
		);
		this.setAttribute('data-mobile-search-open', 'true');
		this.mobilePanel.hidden = false;
		this.mobileToggle.setAttribute('aria-expanded', 'true');

		if (!this.prefersReducedMotion()) {
			this.mobilePanel.classList.add(MOBILE_PANEL_ENTER);
			const onEnterEnd = (e: AnimationEvent): void => {
				if (e.target !== this.mobilePanel) return;
				if (e.animationName !== 'ss-mobile-panel-enter') return;
				this.mobilePanel?.classList.remove(MOBILE_PANEL_ENTER);
				this.mobilePanel?.removeEventListener('animationend', onEnterEnd);
			};
			this.mobilePanel.addEventListener('animationend', onEnterEnd);
		}

		if (this.prefersReducedMotion()) {
			queueMicrotask(() => this.mobileInput?.focus());
			return;
		}

		queueMicrotask(() => this.mobileInput?.focus());
		this.runMobileToggleOpenFlip(first);
	}

	private closeMobile(): void {
		if (!this.mobilePanel || !this.mobileToggle) return;

		if (this.mobilePanel.hidden) {
			this.setAttribute('data-mobile-search-open', 'false');
			return;
		}

		if (this.mobilePanel.classList.contains(MOBILE_PANEL_LEAVE)) {
			return;
		}

		const first = this.mobileToggle.getBoundingClientRect();

		if (this.prefersReducedMotion()) {
			this.setAttribute('data-mobile-search-open', 'false');
			this.mobilePanel.hidden = true;
			this.mobileToggle.setAttribute('aria-expanded', 'false');
			this.mobilePanel.classList.remove(
				MOBILE_PANEL_ENTER,
				MOBILE_PANEL_LEAVE,
				'pointer-events-none',
			);
			return;
		}

		this.mobileInput?.blur();
		this.mobilePanel.classList.remove(MOBILE_PANEL_ENTER);
		this.mobilePanel.classList.add(MOBILE_PANEL_LEAVE, 'pointer-events-none');

		let leaveFinished = false;
		const finishClose = (): void => {
			if (leaveFinished || !this.mobilePanel || !this.mobileToggle) return;
			leaveFinished = true;
			this.mobilePanel.classList.remove(
				MOBILE_PANEL_LEAVE,
				'pointer-events-none',
			);
			this.setAttribute('data-mobile-search-open', 'false');
			this.mobilePanel.hidden = true;
			this.mobileToggle.setAttribute('aria-expanded', 'false');
			this.runMobileToggleCloseFlip(first);
		};

		const onLeaveEnd = (e: AnimationEvent): void => {
			if (e.target !== this.mobilePanel) return;
			if (e.animationName !== 'ss-mobile-panel-leave') return;
			this.mobilePanel?.removeEventListener('animationend', onLeaveEnd);
			finishClose();
		};
		this.mobilePanel.addEventListener('animationend', onLeaveEnd);

		window.setTimeout(() => {
			if (
				leaveFinished ||
				!this.mobilePanel?.classList.contains(MOBILE_PANEL_LEAVE)
			) {
				return;
			}
			this.mobilePanel.removeEventListener('animationend', onLeaveEnd);
			finishClose();
		}, 400);
	}

	private focusSearch() {
		if (this.isWide()) {
			this.desktopInput?.focus();
			return;
		}
		if (this.mobilePanel?.hidden) this.openMobile();
		else this.mobileInput?.focus();
	}

	private syncQueryFromUrl() {
		const query = new URLSearchParams(window.location.search).get('q')?.trim();
		if (!query) return;
		if (this.desktopInput) this.desktopInput.value = query;
		if (this.mobileInput) this.mobileInput.value = query;
	}
}

customElements.define('site-search', SiteSearch);
