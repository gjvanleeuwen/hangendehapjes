import { fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { isDbConfigured } from '$lib/server/db';
import {
	createDeal,
	deleteDeal,
	getDeal,
	listDeals,
	toDateOrNull,
	updateDeal,
	DEAL_STATUSES,
	type DealInput,
	type DealStatus
} from '$lib/server/deals';
import { TIME_PHASES } from '$lib/deals';
import type { Actions, PageServerLoad } from './$types';

const EXPIRY_WINDOW_DAYS = 7;

const todayStr = () => new Date().toISOString().slice(0, 10);

const addDays = (iso: string, days: number) => {
	const d = new Date(`${iso}T00:00:00Z`);
	d.setUTCDate(d.getUTCDate() + days);
	return d.toISOString().slice(0, 10);
};

export const load: PageServerLoad = async ({ url }) => {
	const dbConfigured = isDbConfigured();
	const deals = dbConfigured ? await listDeals() : [];
	const today = todayStr();
	const soon = addDays(today, EXPIRY_WINDOW_DAYS);

	const calToken = env.CALENDAR_TOKEN;
	const calendarUrl = calToken
		? `${url.origin}/admin/calendar.ics?token=${encodeURIComponent(calToken)}`
		: null;

	const expiringSoon = deals
		.filter(
			(d) =>
				(d.status === 'offerte_verstuurd' || d.status === 'in_optie') &&
				d.geldigTot &&
				d.geldigTot <= soon
		)
		.sort((a, b) => (a.geldigTot ?? '').localeCompare(b.geldigTot ?? ''));

	return { deals, expiringSoon, today, dbConfigured, calendarUrl };
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

const statusOf = (fd: FormData): DealStatus => {
	const s = String(fd.get('status') ?? 'nieuw');
	return (DEAL_STATUSES as readonly string[]).includes(s) ? (s as DealStatus) : 'nieuw';
};

const hoursOrZero = (raw: string): number => {
	const n = Number(raw.replace(',', '.').trim());
	return Number.isFinite(n) && n > 0 ? n : 0;
};

// Read time_<phase> inputs from the full editor into a { phase: hours } object.
const parseTimeSpent = (fd: FormData): Record<string, number> => {
	const out: Record<string, number> = {};
	for (const p of TIME_PHASES) {
		const h = hoursOrZero(String(fd.get(`time_${p.key}`) ?? ''));
		if (h > 0) out[p.key] = h;
	}
	return out;
};

export const actions: Actions = {
	// Manual add + backfill of past aanvragen.
	create: async ({ request }) => {
		if (!isDbConfigured()) return fail(503, { error: 'Geen database geconfigureerd.' });

		const fd = await request.formData();
		const name = str(fd, 'name', 100);
		if (!name) return fail(400, { error: 'Naam is verplicht.', form: 'create' });

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
			status: statusOf(fd),
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

		try {
			await createDeal(input);
		} catch (err) {
			return fail(500, { error: `Opslaan mislukt: ${(err as Error).message}`, form: 'create' });
		}
		return { created: true };
	},

	update: async ({ request }) => {
		if (!isDbConfigured()) return fail(503, { error: 'Geen database geconfigureerd.' });

		const fd = await request.formData();
		const id = str(fd, 'id', 64);
		if (!id) return fail(400, { error: 'id ontbreekt.' });

		const existing = await getDeal(id);
		if (!existing) return fail(404, { error: 'Aanvraag niet gevonden.' });

		// Build a partial update from whichever fields the submitted form carried.
		// The quick status form sends only id+status; the full editor sends all.
		const fields: Partial<DealInput> = {};
		if (fd.has('status')) fields.status = statusOf(fd);
		if (fd.has('name')) fields.name = str(fd, 'name', 100);
		if (fd.has('email')) fields.email = str(fd, 'email', 254);
		if (fd.has('phone')) fields.phone = str(fd, 'phone', 30);
		if (fd.has('source')) fields.source = str(fd, 'source', 200);
		if (fd.has('attribution')) fields.attribution = str(fd, 'attribution', 200);
		if (fd.has('eventDate')) {
			fields.eventDate = toDateOrNull(str(fd, 'eventDate', 25));
			fields.eventDateText = str(fd, 'eventDate', 25);
		}
		if (fd.has('location')) fields.location = str(fd, 'location', 200);
		if (fd.has('guests')) fields.guests = str(fd, 'guests', 10);
		if (fd.has('serviceType')) fields.serviceType = str(fd, 'serviceType', 20);
		if (fd.has('choice')) fields.choice = str(fd, 'choice', 120);
		if (fd.has('offerteAmount')) fields.offerteAmount = amountOrNull(fd, 'offerteAmount');
		if (fd.has('btwAmount')) fields.btwAmount = amountOrNull(fd, 'btwAmount');
		if (fd.has('costs')) fields.costs = amountOrNull(fd, 'costs');
		// The full editor always submits the time inputs; the quick status form
		// does not — gate on the first phase field being present.
		if (fd.has(`time_${TIME_PHASES[0].key}`)) fields.timeSpent = parseTimeSpent(fd);
		if (fd.has('offerteVerstuurdOp'))
			fields.offerteVerstuurdOp = toDateOrNull(str(fd, 'offerteVerstuurdOp', 25));
		if (fd.has('geldigTot')) fields.geldigTot = toDateOrNull(str(fd, 'geldigTot', 25));
		if (fd.has('geaccepteerdOp'))
			fields.geaccepteerdOp = toDateOrNull(str(fd, 'geaccepteerdOp', 25));
		if (fd.has('notes')) fields.notes = str(fd, 'notes', 5000);

		// Convenience auto-stamps when advancing the pipeline and the date wasn't
		// part of this form (so we never overwrite a value the user just cleared).
		const today = todayStr();
		// Sending an offerte or putting a date in option both start the 14-day
		// hold window (offerte_verstuurd_op → geldig_tot). We handle freeing the
		// date manually via the "verloopt binnenkort" list.
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

		try {
			await updateDeal(id, fields);
		} catch (err) {
			return fail(500, { error: `Bijwerken mislukt: ${(err as Error).message}` });
		}
		return { updated: true };
	},

	delete: async ({ request }) => {
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
	}
};
