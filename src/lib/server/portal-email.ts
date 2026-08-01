// Transactional mail for the client portal. Fired once, when a client signs
// off on an offerte. Deliberately plain text: this is a short confirmation, not
// a newsletter, and plain text is what survives every mail client intact.
import { ServerClient } from 'postmark';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { notifyError } from '$lib/server/notify';
import { formatDateNL, formatEUR } from '$lib/admin/calc';

const FROM = 'aanvragen@hangendehapjes.nl';
const ADMIN = 'info@hangendehapjes.nl';

type AcceptedDeal = {
	name: string;
	email: string;
	eventDate: string | null;
	eventDateText: string;
	location: string;
	guests: string;
	offerteAmount: number | null;
	depositAmount: number | null;
	acceptedByName: string;
	acceptedAtLocation: string;
};

const eventDateLabel = (deal: Pick<AcceptedDeal, 'eventDate' | 'eventDateText'>) =>
	(deal.eventDate ? formatDateNL(deal.eventDate) : deal.eventDateText) || 'nog af te stemmen';

/** What the client gets: confirmation, a recap, and what happens next. */
const buildClientEmail = (deal: AcceptedDeal, portalUrl: string) => {
	const firstName = deal.name.trim().split(/\s+/)[0] || 'daar';

	const recap = [
		`Datum: ${eventDateLabel(deal)}`,
		deal.location ? `Locatie: ${deal.location}` : null,
		deal.guests ? `Aantal gasten: ${deal.guests}` : null,
		deal.offerteAmount != null ? `Totaal: ${formatEUR(deal.offerteAmount)}` : null
	].filter((line): line is string => line !== null);

	const deposit =
		deal.depositAmount != null
			? `De aanbetaling van ${formatEUR(deal.depositAmount)} zetten we voor je klaar in het portaal. Zodra die binnen is, staat de datum echt op jouw naam. De aanbetaling verrekenen we met de eindfactuur.`
			: 'We zetten de aanbetaling voor je klaar in het portaal. Zodra die binnen is, staat de datum echt op jouw naam.';

	const text = [
		`Hoi ${firstName},`,
		'',
		'Gelukt, we hebben je akkoord binnen. Superleuk dat we erbij mogen zijn.',
		'',
		'Dit hebben we genoteerd:',
		...recap,
		'',
		deposit,
		'',
		'Je gegevens kun je altijd nog aanvullen of aanpassen in je portaal:',
		portalUrl,
		'',
		'Heb je in de tussentijd een vraag, mail ons gewoon terug. We houden contact als de datum dichterbij komt.',
		'',
		'Groetjes,',
		'Charlotte en Gijs',
		'Hangende Hapjes'
	].join('\n');

	return { subject: 'Je akkoord is binnen — Hangende Hapjes', text };
};

/** What we get: enough to act on without opening the admin. */
const buildAdminEmail = (deal: AcceptedDeal, portalUrl: string) => {
	const text = [
		`${deal.name} heeft de offerte geaccepteerd.`,
		'',
		`Getekend door: ${deal.acceptedByName}`,
		`Plaats: ${deal.acceptedAtLocation}`,
		`Datum event: ${eventDateLabel(deal)}`,
		deal.location ? `Locatie: ${deal.location}` : null,
		deal.guests ? `Aantal gasten: ${deal.guests}` : null,
		deal.offerteAmount != null ? `Totaal: ${formatEUR(deal.offerteAmount)}` : null,
		deal.depositAmount != null ? `Aanbetaling: ${formatEUR(deal.depositAmount)}` : null,
		'',
		`Portaal: ${portalUrl}`
	]
		.filter((line): line is string => line !== null)
		.join('\n');

	return { subject: `Offerte geaccepteerd — ${deal.name}`, text };
};

/**
 * Sends the acceptance confirmation to the client and a heads-up to us.
 * Never throws: a mail failure must not roll back an acceptance that is
 * already committed to the database, so problems are logged and pushed to
 * Telegram instead of surfacing to the client as a failed submit.
 */
export async function sendPortalAcceptedEmails(
	deal: AcceptedDeal,
	portalUrl: string
): Promise<void> {
	const client = buildClientEmail(deal, portalUrl);
	const admin = buildAdminEmail(deal, portalUrl);
	const token = env.POSTMARK_TOKEN;

	if (!token) {
		if (dev) {
			console.log(
				'[portal] dev mode, no Postmark token — would have sent to',
				deal.email,
				'\n',
				client.text,
				'\n---\n',
				admin.text
			);
			return;
		}
		void notifyError(new Error('POSTMARK_TOKEN is not configured'), {
			source: 'klantportaal — acceptance email'
		});
		return;
	}

	const postmark = new ServerClient(token);

	if (deal.email) {
		try {
			await postmark.sendEmail({
				From: FROM,
				To: deal.email,
				ReplyTo: ADMIN,
				Subject: client.subject,
				TextBody: client.text,
				MessageStream: 'outbound'
			});
		} catch (err) {
			console.error('[portal] acceptance confirmation send failed', err);
			void notifyError(err, {
				source: 'klantportaal — acceptance confirmation (non-fatal)',
				extra: { to: deal.email, deal: deal.name }
			});
		}
	}

	try {
		await postmark.sendEmail({
			From: FROM,
			To: ADMIN,
			ReplyTo: deal.email || ADMIN,
			Subject: admin.subject,
			TextBody: admin.text,
			MessageStream: 'outbound'
		});
	} catch (err) {
		console.error('[portal] acceptance admin notification failed', err);
		void notifyError(err, {
			source: 'klantportaal — acceptance admin notification (non-fatal)',
			extra: { deal: deal.name }
		});
	}
}
