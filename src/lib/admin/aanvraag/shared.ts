// Pure helpers shared by the aanvragen list, the detail page and its tabs.
// No DB access, no Svelte: safe to import from anywhere.
import type { SubmitFunction } from '@sveltejs/kit';
import { formatDateNL } from '$lib/admin/calc';
import {
	FOLLOW_UP_DAYS,
	isPending,
	isWon,
	needsReason,
	totalHours,
	STATUS_LABELS,
	type Deal
} from '$lib/deals';

// Native <select>, styled like the shadcn Input. Native on purpose: the iOS
// picker is what makes filing from a phone quick.
export const selectClass =
	'border-input bg-background h-8 w-full min-w-0 rounded-lg border px-2 text-sm shadow-xs';

// Where a warning or link points: a card on the overzicht (anchor) or a
// sub-page of the aanvraag.
export type Tab = 'pijplijn' | 'contact' | 'portaal' | 'event' | 'uren';

export const portalSetupHref = (id: string) => `/admin/aanvragen/${id}/portaal`;

export const detailHref = (id: string, tab?: Tab) => {
	const base = `/admin/aanvragen/${id}`;
	if (tab === 'portaal') return `${base}/portaal`;
	if (tab === 'event') return `${base}/event-sheet`;
	return tab ? `${base}#${tab}` : base;
};

/** The aanvraag sub-pages, also used by next-action links. */
export const dealPaths = (id: string) => ({
	calculator: `/admin/aanvragen/${id}/calculator`,
	offerte: `/admin/aanvragen/${id}/document?kind=offerte`,
	factuur: `/admin/aanvragen/${id}/document?kind=factuur`,
	eventSheet: `/admin/aanvragen/${id}/event-sheet`
});

export const serviceLabel = (d: Pick<Deal, 'serviceType'>) =>
	d.serviceType === 'taart'
		? 'Taart'
		: d.serviceType === 'hapjes'
			? 'Hapjes'
			: d.serviceType === 'anders'
				? 'Anders'
				: d.serviceType;

export const eventDisplay = (d: Pick<Deal, 'eventDate' | 'eventDateText'>) =>
	d.eventDate ? formatDateNL(d.eventDate) : d.eventDateText || '';

export const dateInputValue = (iso: string | null) => (iso ? iso.slice(0, 10) : '');

export const dealRank = (d: Deal) => {
	if (isWon(d) || d.acceptedTermsAt) return 0;
	if (d.status === 'in_optie') return 1;
	if (isPending(d)) return 2;
	if (d.status === 'nieuw') return 3;
	if (d.status === 'afgewezen_intern') return 4;
	if (d.status === 'afgewezen') return 5;
	return 6;
};

const dateKey = (d: Deal) => d.eventDate ?? d.geldigTot ?? d.createdAt.slice(0, 10);

/** Won first, then opties, offertes out, nieuw, lost. Upcoming events soonest first. */
export const sortDeals = (deals: Deal[]) =>
	[...deals].sort((a, b) => {
		const rank = dealRank(a) - dealRank(b);
		if (rank) return rank;
		const aDate = dateKey(a);
		const bDate = dateKey(b);
		if (aDate !== bDate) {
			return dealRank(a) <= 2 ? aDate.localeCompare(bDate) : bDate.localeCompare(aDate);
		}
		return b.updatedAt.localeCompare(a.updatedAt);
	});

// 'half' = half-finished contact forms (step 1 only). They aren't deals yet, so
// matchesFilter never matches them; the list adds them itself for 'half',
// 'open' and 'all'.
// 'todo' = everything with a next step due today (see next-action.ts); the
// list page decides that, matchesFilter doesn't know about it.
export type ListFilter = 'todo' | 'half' | 'open' | 'won' | 'lost' | 'all';

export const LIST_FILTERS: { key: ListFilter; label: string }[] = [
	{ key: 'todo', label: 'Nu doen' },
	{ key: 'half', label: 'Half ingevuld' },
	{ key: 'open', label: 'Open' },
	{ key: 'won', label: 'Gewonnen' },
	{ key: 'lost', label: 'Verloren' },
	{ key: 'all', label: 'Alles' }
];

export const showsLeads = (filter: ListFilter) =>
	filter === 'todo' || filter === 'half' || filter === 'open' || filter === 'all';

export const isListFilter = (v: string | null): v is ListFilter =>
	LIST_FILTERS.some((f) => f.key === v);

export const matchesFilter = (d: Deal, filter: ListFilter) => {
	switch (filter) {
		case 'half':
		case 'todo':
			return false;
		case 'open':
			return d.status === 'nieuw' || isPending(d);
		case 'won':
			return isWon(d);
		case 'lost':
			return d.status === 'afgewezen' || d.status === 'afgewezen_intern';
		default:
			return true;
	}
};

export const rowClass = (d: Deal) => {
	if (isWon(d) || d.acceptedTermsAt) return 'bg-primary/5';
	if (d.status === 'in_optie') return 'bg-amber-50/70';
	if (d.status === 'afgewezen' || d.status === 'afgewezen_intern') return 'opacity-60';
	return '';
};

