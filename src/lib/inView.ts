import type { Action } from 'svelte/action';

type InViewParams = { event: string; data?: Record<string, unknown> };

/**
 * Fire a Umami event the first time `node` scrolls into view, then stop.
 *
 * This is passive scroll-depth tracking — deliberately distinct from the
 * `#anchor` "pageviews" Umami records, which only fire when someone *clicks* a
 * nav link. With this we can finally tell whether a visitor ever actually
 * scrolled far enough to see a section (e.g. reached the contact form), not
 * just whether they tapped a menu item.
 */
export const trackInView: Action<HTMLElement, InViewParams> = (node, params) => {
	let fired = false;
	let current = params;

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting && !fired) {
					fired = true;
					window.umami?.track(current.event, current.data);
					observer.disconnect();
				}
			}
		},
		{ threshold: 0.4 }
	);

	observer.observe(node);

	return {
		update(next) {
			current = next;
		},
		destroy() {
			observer.disconnect();
		}
	};
};
