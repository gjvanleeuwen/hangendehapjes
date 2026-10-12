// What to do next with a deal, decided from its state. The list shows this as
// one button per row so the daily work happens there, without opening a deal.
// Pure: no DB, no Svelte.
import { formatDateNL } from '$lib/admin/calc';
import { isPending, needsReason, totalHours, type Deal } from '$lib/deals';
import {
	daysBetween,
	dealPaths,
	detailHref,
	followUpStep,
	portalLinkState,
	portalSetupHref
} from './shared';

/** Post a small form to an action on the current page, or follow a link. */
export type Act =
	| { type: 'post'; action: string; fields: Record<string, string> }
	| { type: 'link'; href: string };

export type NextAction = {
	key: string; // also the attention-chip key it replaces, so the chip isn't shown twice
	label: string; // button text
	todo: string; // what to do, for the "Nu doen" summary ("herinneren", "factuur maken")
	hint: string; // one short line under the button
	due: boolean; // true = belongs in "Nu doen"; styles the button as primary
	tone: 'primary' | 'amber' | 'red';
	act: Act;
	secondary?: { label: string; act: Act };
};

const post = (action: string, fields: Record<string, string>): Act => ({
	type: 'post',
	action,
	fields
});

/** Same order as the dropdown would make you think in: answer, chase, deliver, invoice, get paid. */
export function nextAction(d: Deal, today: string): NextAction | null {
	const link = portalLinkState(d, today);
	const id = { id: d.id };

	if (d.status === 'nieuw') {
		const age = daysBetween(d.createdAt.slice(0, 10), today);
		return {
			key: 'reactie',
			label: 'Offerte maken',
			todo: 'offerte maken',
			hint: age <= 0 ? 'Vandaag binnen' : `${age} dag${age === 1 ? '' : 'en'} geleden binnen`,
			due: true,
			tone: age >= 2 ? 'red' : 'primary',
			act: { type: 'link', href: dealPaths(d.id).calculator },
			secondary: {
				label: 'Offerte verstuurd',
				act: post('?/update', { ...id, status: 'offerte_verstuurd' })
			}
		};
	}

	if (isPending(d)) {
		// Signed in the portal but the status was never moved on.
		if (d.acceptedTermsAt) {
			return {
				key: 'akkoord',
				label: 'Akkoord verwerken',
				todo: 'akkoord verwerken',
				hint: `Digitaal akkoord op ${formatDateNL(d.acceptedTermsAt)}`,
				due: true,
				tone: 'primary',
				act: post('?/update', { ...id, status: 'geaccepteerd' })
			};
		}
		if (link === 'expired') {
			return {
				key: 'portaal',
				label: 'Link verlengen',
				todo: 'link verlengen',
				hint: 'Klantlink is verlopen',
				due: true,
				tone: 'red',
				act: post('?/extendAcceptance', { ...id, days: '14' })
			};
		}
		const step = followUpStep(d);
		if (step) {
			const due = step.due <= today;
			if (step.key === 'afsluiten') {
				return {
					key: 'opvolgen',
					label: 'Afsluiten',
					todo: 'afsluiten',
					hint: '2× herinnerd en gebeld',
					due: true,
					tone: 'red',
					act: post('?/update', { ...id, status: 'afgewezen', lostReason: 'geen_reactie' })
				};
			}
			return {
				key: 'opvolgen',
				label: step.key === 'bellen' ? 'Gebeld' : 'Herinnerd',
				todo: step.key === 'bellen' ? 'bellen' : 'herinneren',
				hint: due ? `${step.label} staat klaar` : `${step.label} vanaf ${formatDateNL(step.due)}`,
				due,
				tone: due ? (step.key === 'herinnering1' ? 'amber' : 'red') : 'primary',
				act: post('?/logFollowUp', id),
				secondary: { label: 'Akkoord', act: post('?/update', { ...id, status: 'geaccepteerd' }) }
			};
		}
	}

	if (d.status === 'geaccepteerd') {
		if (d.eventDate && d.eventDate < today) {
			return {
				key: 'geleverd',
				label: 'Geleverd',
				todo: 'geleverd afvinken',
				hint: `Event was ${formatDateNL(d.eventDate)}`,
				due: true,
				tone: 'amber',
				act: post('?/update', { ...id, status: 'geleverd' })
			};
		}
		if (!d.acceptanceToken) {
			return {
				key: 'portaal',
				label: 'Portaal instellen',
				todo: 'portaal instellen',
				hint: 'Nog geen klantlink',
				due: true,
				tone: 'primary',
				act: { type: 'link', href: portalSetupHref(d.id) }
			};
		}
		if (link === 'expired') {
			return {
				key: 'portaal',
				label: 'Link verlengen',
				todo: 'link verlengen',
				hint: 'Klantlink is verlopen',
				due: true,
				tone: 'amber',
				act: post('?/extendAcceptance', { ...id, days: '30' })
			};
		}
		const until = d.eventDate ? daysBetween(today, d.eventDate) : null;
		return {
			key: 'event',
			label: 'Event sheet',
			todo: 'event voorbereiden',
			hint:
				until == null
					? 'Datum nog onbekend'
					: until === 0
						? 'Vandaag!'
						: `Over ${until} dag${until === 1 ? '' : 'en'}`,
			due: until != null && until <= 7,
			tone: 'primary',
			act: { type: 'link', href: dealPaths(d.id).eventSheet }
		};
	}

	if (d.status === 'geleverd') {
		return {
			key: 'factuur',
			label: 'Factuur maken',
			todo: 'factuur maken',
			hint: 'Event is geweest',
			due: true,
			tone: 'amber',
			act: { type: 'link', href: dealPaths(d.id).factuur },
			secondary: {
				label: 'Factuur verstuurd',
				act: post('?/update', { ...id, status: 'factuur_verstuurd' })
			}
		};
	}

	if (d.status === 'factuur_verstuurd') {
		const age = d.factuurVerstuurdOp ? daysBetween(d.factuurVerstuurdOp, today) : 0;
		return {
			key: 'betaald',
			label: 'Betaald',
			todo: 'betaling checken',
			hint: d.factuurVerstuurdOp
				? `Factuur ${age} dag${age === 1 ? '' : 'en'} uit`
				: 'Factuur verstuurd',
			due: age > 14,
			tone: age > 14 ? 'red' : 'primary',
			act: post('?/update', { ...id, status: 'afgerond', finalPaymentStatus: 'paid' })
		};
	}

	if (d.status === 'afgerond' && (d.costs == null || totalHours(d) === 0)) {
		return {
			key: 'kosten',
			label: 'Kosten & uren',
			todo: 'kosten invullen',
			hint: 'Nog niet ingevuld',
			due: true,
			tone: 'amber',
			act: { type: 'link', href: detailHref(d.id, 'uren') }
		};
	}

	if (needsReason(d)) {
		// The reason select in the Fase column is the action; flag it here too.
		return {
			key: 'reden',
			label: 'Reden invullen',
			todo: 'reden invullen',
			hint: 'Waarom afgewezen?',
			due: true,
			tone: 'amber',
			act: { type: 'link', href: detailHref(d.id, 'pijplijn') }
		};
	}

	return null;
}

/** One-line tally for the "Nu doen" filter, e.g. "3× herinneren · 1× factuur". */
export function todoSummary(actions: NextAction[], leads: number): string {
	const counts = new Map<string, number>();
	for (const a of actions) counts.set(a.todo, (counts.get(a.todo) ?? 0) + 1);
	const parts = [...counts.entries()].map(([todo, n]) => `${n}× ${todo}`);
	if (leads > 0) parts.unshift(`${leads}× half ingevuld`);
	return parts.join(' · ');
}
