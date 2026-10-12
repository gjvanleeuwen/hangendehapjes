// Checks for the contact form payload schema. Run with `bun run test:contact`.
// No test framework: a list of cases, each either passes validation or fails
// on an expected path, with optional checks on the cleaned output.
import * as v from 'valibot';
import { PayloadSchema } from '../src/lib/server/contact-schema';

type Case = {
	name: string;
	input: unknown;
	shouldPass: boolean;
	expectIssueOn?: string;
	check?: (output: unknown) => string | null;
};

// The smallest payload the form can send: every required field filled in.
const base = {
	name: 'Gijs',
	email: 'gijs@example.com',
	eventDate: '2026-08-01',
	guests: '75',
	serviceType: 'hapjes',
	choice: 'Tiramisu',
	message: 'Hi there'
};
const withBase = (overrides: Record<string, unknown>) => ({ ...base, ...overrides });
const without = (key: keyof typeof base) => {
	const copy: Record<string, unknown> = { ...base };
	delete copy[key];
	return copy;
};
const field = (o: unknown, key: string) => (o as Record<string, unknown>)[key];

const cases: Case[] = [
	// Happy paths
	{
		name: 'minimal valid payload',
		input: base,
		shouldPass: true,
		check: (o) => {
			if (field(o, 'locale') !== 'nl') return `locale should default to "nl"`;
			if (field(o, 'phone') !== '') return `phone should default to ""`;
			if (field(o, 'referral') !== '') return `referral should default to ""`;
			if (field(o, 'attribution') !== '') return `attribution should default to ""`;
			if (field(o, 'subject') !== '') return `honeypot should default to ""`;
			if (field(o, 'metaConsent') !== false) return `metaConsent should default to false`;
			return null;
		}
	},
	{
		name: 'full payload',
		input: withBase({
			name: 'Charlotte',
			email: 'charlotte@example.com',
			phone: '+31 6 12345678',
			location: 'Amsterdam',
			guests: '120',
			serviceType: 'taart',
			choice: 'Klassieke bruidstaart',
			dagdeel: 'Taartmoment',
			servingTime: '16:30',
			referral: 'Via Instagram',
			message: 'We zijn op zoek naar iets origineels',
			attribution: JSON.stringify({ first: { ts: '2026-07-01', src: 'instagram' } }),
			locale: 'en',
			metaConsent: true
		}),
		shouldPass: true,
		check: (o) => (field(o, 'locale') === 'en' ? null : 'locale should be "en"')
	},

	// Meta consent
	{
		name: 'metaConsent true is kept',
		input: withBase({ metaConsent: true }),
		shouldPass: true,
		check: (o) => (field(o, 'metaConsent') === true ? null : 'metaConsent should be true')
	},
	{
		name: 'metaConsent false is kept',
		input: withBase({ metaConsent: false }),
		shouldPass: true,
		check: (o) => (field(o, 'metaConsent') === false ? null : 'metaConsent should be false')
	},
	{
		name: 'metaConsent missing defaults to false (never opt in by accident)',
		input: base,
		shouldPass: true,
		check: (o) => (field(o, 'metaConsent') === false ? null : 'metaConsent should default false')
	},
	{
		name: 'metaConsent as string "true" fails (no truthy coercion)',
		input: withBase({ metaConsent: 'true' }),
		shouldPass: false,
		expectIssueOn: 'metaConsent'
	},
	{
		name: 'metaConsent as 1 fails',
		input: withBase({ metaConsent: 1 }),
		shouldPass: false,
		expectIssueOn: 'metaConsent'
	},

	// Sanitization
	{
		name: 'name strips header-injection chars',
		input: withBase({ name: 'Gijs<script>alert(1)</script>' }),
		shouldPass: true,
		check: (o) => {
			const n = field(o, 'name') as string;
			if (/[<>"\\]/.test(n)) return `name still contains hostile chars: "${n}"`;
			return null;
		}
	},
	{
		name: 'name with only special chars fails (becomes empty after strip)',
		input: withBase({ name: '<<<<>>>>' }),
		shouldPass: false,
		expectIssueOn: 'name'
	},
	{
		name: 'email with CRLF injection fails',
		input: withBase({ email: 'g@x.com\r\nBcc: evil@x.com' }),
		shouldPass: false,
		expectIssueOn: 'email'
	},
	{
		name: 'email is trimmed',
		input: withBase({ email: '  g@x.com  ' }),
		shouldPass: true,
		check: (o) => (field(o, 'email') === 'g@x.com' ? null : 'email not trimmed properly')
	},
	{
		name: 'phone CRLF replaced with space',
		input: withBase({ phone: '06\n12345678' }),
		shouldPass: true,
		check: (o) => (/[\r\n]/.test(field(o, 'phone') as string) ? `phone contains CRLF` : null)
	},
	{
		name: 'message preserves newlines',
		input: withBase({ message: 'line one\nline two\nline three' }),
		shouldPass: true,
		check: (o) =>
			(field(o, 'message') as string).split('\n').length === 3 ? null : 'newlines lost in message'
	},
	{
		name: 'message CRLF normalised to LF',
		input: withBase({ message: 'line one\r\nline two' }),
		shouldPass: true,
		check: (o) => (/\r/.test(field(o, 'message') as string) ? 'message still has CR' : null)
	},

	// Required fields
	{ name: 'missing name', input: without('name'), shouldPass: false, expectIssueOn: 'name' },
	{ name: 'empty name', input: withBase({ name: '' }), shouldPass: false, expectIssueOn: 'name' },
	{
		name: 'whitespace-only name',
		input: withBase({ name: '   ' }),
		shouldPass: false,
		expectIssueOn: 'name'
	},
	{ name: 'missing email', input: without('email'), shouldPass: false, expectIssueOn: 'email' },
	{
		name: 'invalid email format',
		input: withBase({ email: 'not-an-email' }),
		shouldPass: false,
		expectIssueOn: 'email'
	},
	{
		name: 'missing eventDate',
		input: without('eventDate'),
		shouldPass: false,
		expectIssueOn: 'eventDate'
	},
	{ name: 'missing guests', input: without('guests'), shouldPass: false, expectIssueOn: 'guests' },
	{
		name: 'missing serviceType',
		input: without('serviceType'),
		shouldPass: false,
		expectIssueOn: 'serviceType'
	},
	{
		name: 'unknown serviceType fails',
		input: withBase({ serviceType: 'drankjes' }),
		shouldPass: false,
		expectIssueOn: 'serviceType'
	},
	{ name: 'missing choice', input: without('choice'), shouldPass: false, expectIssueOn: 'choice' },
	{
		name: 'missing message',
		input: without('message'),
		shouldPass: false,
		expectIssueOn: 'message'
	},
	{
		name: 'empty message',
		input: withBase({ message: '   ' }),
		shouldPass: false,
		expectIssueOn: 'message'
	},

	// Length caps
	{
		name: 'name at 100 chars passes',
		input: withBase({ name: 'a'.repeat(100) }),
		shouldPass: true
	},
	{
		name: 'name at 101 chars fails',
		input: withBase({ name: 'a'.repeat(101) }),
		shouldPass: false,
		expectIssueOn: 'name'
	},
	{
		name: 'message at 5000 chars passes',
		input: withBase({ message: 'a'.repeat(5000) }),
		shouldPass: true
	},
	{
		name: 'message at 5001 chars fails',
		input: withBase({ message: 'a'.repeat(5001) }),
		shouldPass: false,
		expectIssueOn: 'message'
	},
	{
		name: 'email at 251 chars passes',
		input: withBase({ email: 'a'.repeat(245) + '@x.com' }),
		shouldPass: true
	},
	{
		name: 'email at 296 chars fails (over cap)',
		input: withBase({ email: 'a'.repeat(290) + '@x.com' }),
		shouldPass: false,
		expectIssueOn: 'email'
	},
	{
		name: 'attribution over 2000 chars fails',
		input: withBase({ attribution: 'x'.repeat(2001) }),
		shouldPass: false,
		expectIssueOn: 'attribution'
	},

	// Locale
	{
		name: 'invalid locale fails',
		input: withBase({ locale: 'fr' }),
		shouldPass: false,
		expectIssueOn: 'locale'
	},
	{ name: 'locale "en" accepted', input: withBase({ locale: 'en' }), shouldPass: true },

	// Type abuse
	{
		name: 'name as number fails',
		input: withBase({ name: 123 }),
		shouldPass: false,
		expectIssueOn: 'name'
	},
	{
		name: 'guests as number passes (HTML5 type=number ships as JSON number)',
		input: withBase({ guests: 100 }),
		shouldPass: true,
		check: (o) => (field(o, 'guests') === '100' ? null : 'guests not coerced to string')
	},
	{
		name: 'guests as string still passes',
		input: withBase({ guests: '100' }),
		shouldPass: true,
		check: (o) => (field(o, 'guests') === '100' ? null : 'guests not preserved')
	},
	{
		name: 'honeypot value is passed through for the endpoint to flag',
		input: withBase({ subject: 'buy now' }),
		shouldPass: true,
		check: (o) => (field(o, 'subject') === 'buy now' ? null : 'honeypot value lost')
	},
	{ name: 'completely empty body fails', input: {}, shouldPass: false },
	{ name: 'null body fails', input: null, shouldPass: false }
];

let passed = 0;
let failed = 0;

for (const c of cases) {
	const result = v.safeParse(PayloadSchema, c.input);

	const matchesExpectation = result.success === c.shouldPass;
	let issueOk = true;
	if (c.expectIssueOn && !result.success) {
		const paths = result.issues.map((i) =>
			(i.path ?? []).map((p) => String((p as { key: unknown }).key)).join('.')
		);
		issueOk = paths.some((p) => p === c.expectIssueOn || p.startsWith(c.expectIssueOn + '.'));
	}
	const checkErr = matchesExpectation && result.success && c.check ? c.check(result.output) : null;

	if (matchesExpectation && issueOk && !checkErr) {
		console.log(`✓ ${c.name}`);
		passed++;
	} else {
		console.log(`✗ ${c.name}`);
		if (!matchesExpectation) {
			console.log(
				`    expected ${c.shouldPass ? 'pass' : 'fail'}, got ${result.success ? 'pass' : 'fail'}`
			);
		}
		if (!result.success) {
			const issues = result.issues.map(
				(i) =>
					`${
						(i.path ?? []).map((p) => String((p as { key: unknown }).key)).join('.') || '(root)'
					}: ${i.message}`
			);
			console.log(`    issues: ${issues.join('; ')}`);
		}
		if (c.expectIssueOn && !issueOk) {
			console.log(`    expected an issue on path "${c.expectIssueOn}"`);
		}
		if (checkErr) console.log(`    check failed: ${checkErr}`);
		failed++;
	}
}

console.log(`\n${passed}/${passed + failed} passed`);
process.exit(failed === 0 ? 0 : 1);
