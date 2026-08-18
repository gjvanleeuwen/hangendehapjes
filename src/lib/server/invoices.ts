import { ensureSchema } from './db';
import { INVOICE_PREFIX_PATTERN, formatInvoiceNumber } from '$lib/admin/business';

export type SequenceState = {
	prefix: string;
	year: number;
	/** Laatst uitgegeven volgnummer; 0 als er dit jaar nog niets uitging. */
	lastNumber: number;
	/** Wat het eerstvolgende nummer zou worden. Alleen ter info, nog niet geclaimd. */
	nextPreview: string;
	lastIssued: string | null;
};

function normalizePrefix(raw: string): string {
	const prefix = raw.trim().toUpperCase();
	return INVOICE_PREFIX_PATTERN.test(prefix) ? prefix : '';
}

/**
 * Kijkt waar de reeks staat zonder een nummer te claimen. Bewust read-only: de
 * pagina openen mag nooit een factuurnummer verbranden, want een gat in de
 * nummering moet je aan de Belastingdienst kunnen uitleggen.
 */
export async function peekSequence(rawPrefix: string, year: number): Promise<SequenceState | null> {
	const prefix = normalizePrefix(rawPrefix);
	if (!prefix) return null;
	try {
		const sql = await ensureSchema();
		if (!sql) return null;

		const rows = await sql<{ last_number: number }[]>`
			SELECT last_number FROM invoice_sequences WHERE prefix = ${prefix} AND year = ${year}
		`;
		const lastNumber = rows[0]?.last_number ?? 0;
		return {
			prefix,
			year,
			lastNumber,
			nextPreview: formatInvoiceNumber(prefix, year, lastNumber + 1),
			lastIssued: lastNumber > 0 ? formatInvoiceNumber(prefix, year, lastNumber) : null
		};
	} catch {
		// Een onbereikbare database mag het document niet blokkeren; de UI valt
		// dan terug op handmatig invullen.
		return null;
	}
}

/**
 * Claimt het volgende nummer in de reeks. De UPSERT met RETURNING is atomair,
 * dus twee tabbladen die tegelijk op de knop drukken krijgen verschillende
 * nummers in plaats van hetzelfde.
 */
export async function reserveInvoiceNumber(
	rawPrefix: string,
	year: number,
	dealId: string | null
): Promise<string | null> {
	const prefix = normalizePrefix(rawPrefix);
	if (!prefix) return null;
	try {
		const sql = await ensureSchema();
		if (!sql) return null;

		const rows = await sql<{ last_number: number }[]>`
			INSERT INTO invoice_sequences (prefix, year, last_number, updated_at)
			VALUES (${prefix}, ${year}, 1, now())
			ON CONFLICT (prefix, year) DO UPDATE
				SET last_number = invoice_sequences.last_number + 1, updated_at = now()
			RETURNING last_number
		`;
		const seq = rows[0]?.last_number;
		if (!seq) return null;

		const number = formatInvoiceNumber(prefix, year, seq);
		await sql`
			INSERT INTO invoice_numbers (number, prefix, year, seq, deal_id)
			VALUES (${number}, ${prefix}, ${year}, ${seq}, ${dealId || null})
			ON CONFLICT (number) DO NOTHING
		`;
		return number;
	} catch {
		return null;
	}
}