export const stateBadge = (d: Deal) => {
	// After the event the progress matters more than how they signed.
	if (d.status === 'afgerond') return { label: 'Betaald', className: 'bg-primary/10 text-primary' };
	if (d.status === 'factuur_verstuurd')
		return { label: 'Factuur uit', className: 'bg-primary/10 text-primary' };
	if (d.status === 'geleverd')
		return { label: 'Geleverd', className: 'bg-primary/10 text-primary' };
	if (d.acceptedTermsAt)
		return { label: 'Akkoord digitaal', className: 'bg-primary/10 text-primary' };
	if (isWon(d)) return { label: 'Geboekt', className: 'bg-primary/10 text-primary' };
	if (d.status === 'in_optie')
		return { label: 'In optie', className: 'bg-amber-100 text-amber-800' };
	if (d.status === 'offerte_verstuurd')
		return { label: 'Offerte uit', className: 'bg-amber-100 text-amber-800' };
	if (d.status === 'nieuw') return { label: 'Nieuw', className: 'bg-muted text-foreground' };
	return { label: STATUS_LABELS[d.status], className: 'bg-muted text-muted-foreground' };
};

export const daysBetween = (from: string, to: string) =>
	Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);

const plusDays = (iso: string, days: number) => {
	const d = new Date(`${iso}T00:00:00Z`);
	d.setUTCDate(d.getUTCDate() + days);
	return d.toISOString().slice(0, 10);
};

/** Last day the klantlink works (YYYY-MM-DD), or '' when it never expires. */
export const portalExpiryDate = (d: Deal) => d.acceptanceExpiresAt?.slice(0, 10) ?? '';

/**
 * Where the klantlink stands. 'expired' and 'soon' only matter while the
 * client still has to sign: after the akkoord the link is a portal for the
 * practical questions and payments, and a lapsed one is worth a nudge too.
 */
export type PortalLinkState = 'none' | 'accepted' | 'off' | 'expired' | 'soon' | 'active';

export const portalLinkState = (d: Deal, today: string): PortalLinkState => {
	if (!d.acceptanceToken) return 'none';
	const expiry = portalExpiryDate(d);
	if (expiry && expiry < today) return 'expired';
	if (!d.acceptanceEnabled) return 'off';
	if (d.acceptedTermsAt) return 'accepted';
	if (expiry && daysBetween(today, expiry) <= 3) return 'soon';
	return 'active';
};

/** Colour per stage for the status pill in the list. */
export const statusPillClass = (d: Pick<Deal, 'status'>) => {
	switch (d.status) {
		case 'nieuw':
			return 'border-sky-300 bg-sky-50 text-sky-900';
		case 'offerte_verstuurd':
		case 'in_optie':
			return 'border-amber-300 bg-amber-50 text-amber-900';
		case 'geaccepteerd':
		case 'geleverd':
		case 'factuur_verstuurd':
			return 'border-emerald-300 bg-emerald-50 text-emerald-900';
		case 'afgerond':
			return 'border-emerald-600 bg-emerald-600 text-white';
		default:
			return 'border-border bg-muted text-muted-foreground';
	}
};

/** Short portal state for the list. */
export const portalState = (
	d: Deal,
	today: string
): { label: string; className: string } | null => {
	const state = portalLinkState(d, today);
	switch (state) {
		case 'none':
			return null;
		case 'accepted':
			return { label: 'Akkoord', className: 'font-medium text-emerald-700' };
		case 'expired':
			return { label: 'Verlopen', className: 'font-medium text-destructive' };
		case 'soon':
			return { label: 'Verloopt bijna', className: 'font-medium text-amber-700' };
		case 'off':
			return { label: 'Uit', className: 'text-muted-foreground' };
		default:
			return { label: 'Actief', className: 'text-amber-700' };
	}
};

export type FollowUpStep = {
	key: 'herinnering1' | 'herinnering2' | 'bellen' | 'afsluiten';
	label: string; // what to do next
	due: string; // YYYY-MM-DD from when it's due
	done: number; // reminders + call already logged (0..3)
};

/**
 * The chase on an open offerte: two reminders, then a call to close it out.
 * Each step is due FOLLOW_UP_DAYS after the previous one. Null when the deal
 * isn't waiting on the client.
 */
export const followUpStep = (d: Deal): FollowUpStep | null => {
	// Signed in the portal: nothing left to chase.
	if (!isPending(d) || d.acceptedTermsAt) return null;
	const sent = d.offerteVerstuurdOp ?? d.createdAt.slice(0, 10);
	if (!d.herinnering1Op)
		return {
			key: 'herinnering1',
			label: 'Herinnering 1',
			due: plusDays(sent, FOLLOW_UP_DAYS),
			done: 0
		};
	if (!d.herinnering2Op)
		return {
			key: 'herinnering2',
			label: 'Herinnering 2',
			due: plusDays(d.herinnering1Op, FOLLOW_UP_DAYS),
			done: 1
		};
	if (!d.gebeldOp)
		return {
			key: 'bellen',
			label: 'Bellen',
			due: plusDays(d.herinnering2Op, FOLLOW_UP_DAYS),
			done: 2
		};
	return { key: 'afsluiten', label: 'Afsluiten', due: d.gebeldOp, done: 3 };
};

