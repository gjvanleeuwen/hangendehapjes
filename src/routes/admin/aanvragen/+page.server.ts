import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { isCalendarEvent } from '$lib/deals';
import { isDbConfigured } from '$lib/server/db';
import { listOpenLeads } from '$lib/server/leads';
import { listDeals } from '$lib/server/deals';
import {
	addDays,
	deleteDealAction,
	convertLeadAction,
	dismissLeadAction,
	extendAcceptanceAction,
	logFollowUpAction,
	todayStr,
	updateDealAction
} from '$lib/server/admin/deal-actions';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const dbConfigured = isDbConfigured();
	const deals = dbConfigured ? await listDeals() : [];
	// Half-finished contact forms: the earliest stage of an aanvraag, shown in
	// the same list. Best-effort: never break the page.
	const leads = dbConfigured ? await listOpenLeads().catch(() => []) : [];
	const today = todayStr();
	const soon = addDays(today, 7); // "verloopt" window for the chips and the geldig tot colour

	// Agenda on top of the list: booked and in-optie deals with a date, plus the
	// secret ICS link for subscribing from a phone or Google Agenda.
	const events = deals.filter((d) => isCalendarEvent(d) && d.eventDate);
	const calToken = env.CALENDAR_TOKEN;
	const calendarUrl = calToken
		? `${url.origin}/admin/calendar.ics?token=${encodeURIComponent(calToken)}`
		: null;

	return { deals, leads, today, soon, dbConfigured, events, calendarUrl };
};

export const actions: Actions = {
	update: updateDealAction,
	delete: deleteDealAction,
	dismissLead: dismissLeadAction,
	logFollowUp: logFollowUpAction,
	extendAcceptance: extendAcceptanceAction,
	convertLead: async (event) => {
		const result = await convertLeadAction(event);
		if (!('id' in result)) return result;
		// Straight to the new aanvraag, so you can file the rest right away.
		redirect(303, result.id ? `/admin/aanvragen/${result.id}` : '/admin/aanvragen');
	}
};
