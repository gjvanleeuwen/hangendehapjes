// Form-action handlers for the aanvragen admin, shared by the list route
// (/admin/aanvragen), the detail route (/admin/aanvragen/[id]), the create
// page (/admin/aanvragen/nieuw) and the portal setup page.
//
// Every handler takes the SvelteKit request event and returns what a form
// action would return, so a route wires one up as `actions = { update: updateDealAction }`.
// The business rules (partial updates, auto-stamps, signed-quote protection)
// live here and nowhere else.
import { fail } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { isDbConfigured } from '$lib/server/db';
import { dismissLead, getLead } from '$lib/server/leads';
import { sendMetaEvent } from '$lib/server/meta-capi';
import {
	createDeal,
	deleteDeal,
	deleteInvoice,
	deleteQuoteVersion,
	getDeal,
	setQuoteVisibility,
	toDateOrNull,
	updateDeal,
	DEAL_STATUSES,
	quoteDealFields,
	type Deal,
	type DealInput,
	type DealStatus
} from '$lib/server/deals';
import {
	activeQuoteOf,
	normalizeOpsQuestions,
	normalizePaymentTerm,
	KANS_LEVELS,
	ALL_REASONS,
	isValidReason,
	isWon,
	portalExpiryAfterEvent,
	PREPAYMENT_STATUSES,
	TIME_PHASES,
	type OpsQuestion
} from '$lib/deals';

type ActionEvent = Pick<RequestEvent, 'request'>;

export const todayStr = () => new Date().toISOString().slice(0, 10);

export const addDays = (iso: string, days: number) => {
	const d = new Date(`${iso}T00:00:00Z`);
	d.setUTCDate(d.getUTCDate() + days);
	return d.toISOString().slice(0, 10);
};

const str = (fd: FormData, key: string, max = 1000): string =>
	String(fd.get(key) ?? '')
		.trim()
		.slice(0, max);

const amountOrNull = (fd: FormData, key: string): number | null => {
	const raw = String(fd.get(key) ?? '')
		.replace(',', '.')
		.trim();
	if (!raw) return null;
	const n = Number(raw);
	return Number.isFinite(n) && n >= 0 ? n : null;
};