// Colour the "geldig tot" date for offertes/opties still awaiting a reply, so
// chasing is readable straight from the table.
export const geldigClass = (d: Deal, today: string, soon: string) => {
	if (!d.geldigTot || !isPending(d)) return '';
	if (d.geldigTot < today) return 'text-destructive font-medium';
	if (d.geldigTot <= soon) return 'font-medium text-amber-600';
	return '';
};

export type Chip = {
	key: string;
	label: string;
	tone: 'amber' | 'red';
	tab: Tab;
	title: string;
};

/**
 * The "let op" chips: the fields the funnel report needs and that tend to stay
 * empty. Each links to the tab where you fix it. At most three per deal.
 */
export const attentionChips = (d: Deal, today: string, soon: string): Chip[] => {
	const chips: Chip[] = [];
	if (needsReason(d)) {
		chips.push({
			key: 'reden',
			label: 'reden?',
			tone: 'amber',
			tab: 'pijplijn',
			title: 'Afgewezen zonder reden'
		});
	}
	// The chase comes first: it's the thing to do today.
	const step = followUpStep(d);
	if (step && step.due <= today) {
		chips.push({
			key: 'opvolgen',
			label:
				step.key === 'bellen'
					? 'bellen'
					: step.key === 'afsluiten'
						? 'afsluiten?'
						: `herinner ${step.done + 1}`,
			tone: step.key === 'herinnering1' ? 'amber' : 'red',
			tab: 'pijplijn',
			title:
				step.key === 'afsluiten'
					? 'Twee keer herinnerd en gebeld: zet hem op afgewezen (geen reactie) of in optie'
					: `${step.label} stond gepland voor ${formatDateNL(step.due)}`
		});
	}
	const link = portalLinkState(d, today);
	if ((link === 'expired' || link === 'soon') && (isPending(d) || isWon(d))) {
		chips.push({
			key: 'portaal',
			label: link === 'expired' ? 'link verlopen' : 'link verloopt',
			tone: link === 'expired' ? 'red' : 'amber',
			tab: 'portaal',
			title: `Klantlink geldig t/m ${formatDateNL(portalExpiryDate(d))}`
		});
	}
	if (d.status !== 'nieuw' && !d.firstReplyOn) {
		chips.push({
			key: 'reactie',
			label: 'reactie?',
			tone: 'amber',
			tab: 'pijplijn',
			title: 'Datum eerste reactie ontbreekt'
		});
	}
	if (d.geldigTot && isPending(d) && d.geldigTot <= soon) {
		const expired = d.geldigTot < today;
		chips.push({
			key: 'verloopt',
			label: expired ? 'verlopen' : 'verloopt',
			tone: expired ? 'red' : 'amber',
			tab: 'pijplijn',
			title: `Geldig tot ${formatDateNL(d.geldigTot)}`
		});
	}
	// After-sales: nobody tells the admin the event happened or the money came
	// in, so nudge from the dates we do know.
	if (d.status === 'geaccepteerd' && d.eventDate && d.eventDate < today) {
		chips.push({
			key: 'geleverd',
			label: 'geleverd?',
			tone: 'amber',
			tab: 'pijplijn',
			title: `Event was ${formatDateNL(d.eventDate)}: zet de status op Geleverd`
		});
	}
	if (d.status === 'geleverd') {
		chips.push({
			key: 'factuur',
			label: 'factuur?',
			tone: 'amber',
			tab: 'pijplijn',
			title: 'Geleverd, factuur nog niet verstuurd'
		});
	}
	if (
		d.status === 'factuur_verstuurd' &&
		d.factuurVerstuurdOp &&
		daysBetween(d.factuurVerstuurdOp, today) > 14
	) {
		chips.push({
			key: 'betaald',
			label: 'betaald?',
			tone: 'red',
			tab: 'pijplijn',
			title: `Factuur verstuurd op ${formatDateNL(d.factuurVerstuurdOp)}, nog niet betaald`
		});
	}
	if (isWon(d) && (d.costs == null || totalHours(d) === 0)) {
		chips.push({
			key: 'kosten',
			label: 'kosten?',
			tone: 'amber',
			tab: 'uren',
			title: 'Gewonnen, maar kosten of uren nog niet ingevuld'
		});
	}
	return chips.slice(0, 3);
};

export const chipClass = (tone: Chip['tone']) =>
	tone === 'red'
		? 'border-destructive/40 bg-destructive/10 text-destructive'
		: 'border-amber-300 bg-amber-50 text-amber-800';

/** Auto-submit a quick form when its select changes. */
export const submitOnChange = (e: Event) => {
	(e.currentTarget as HTMLSelectElement).form?.requestSubmit();
};

/**
 * `use:enhance` callback that keeps the typed values after a save instead of
 * resetting the form to its initial attributes. The refreshed `data` then
 * confirms what was stored. Used by every form in the admin.
 */
export const keepValues: SubmitFunction = () => {
	return async ({ update }) => {
		await update({ reset: false });
	};
};
