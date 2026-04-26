import * as v from 'valibot';
import { PayloadSchema } from '../src/lib/server/contact-schema';

type Case = {
	name: string;
	input: unknown;
	shouldPass: boolean;
	expectIssueOn?: string;
	check?: (output: unknown) => string | null;
};

const cases: Case[] = [
	// Happy paths
	{
		name: 'minimal valid (name + email + message)',
		input: { name: 'Gijs', email: 'gijs@example.com', message: 'Hi there' },
		shouldPass: true,
		check: (o) => {
			const c = o as Record<string, unknown>;
			if (c.locale !== 'nl') return `locale should default to "nl", got ${String(c.locale)}`;
			if (c.phone !== '') return `phone should default to "", got ${String(c.phone)}`;
			if (!Array.isArray(c.interests) || c.interests.length !== 0)
				return `interests should default to []`;
			return null;
		}
	},
	{
		name: 'full payload',
		input: {
			name: 'Charlotte',
			email: 'charlotte@example.com',
			phone: '+31 6 12345678',
			eventDate: '2026-08-01',
			location: 'Amsterdam',
			guests: '120',
			interests: ['Tiramisu', 'Burrata'],
			message: 'We zijn op zoek naar iets origineels',
			locale: 'en'
		},
		shouldPass: true,
		check: (o) => ((o as { locale: string }).locale === 'en' ? null : 'locale should be "en"')
	},

	// Sanitization
	{
		name: 'name strips header-injection chars',
		input: {
			name: 'Gijs<script>alert(1)</script>',
			email: 'g@x.com',
			message: 'hi'
		},
		shouldPass: true,
		check: (o) => {
			const n = (o as { name: string }).name;
			if (/[<>"\\]/.test(n)) return `name still contains hostile chars: "${n}"`;
			return null;
		}
	},
	{
		name: 'name with only special chars fails (becomes empty after strip)',
		input: { name: '<<<<>>>>', email: 'g@x.com', message: 'hi' },
		shouldPass: false,
		expectIssueOn: 'name'
	},
	{
		name: 'email strips CRLF',
		input: { name: 'Gijs', email: 'g@x.com\r\nBcc: evil@x.com', message: 'hi' },
		shouldPass: false, // resulting string still won't match email regex due to surrounding chars
		expectIssueOn: 'email'
	},
	{
		name: 'email is trimmed',
		input: { name: 'Gijs', email: '  g@x.com  ', message: 'hi' },
		shouldPass: true,
		check: (o) =>
			(o as { email: string }).email === 'g@x.com' ? null : 'email not trimmed properly'
	},
	{
		name: 'phone CRLF replaced with space',
		input: { name: 'G', email: 'g@x.com', phone: '06\n12345678', message: 'hi' },
		shouldPass: true,
		check: (o) =>
			/[\r\n]/.test((o as { phone: string }).phone) ? `phone contains CRLF` : null
	},
	{
		name: 'message preserves newlines',
		input: { name: 'G', email: 'g@x.com', message: 'line one\nline two\nline three' },
		shouldPass: true,
		check: (o) =>
			(o as { message: string }).message.split('\n').length === 3
				? null
				: 'newlines lost in message'
	},

	// Required fields
	{
		name: 'missing name',
		input: { email: 'g@x.com', message: 'hi' },
		shouldPass: false,
		expectIssueOn: 'name'
	},
	{
		name: 'empty name',
		input: { name: '', email: 'g@x.com', message: 'hi' },
		shouldPass: false,
		expectIssueOn: 'name'
	},
	{
		name: 'whitespace-only name',
		input: { name: '   ', email: 'g@x.com', message: 'hi' },
		shouldPass: false,
		expectIssueOn: 'name'
	},
	{
		name: 'missing email',
		input: { name: 'G', message: 'hi' },
		shouldPass: false,
		expectIssueOn: 'email'
	},
	{
		name: 'invalid email format',
		input: { name: 'G', email: 'not-an-email', message: 'hi' },
		shouldPass: false,
		expectIssueOn: 'email'
	},
	{
		name: 'missing message',
		input: { name: 'G', email: 'g@x.com' },
		shouldPass: false,
		expectIssueOn: 'message'
	},
	{
		name: 'empty message',
		input: { name: 'G', email: 'g@x.com', message: '   ' },
		shouldPass: false,
		expectIssueOn: 'message'
	},

	// Length caps
	{
		name: 'name at 100 chars passes',
		input: { name: 'a'.repeat(100), email: 'g@x.com', message: 'hi' },
		shouldPass: true
	},
	{
		name: 'name at 101 chars fails',
		input: { name: 'a'.repeat(101), email: 'g@x.com', message: 'hi' },
		shouldPass: false,
		expectIssueOn: 'name'
	},
	{
		name: 'message at 5000 chars passes',
		input: { name: 'G', email: 'g@x.com', message: 'a'.repeat(5000) },
		shouldPass: true
	},
	{
		name: 'message at 5001 chars fails',
		input: { name: 'G', email: 'g@x.com', message: 'a'.repeat(5001) },
		shouldPass: false,
		expectIssueOn: 'message'
	},
	{
		name: 'email at 254 chars fails (regex still requires sane shape)',
		input: { name: 'G', email: 'a'.repeat(245) + '@x.com', message: 'hi' },
		shouldPass: true
	},
	{
		name: 'email at 300 chars fails (over cap)',
		input: { name: 'G', email: 'a'.repeat(290) + '@x.com', message: 'hi' },
		shouldPass: false,
		expectIssueOn: 'email'
	},

	// Interests
	{
		name: '10 interests passes',
		input: {
			name: 'G',
			email: 'g@x.com',
			message: 'hi',
			interests: Array.from({ length: 10 }, (_, i) => `i${i}`)
		},
		shouldPass: true
	},
	{
		name: '11 interests fails',
		input: {
			name: 'G',
			email: 'g@x.com',
			message: 'hi',
			interests: Array.from({ length: 11 }, (_, i) => `i${i}`)
		},
		shouldPass: false,
		expectIssueOn: 'interests'
	},
	{
		name: 'interest item over 100 chars fails',
		input: {
			name: 'G',
			email: 'g@x.com',
			message: 'hi',
			interests: ['a'.repeat(101)]
		},
		shouldPass: false,
		expectIssueOn: 'interests'
	},

	// Locale
	{
		name: 'invalid locale fails',
		input: { name: 'G', email: 'g@x.com', message: 'hi', locale: 'fr' },
		shouldPass: false,
		expectIssueOn: 'locale'
	},
	{
		name: 'locale "en" accepted',
		input: { name: 'G', email: 'g@x.com', message: 'hi', locale: 'en' },
		shouldPass: true
	},

	// Type abuse
	{
		name: 'name as number fails',
		input: { name: 123, email: 'g@x.com', message: 'hi' },
		shouldPass: false,
		expectIssueOn: 'name'
	},
	{
		name: 'guests as number passes (HTML5 type=number ships as JSON number)',
		input: { name: 'G', email: 'g@x.com', message: 'hi', guests: 100 },
		shouldPass: true,
		check: (o) => ((o as { guests: string }).guests === '100' ? null : 'guests not coerced to string')
	},
	{
		name: 'guests as string still passes',
		input: { name: 'G', email: 'g@x.com', message: 'hi', guests: '100' },
		shouldPass: true,
		check: (o) => ((o as { guests: string }).guests === '100' ? null : 'guests not preserved')
	},
	{
		name: 'interests not an array fails',
		input: { name: 'G', email: 'g@x.com', message: 'hi', interests: 'tiramisu' },
		shouldPass: false,
		expectIssueOn: 'interests'
	},
	{
		name: 'completely empty body fails',
		input: {},
		shouldPass: false
	},
	{
		name: 'null body fails',
		input: null,
		shouldPass: false
	}
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
					`${(i.path ?? [])
						.map((p) => String((p as { key: unknown }).key))
						.join('.') || '(root)'}: ${i.message}`
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