const optionalDateTime = (fd: FormData, key: string): string | null => {
	const value = str(fd, key, 25);
	if (!value) return null;
	const d = new Date(`${value}T23:59:59.999Z`);
	return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

/** Null for a value outside DEAL_STATUSES: a stale or forged form must not drag a won deal back to nieuw. */
const statusOf = (fd: FormData): DealStatus | null => {
	const s = String(fd.get('status') ?? 'nieuw');
	return (DEAL_STATUSES as readonly string[]).includes(s) ? (s as DealStatus) : null;
};

const paymentStatusOf = (fd: FormData, key: string): string => {
	const s = String(fd.get(key) ?? 'not_sent');
	return (PREPAYMENT_STATUSES as readonly string[]).includes(s) ? s : 'not_sent';
};

const makeToken = () => {
	const bytes = new Uint8Array(24);
	crypto.getRandomValues(bytes);
	return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
};

const hoursOrZero = (raw: string): number => {
	const n = Number(raw.replace(',', '.').trim());
	return Number.isFinite(n) && n > 0 ? n : 0;
};

// Read time_<phase> inputs from the uren form into a { phase: hours } object.
const parseTimeSpent = (fd: FormData): Record<string, number> => {
	const out: Record<string, number> = {};
	for (const p of TIME_PHASES) {
		const h = hoursOrZero(String(fd.get(`time_${p.key}`) ?? ''));
		if (h > 0) out[p.key] = h;
	}
	return out;
};

const cleanQuestionKey = (value: string): string =>
	value
		.trim()
		.replace(/[^a-zA-Z0-9_-]/g, '')
		.slice(0, 60);

const parseOpsQuestionsConfig = (fd: FormData): OpsQuestion[] => {
	const questions: OpsQuestion[] = [];
	const keys = fd.getAll('opsQuestionKey').map((v) => cleanQuestionKey(String(v)));

	for (const key of keys) {
		if (!key) continue;
		const label = str(fd, `opsQuestionLabel_${key}`, 240);
		if (!label) continue;
		questions.push({
			key,
			label,
			enabled: fd.get(`opsQuestionEnabled_${key}`) === 'yes'
		});
	}

	for (let i = 1; i <= 3; i += 1) {
		const label = str(fd, `opsQuestionNewLabel_${i}`, 240);
		if (!label) continue;
		questions.push({
			key: `custom_${Date.now()}_${i}`,
			label,
			enabled: true
		});
	}

	return normalizeOpsQuestions(questions);
};

/** Manual add + backfill of past aanvragen. Returns the new id so the create page can jump to it. */
export const createDealAction = async ({ request }: ActionEvent) => {
	if (!isDbConfigured()) return fail(503, { error: 'Geen database geconfigureerd.' });

	const fd = await request.formData();
	const name = str(fd, 'name', 100);
	if (!name) return fail(400, { error: 'Naam is verplicht.', form: 'create' });
	const status = statusOf(fd);
	if (!status) return fail(400, { error: 'Onbekende status.', form: 'create' });

	const input: DealInput = {
		name,
		email: str(fd, 'email', 254),
		phone: str(fd, 'phone', 30),
		source: str(fd, 'source', 200),
		attribution: str(fd, 'attribution', 200),
		eventDate: toDateOrNull(str(fd, 'eventDate', 25)),
		eventDateText: str(fd, 'eventDate', 25),
		location: str(fd, 'location', 200),
		guests: str(fd, 'guests', 10),
		serviceType: str(fd, 'serviceType', 20),
		choice: str(fd, 'choice', 120),
		status,
		paymentTerm: normalizePaymentTerm(fd.get('paymentTerm')),
		offerteAmount: amountOrNull(fd, 'offerteAmount'),
		btwAmount: amountOrNull(fd, 'btwAmount'),
		costs: amountOrNull(fd, 'costs'),
		offerteVerstuurdOp: toDateOrNull(str(fd, 'offerteVerstuurdOp', 25)),
		geldigTot: toDateOrNull(str(fd, 'geldigTot', 25)),
		geaccepteerdOp: toDateOrNull(str(fd, 'geaccepteerdOp', 25)),
		message: str(fd, 'message', 5000),
		notes: str(fd, 'notes', 5000),
		origin: 'manual'
	};

	// Backfill: stamp the real original date so funnel metrics land in the
	// right month. Empty → defaults to now().
	const createdDate = toDateOrNull(str(fd, 'createdAt', 25));
	if (createdDate) input.createdAt = `${createdDate}T12:00:00Z`;

	let id = '';
	try {
		const created = await createDeal(input);
		id = created?.id ?? '';
	} catch (err) {
		return fail(500, { error: `Opslaan mislukt: ${(err as Error).message}`, form: 'create' });
	}
	return { created: true, id };
};

/**
 * Partial update: a form only sends the fields it shows, and only those are
 * touched. The quick status select sends id+status (or id+lostReason); the
 * detail tabs each send their own slice.
 */
export const updateDealAction = async ({ request }: ActionEvent) => {
	if (!isDbConfigured()) return fail(503, { error: 'Geen database geconfigureerd.' });

	const fd = await request.formData();
	const id = str(fd, 'id', 64);
	if (!id) return fail(400, { error: 'id ontbreekt.' });

	const existing = await getDeal(id);
	if (!existing) return fail(404, { error: 'Aanvraag niet gevonden.' });

	const fields: Partial<DealInput> = {};
	if (fd.has('status')) {
		const status = statusOf(fd);
		if (!status) return fail(400, { error: 'Onbekende status.' });
		fields.status = status;
	}
	if (fd.has('name')) fields.name = str(fd, 'name', 100);
	if (fd.has('email')) fields.email = str(fd, 'email', 254);
	if (fd.has('phone')) fields.phone = str(fd, 'phone', 30);
	if (fd.has('source')) fields.source = str(fd, 'source', 200);
	if (fd.has('attribution')) fields.attribution = str(fd, 'attribution', 200);
	// Only the parsed date: the admin's date input cannot post free text, and
	// eventDateText holds what the customer wrote ("ergens in september"),
	// which must survive a save of this card.
	if (fd.has('eventDate')) fields.eventDate = toDateOrNull(str(fd, 'eventDate', 25));
	if (fd.has('location')) fields.location = str(fd, 'location', 200);
	if (fd.has('guests')) fields.guests = str(fd, 'guests', 10);
	if (fd.has('serviceType')) fields.serviceType = str(fd, 'serviceType', 20);
	if (fd.has('choice')) fields.choice = str(fd, 'choice', 120);
	if (fd.has('dagdeel')) fields.dagdeel = str(fd, 'dagdeel', 40);
	if (fd.has('servingTime')) fields.servingTime = str(fd, 'servingTime', 20);
	if (fd.has('offerteAmount')) fields.offerteAmount = amountOrNull(fd, 'offerteAmount');
	if (fd.has('btwAmount')) fields.btwAmount = amountOrNull(fd, 'btwAmount');
	if (fd.has('costs')) fields.costs = amountOrNull(fd, 'costs');
	// The uren form always submits the time inputs; the other forms do not.
	// Gate on the first phase field being present.
	if (fd.has(`time_${TIME_PHASES[0].key}`)) fields.timeSpent = parseTimeSpent(fd);
	if (fd.has('offerteVerstuurdOp'))
		fields.offerteVerstuurdOp = toDateOrNull(str(fd, 'offerteVerstuurdOp', 25));
	if (fd.has('geldigTot')) fields.geldigTot = toDateOrNull(str(fd, 'geldigTot', 25));
	if (fd.has('geaccepteerdOp')) fields.geaccepteerdOp = toDateOrNull(str(fd, 'geaccepteerdOp', 25));
	if (fd.has('firstReplyOn')) fields.firstReplyOn = toDateOrNull(str(fd, 'firstReplyOn', 25));
	if (fd.has('afgewezenOp')) fields.afgewezenOp = toDateOrNull(str(fd, 'afgewezenOp', 25));
	if (fd.has('factuurVerstuurdOp'))
		fields.factuurVerstuurdOp = toDateOrNull(str(fd, 'factuurVerstuurdOp', 25));
	if (fd.has('betaaldOp')) fields.betaaldOp = toDateOrNull(str(fd, 'betaaldOp', 25));
	if (fd.has('herinnering1Op')) fields.herinnering1Op = toDateOrNull(str(fd, 'herinnering1Op', 25));
	if (fd.has('herinnering2Op')) fields.herinnering2Op = toDateOrNull(str(fd, 'herinnering2Op', 25));
	if (fd.has('gebeldOp')) fields.gebeldOp = toDateOrNull(str(fd, 'gebeldOp', 25));
	if (fd.has('kans')) {
		const kans = str(fd, 'kans', 10);
		fields.kans = (KANS_LEVELS as readonly string[]).includes(kans) ? kans : '';
	}
	if (fd.has('lostReason')) {
		const reason = str(fd, 'lostReason', 40);
		fields.lostReason = ALL_REASONS.includes(reason) ? reason : '';
	}
	if (fd.has('paymentTerm')) fields.paymentTerm = normalizePaymentTerm(fd.get('paymentTerm'));
	if (fd.has('acceptanceEnabled'))
		fields.acceptanceEnabled = str(fd, 'acceptanceEnabled', 10) === 'true';
	if (fd.has('acceptanceExpiresAt'))
		fields.acceptanceExpiresAt = optionalDateTime(fd, 'acceptanceExpiresAt');
	if (fd.has('prepaymentAmount')) fields.depositAmount = amountOrNull(fd, 'prepaymentAmount');
	if (fd.has('prepaymentLink')) fields.depositLink = str(fd, 'prepaymentLink', 500);
	if (fd.has('prepaymentStatus')) fields.depositStatus = paymentStatusOf(fd, 'prepaymentStatus');
	if (fd.has('depositAmount')) fields.depositAmount = amountOrNull(fd, 'depositAmount');
	if (fd.has('depositLink')) fields.depositLink = str(fd, 'depositLink', 500);
	if (fd.has('depositStatus')) fields.depositStatus = paymentStatusOf(fd, 'depositStatus');
	if (fd.has('finalPaymentAmount'))
		fields.finalPaymentAmount = amountOrNull(fd, 'finalPaymentAmount');
	if (fd.has('finalPaymentLink')) fields.finalPaymentLink = str(fd, 'finalPaymentLink', 500);
	if (fd.has('finalPaymentStatus'))
		fields.finalPaymentStatus = paymentStatusOf(fd, 'finalPaymentStatus');
	if (fd.has('activeQuoteId')) {
		const activeQuoteId = str(fd, 'activeQuoteId', 80);
		fields.activeQuoteId = activeQuoteId;
		const activeQuote = existing.quoteVersions.find((q) => q.id === activeQuoteId);
		if (activeQuote) Object.assign(fields, quoteDealFields(activeQuote));
		// "Geen actieve offerte": the portal falls back to the per-version flag
		// when the id is empty, so clear that too or the choice is a no-op.
		else if (!activeQuoteId && existing.quoteVersions.some((q) => q.active)) {
			fields.quoteVersions = existing.quoteVersions.map((q) => ({ ...q, active: false }));
		}
	}
	if (fd.has('portalQuestionsEnabled'))
		fields.portalQuestionsEnabled = str(fd, 'portalQuestionsEnabled', 10) === 'true';
	if (fd.has('opsQuestionsConfig')) fields.opsQuestions = parseOpsQuestionsConfig(fd);
	if (fd.has('notes')) fields.notes = str(fd, 'notes', 5000);
	if (fd.has('portalNote')) fields.portalNote = str(fd, 'portalNote', 2000);

	// A status change has to come with the data that belongs to it (the same
	// fields the StatusChange popup asks for). Otherwise nothing is saved.
	if (fields.status && fields.status !== existing.status) {
		const missing = missingForStatus(fields.status, fields, existing);
		if (missing.length > 0) {
			return fail(400, { error: `Vul eerst in: ${missing.join(', ')}.` });
		}
	}

	// Convenience auto-stamps when advancing the pipeline and the date wasn't
	// part of this form (so we never overwrite a value the user just cleared).
	const today = todayStr();
	// Sending an offerte or putting a date in option both start the 14-day
	// hold window (offerte_verstuurd_op → geldig_tot). We handle freeing the
	// date manually via the "verloopt" chips in the list.
	if (
		(fields.status === 'offerte_verstuurd' || fields.status === 'in_optie') &&
		!fd.has('offerteVerstuurdOp') &&
		!existing.offerteVerstuurdOp
	) {
		fields.offerteVerstuurdOp = today;
		if (!existing.geldigTot) fields.geldigTot = addDays(today, 14);
	}
	if (fields.status === 'geaccepteerd' && !fd.has('geaccepteerdOp') && !existing.geaccepteerdOp) {
		fields.geaccepteerdOp = today;
	}
	if (fields.status === 'afgewezen' && !fd.has('afgewezenOp') && !existing.afgewezenOp) {
		fields.afgewezenOp = today;
	}
	// Switching between "afgewezen (klant)" and "(wij)" without picking a new
	// reason: drop the old one, it belongs to the other list.
	if (
		fields.status &&
		!fd.has('lostReason') &&
		existing.lostReason &&
		!isValidReason(fields.status, existing.lostReason)
	) {
		fields.lostReason = '';
	}
	if (
		fields.status === 'factuur_verstuurd' &&
		!fd.has('factuurVerstuurdOp') &&
		!existing.factuurVerstuurdOp
	) {
		fields.factuurVerstuurdOp = today;
	}
	// 'afgerond' is shown as "Betaald (afgerond)": the booking is fully paid.
	if (fields.status === 'afgerond' && !fd.has('betaaldOp') && !existing.betaaldOp) {
		fields.betaaldOp = today;
	}
	// Leaving 'nieuw' means we answered: stamp the first reply unless it is known.
	if (
		fields.status &&
		fields.status !== 'nieuw' &&
		existing.status === 'nieuw' &&
		!fd.has('firstReplyOn') &&
		!existing.firstReplyOn
	) {
		fields.firstReplyOn = today;
	}

	// "Betaald (afgerond)" means everything is in: the aanbetaling too, also when
	// it was paid outside the Mollie link. Achteraf / niet nodig stays as it is.
	if (
		fields.status === 'afgerond' &&
		!fd.has('depositStatus') &&
		existing.paymentTerm !== 'achteraf' &&
		existing.depositStatus !== 'paid' &&
		existing.depositStatus !== 'waived'
	) {
		fields.depositStatus = 'paid';
	}

	// Booked: keep the klantlink open until three weeks after the event, and
	// move that along when the event date changes. Never shortens it, and never
	// overrides a date typed in this same form.
	const finalStatus = fields.status ?? existing.status;
	const eventDate = fields.eventDate !== undefined ? fields.eventDate : existing.eventDate;
	if (
		isWon({ status: finalStatus }) &&
		existing.acceptanceToken &&
		(fields.status !== undefined || fields.eventDate !== undefined) &&
		!fd.has('acceptanceExpiresAt')
	) {
		const until = portalExpiryAfterEvent(eventDate, existing.acceptanceExpiresAt);
		if (until) {
			fields.acceptanceExpiresAt = until;
			if (!fd.has('acceptanceEnabled')) fields.acceptanceEnabled = true;
		}
	}

	let updated: Deal | null;
	try {
		updated = await updateDeal(id, fields);
	} catch (err) {
		return fail(500, { error: `Bijwerken mislukt: ${(err as Error).message}` });
	}

	// Won with consent on record and an amount: tell Meta it became a booking.
	// Fires on the move to a won status, and on the amount being filled in
	// later for a deal that is already won. Fire-and-forget; sendMetaEvent
	// checks consent, dedupes and never throws. Meta wants the customer's user
	// agent on website events: when they signed in the klantportaal we have
	// theirs. The admin request's IP and user agent are ours, so never those.
	if (updated) {
		const becameWon =
			!!fields.status && fields.status !== existing.status && isWon({ status: fields.status });
		const amountFilledIn =
			fields.offerteAmount !== undefined &&
			fields.offerteAmount !== existing.offerteAmount &&
			isWon(updated);
		if (
			(becameWon || amountFilledIn) &&
			updated.metaConsentAt &&
			!updated.metaPurchaseSentAt &&
			(updated.offerteAmount ?? 0) > 0
		) {
			void sendMetaEvent(updated, 'Purchase', {
				ip: updated.acceptedIp || undefined,
				userAgent: updated.acceptedUserAgent || undefined
			});
		}
	}
	return { updated: true };
};

export const generateAcceptanceAction = async ({ request }: ActionEvent) => {
	if (!isDbConfigured()) return fail(503, { error: 'Geen database geconfigureerd.' });

	const fd = await request.formData();
	const id = str(fd, 'id', 64);
	if (!id) return fail(400, { error: 'id ontbreekt.' });

	const existing = await getDeal(id);
	if (!existing) return fail(404, { error: 'Aanvraag niet gevonden.' });

	const expires = new Date();
	expires.setUTCDate(expires.getUTCDate() + 30);
	expires.setUTCHours(23, 59, 59, 999);
	// A booked deal gets a link that lasts until three weeks after the event.
	const afterEvent = isWon(existing)
		? portalExpiryAfterEvent(existing.eventDate, expires.toISOString())
		: null;

	try {
		await updateDeal(id, {
			acceptanceToken: makeToken(),
			acceptanceEnabled: true,
			acceptanceExpiresAt: afterEvent ?? expires.toISOString()
		});
	} catch (err) {
		return fail(500, { error: `Acceptatielink maken mislukt: ${(err as Error).message}` });
	}
	return { generatedAcceptance: true };
};

/** Keep an older revision out of the client portal without losing it here. */
export const setQuoteVisibilityAction = async ({ request }: ActionEvent) => {
	if (!isDbConfigured()) return fail(503, { error: 'Geen database geconfigureerd.' });

	const fd = await request.formData();
	const id = str(fd, 'id', 64);
	const quoteId = str(fd, 'quoteId', 80);
	if (!id || !quoteId) return fail(400, { error: 'id of quoteId ontbreekt.' });

	const hidden = str(fd, 'hidden', 10) === 'true';

	try {
		const updated = await setQuoteVisibility(id, quoteId, hidden);
		if (!updated) return fail(404, { error: 'Offerte niet gevonden.' });
	} catch (err) {
		return fail(500, { error: `Zichtbaarheid aanpassen mislukt: ${(err as Error).message}` });
	}
	return { quoteVisibilityChanged: true };
};

export const deleteQuoteAction = async ({ request }: ActionEvent) => {
	if (!isDbConfigured()) return fail(503, { error: 'Geen database geconfigureerd.' });

	const fd = await request.formData();
	const id = str(fd, 'id', 64);
	const quoteId = str(fd, 'quoteId', 80);
	if (!id || !quoteId) return fail(400, { error: 'id of quoteId ontbreekt.' });

	const existing = await getDeal(id);
	if (!existing) return fail(404, { error: 'Aanvraag niet gevonden.' });

	// Once a client has signed, the active quote is what they signed for.
	// Verbergen is still fine; weggooien is not. Resolved the same way the
	// portal resolves it, so a deal with an empty activeQuoteId but an
	// `active`-flagged version is still protected.
	if (existing.acceptedTermsAt && activeQuoteOf(existing)?.id === quoteId) {
		return fail(400, {
			error:
				'Deze offerte is al geaccepteerd door de klant en kan niet verwijderd worden. Verberg hem in plaats daarvan.'
		});
	}

	try {
		const updated = await deleteQuoteVersion(id, quoteId);
		if (!updated) return fail(404, { error: 'Offerte niet gevonden.' });
	} catch (err) {
		return fail(500, { error: `Offerte verwijderen mislukt: ${(err as Error).message}` });
	}
	return { quoteDeleted: true };
};

export const deleteDealAction = async ({ request }: ActionEvent) => {
	if (!isDbConfigured()) return fail(503, { error: 'Geen database geconfigureerd.' });
	const fd = await request.formData();
	const id = str(fd, 'id', 64);
	if (!id) return fail(400, { error: 'id ontbreekt.' });
	try {
		await deleteDeal(id);
	} catch (err) {
		return fail(500, { error: `Verwijderen mislukt: ${(err as Error).message}` });
	}
	return { deleted: true };
};

/** Hide a half-finished contact form from the follow-up list. */
export const dismissLeadAction = async ({ request }: ActionEvent) => {
	if (!isDbConfigured()) return fail(503, { error: 'Geen database geconfigureerd.' });
	const fd = await request.formData();
	const id = str(fd, 'id', 64);
	if (!id) return fail(400, { error: 'id ontbreekt.' });
	try {
		await dismissLead(id);
	} catch (err) {
		return fail(500, { error: `Wegklikken mislukt: ${(err as Error).message}` });
	}
	return { leadDismissed: true };
};

/**
 * One click in the list: stamp today on the next empty follow-up step
 * (herinnering 1, herinnering 2, gebeld). The dates stay editable on the
 * Pijplijn tab, so a misclick is one field to clear.
 */
export const logFollowUpAction = async ({ request }: ActionEvent) => {
	if (!isDbConfigured()) return fail(503, { error: 'Geen database geconfigureerd.' });
	const fd = await request.formData();
	const id = str(fd, 'id', 64);
	if (!id) return fail(400, { error: 'id ontbreekt.' });

	const existing = await getDeal(id);
	if (!existing) return fail(404, { error: 'Aanvraag niet gevonden.' });

	const today = todayStr();
	const fields: Partial<DealInput> = !existing.herinnering1Op
		? { herinnering1Op: today }
		: !existing.herinnering2Op
			? { herinnering2Op: today }
			: !existing.gebeldOp
				? { gebeldOp: today }
				: {};
	if (Object.keys(fields).length === 0) return { followUpLogged: false };

	try {
		await updateDeal(id, fields);
	} catch (err) {
		return fail(500, { error: `Opvolging opslaan mislukt: ${(err as Error).message}` });
	}
	return { followUpLogged: true };
};

/**
 * Lengthen the klantlink by N days, counted from today or from the current
 * expiry, whichever is later, and switch it back on. Never shortens.
 */
export const extendAcceptanceAction = async ({ request }: ActionEvent) => {
	if (!isDbConfigured()) return fail(503, { error: 'Geen database geconfigureerd.' });
	const fd = await request.formData();
	const id = str(fd, 'id', 64);
	if (!id) return fail(400, { error: 'id ontbreekt.' });
	const days = Math.min(90, Math.max(1, Math.round(Number(str(fd, 'days', 4)) || 14)));

	const existing = await getDeal(id);
	if (!existing) return fail(404, { error: 'Aanvraag niet gevonden.' });
	if (!existing.acceptanceToken) return fail(400, { error: 'Maak eerst een klantlink.' });

	const today = todayStr();
	const current = existing.acceptanceExpiresAt?.slice(0, 10) ?? '';
	const from = current && current > today ? current : today;
	const expires = new Date(`${addDays(from, days)}T23:59:59.999Z`).toISOString();

	try {
		await updateDeal(id, { acceptanceEnabled: true, acceptanceExpiresAt: expires });
	} catch (err) {
		return fail(500, { error: `Verlengen mislukt: ${(err as Error).message}` });
	}
	return { extended: true };
};

/** Save the edited event sheet so it survives a reload. Stored as JSON on the deal. */
export const saveEventSheetAction = async ({ request }: ActionEvent) => {
	if (!isDbConfigured()) return fail(503, { error: 'Geen database geconfigureerd.' });
	const fd = await request.formData();
	const id = str(fd, 'id', 64);
	if (!id) return fail(400, { error: 'id ontbreekt.' });

	let sheet: Record<string, unknown>;
	try {
		const parsed = JSON.parse(String(fd.get('sheet') ?? '{}'));
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
		sheet = parsed as Record<string, unknown>;
	} catch {
		return fail(400, { error: 'Event sheet kon niet gelezen worden.' });
	}
	if (JSON.stringify(sheet).length > 50_000) return fail(400, { error: 'Event sheet te groot.' });

	try {
		await updateDeal(id, { eventSheet: { ...sheet, savedAt: new Date().toISOString() } });
	} catch (err) {
		return fail(500, { error: `Event sheet opslaan mislukt: ${(err as Error).message}` });
	}
	return { sheetSaved: true };
};

/**
 * Turn a half-finished contact form into a real aanvraag: copy what step 1
 * gave us, keep the original arrival date and the measured first touch, and
 * take the lead off the list. Returns the new deal id.
 */
export const convertLeadAction = async ({ request }: ActionEvent) => {
	if (!isDbConfigured()) return fail(503, { error: 'Geen database geconfigureerd.' });
	const fd = await request.formData();
	const id = str(fd, 'id', 64);
	if (!id) return fail(400, { error: 'id ontbreekt.' });

	const lead = await getLead(id);
	if (!lead) return fail(404, { error: 'Half ingevulde aanvraag niet gevonden.' });

	let dealId = '';
	try {
		const created = await createDeal({
			name: lead.name || lead.email,
			email: lead.email,
			phone: lead.phone,
			serviceType: lead.serviceType,
			choice: lead.choice,
			firstTouch: lead.firstTouch,
			createdAt: lead.createdAt,
			// Marks where it came from; counts as a normal lead in every metric.
			origin: 'contact_form_partial'
		});
		dealId = created?.id ?? '';
		await dismissLead(id);
	} catch (err) {
		return fail(500, { error: `Aanvraag maken mislukt: ${(err as Error).message}` });
	}
	return { converted: true, id: dealId };
};

/**
 * What a status change still lacks, as labels for the error message. A value
 * counts when this request sends it or the deal already has it. Mirrors the
 * required fields in StatusChange.svelte.
 */
function missingForStatus(
	status: DealStatus,
	fields: Partial<DealInput>,
	existing: Deal
): string[] {
	const has = <K extends keyof DealInput & keyof Deal>(key: K) => {
		const v = key in fields ? fields[key] : existing[key];
		return v !== null && v !== undefined && v !== '';
	};
	const missing: string[] = [];

	if (existing.status === 'nieuw' && status !== 'nieuw' && !has('firstReplyOn'))
		missing.push('eerste reactie');

	if (status === 'offerte_verstuurd' || status === 'in_optie') {
		if (!has('offerteVerstuurdOp')) missing.push('offerte verstuurd op');
		if (!has('geldigTot')) missing.push('geldig tot');
	}
	if (
		(status === 'offerte_verstuurd' || status === 'in_optie' || status === 'geaccepteerd') &&
		existing.quoteVersions.length === 0 &&
		!has('offerteAmount')
	)
		missing.push('offertebedrag');
	if (status === 'geaccepteerd' && !has('geaccepteerdOp')) missing.push('geaccepteerd op');
	if (status === 'geleverd' && !has('costs')) missing.push('kosten');
	if (status === 'factuur_verstuurd' && !has('factuurVerstuurdOp'))
		missing.push('factuur verstuurd op');
	if (status === 'afgerond' && !has('betaaldOp')) missing.push('betaald op');
	if (status === 'afgewezen' && !has('afgewezenOp')) missing.push('afgewezen op');
	if (status === 'afgewezen' || status === 'afgewezen_intern') {
		const reason = 'lostReason' in fields ? (fields.lostReason ?? '') : existing.lostReason;
		if (!isValidReason(status, reason)) missing.push('reden');
	}
	return missing;
}

/** Take a factuur out of the klantportaal. */
export const deleteInvoiceAction = async ({ request }: ActionEvent) => {
	if (!isDbConfigured()) return fail(503, { error: 'Geen database geconfigureerd.' });
	const fd = await request.formData();
	const id = str(fd, 'id', 64);
	const invoiceId = str(fd, 'invoiceId', 80);
	if (!id || !invoiceId) return fail(400, { error: 'id of factuur ontbreekt.' });
	try {
		const updated = await deleteInvoice(id, invoiceId);
		if (!updated) return fail(404, { error: 'Aanvraag niet gevonden.' });
	} catch (err) {
		return fail(500, { error: `Factuur weghalen mislukt: ${(err as Error).message}` });
	}
	return { invoiceDeleted: true };
};
