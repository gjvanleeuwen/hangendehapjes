import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { listEventDeals, type Deal } from '$lib/server/deals';
import type { RequestHandler } from './$types';

// RFC 5545 text escaping for property values.
const esc = (s: string) =>
	s
		.replace(/\\/g, '\\\\')
		.replace(/;/g, '\\;')
		.replace(/,/g, '\\,')
		.replace(/\n/g, '\\n');

// YYYY-MM-DD -> YYYYMMDD (all-day DATE value).
const icsDate = (iso: string) => iso.replace(/-/g, '');

// next day, for the exclusive DTEND of an all-day event.
const nextDay = (iso: string) => {
	const d = new Date(`${iso}T00:00:00Z`);
	d.setUTCDate(d.getUTCDate() + 1);
	return d.toISOString().slice(0, 10).replace(/-/g, '');
};

const icsStamp = (iso: string) => {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return '19700101T000000Z';
	return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
};

// Long lines must be folded at 75 octets (we fold a bit conservatively on chars).
const fold = (line: string) => {
	if (line.length <= 73) return line;
	const parts: string[] = [];
	let rest = line;
	parts.push(rest.slice(0, 73));
	rest = rest.slice(73);
	while (rest.length > 72) {
		parts.push(' ' + rest.slice(0, 72));
		rest = rest.slice(72);
	}
	if (rest.length) parts.push(' ' + rest);
	return parts.join('\r\n');
};

const serviceLabel = (d: Deal) =>
	d.serviceType === 'taart'
		? 'Taart / dessert'
		: d.serviceType === 'hapjes'
			? 'Hangende hapjes'
			: d.serviceType;

function buildEvent(d: Deal, stamp: string): string[] {
	const date = d.eventDate as string; // guaranteed by the query
	const tentative = d.status === 'in_optie';
	const titleBits = [d.name, serviceLabel(d)].filter(Boolean).join(' — ');
	const summary = `${tentative ? '🕒 (optie) ' : '🍽 '}${titleBits}${d.guests ? ` (${d.guests}p)` : ''}`;

	const descLines = [
		d.choice ? `Keuze: ${d.choice}` : null,
		d.guests ? `Gasten: ${d.guests}` : null,
		d.servingTime ? `Tijd: ${d.servingTime}` : null,
		d.phone ? `Tel: ${d.phone}` : null,
		d.email ? `Mail: ${d.email}` : null,
		d.offerteAmount != null ? `Offerte: €${d.offerteAmount.toFixed(2)}` : null,
		d.notes ? `Notitie: ${d.notes}` : null
	].filter((l): l is string => l !== null);

	return [
		'BEGIN:VEVENT',
		`UID:deal-${d.id}@hangendehapjes.nl`,
		`DTSTAMP:${stamp}`,
		`LAST-MODIFIED:${icsStamp(d.updatedAt)}`,
		`DTSTART;VALUE=DATE:${icsDate(date)}`,
		`DTEND;VALUE=DATE:${nextDay(date)}`,
		`STATUS:${tentative ? 'TENTATIVE' : 'CONFIRMED'}`,
		fold(`SUMMARY:${esc(summary)}`),
		d.location ? fold(`LOCATION:${esc(d.location)}`) : null,
		descLines.length ? fold(`DESCRIPTION:${esc(descLines.join('\n'))}`) : null,
		'END:VEVENT'
	].filter((l): l is string => l !== null);
}

export const GET: RequestHandler = async ({ url }) => {
	const expected = env.CALENDAR_TOKEN;
	const provided = url.searchParams.get('token') ?? '';
	if (!expected || provided.length !== expected.length || provided !== expected) {
		throw error(403, 'forbidden');
	}

	const deals = await listEventDeals();
	const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

	const lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Hangende Hapjes//Agenda//NL',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		'X-WR-CALNAME:Hangende Hapjes — events',
		'X-WR-TIMEZONE:Europe/Amsterdam',
		...deals.flatMap((d) => buildEvent(d, stamp)),
		'END:VCALENDAR'
	];

	return new Response(lines.join('\r\n') + '\r\n', {
		headers: {
			'Content-Type': 'text/calendar; charset=utf-8',
			'Content-Disposition': 'inline; filename="hangende-hapjes.ics"',
			'Cache-Control': 'no-cache'
		}
	});
};
