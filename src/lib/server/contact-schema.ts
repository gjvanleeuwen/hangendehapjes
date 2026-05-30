import * as v from 'valibot';

const HEADER_CHARS = /[<>"\\\r\n]/g;
const CRLF = /[\r\n]/g;
const CRLF_NORMALIZE = /\r\n/g;

export const PayloadSchema = v.object({
	name: v.pipe(
		v.string(),
		v.transform((s) => s.replace(HEADER_CHARS, '').trim()),
		v.minLength(1, 'name is required'),
		v.maxLength(100, 'name too long')
	),
	email: v.pipe(
		v.string(),
		v.transform((s) => s.replace(CRLF, '').trim()),
		v.maxLength(254, 'email too long'),
		v.email('invalid email')
	),
	phone: v.optional(
		v.pipe(
			v.string(),
			v.transform((s) => s.replace(CRLF, ' ').trim()),
			v.maxLength(30, 'phone too long')
		),
		''
	),
	eventDate: v.pipe(
		v.string(),
		v.transform((s) => s.replace(CRLF, ' ').trim()),
		v.minLength(1, 'eventDate is required'),
		v.maxLength(25, 'eventDate too long')
	),
	location: v.pipe(
		v.string(),
		v.transform((s) => s.replace(CRLF, ' ').trim()),
		v.minLength(1, 'location is required'),
		v.maxLength(200, 'location too long')
	),
	guests: v.pipe(
		v.union([v.string(), v.number()]),
		v.transform((s) => String(s).replace(CRLF, ' ').trim()),
		v.minLength(1, 'guests is required'),
		v.maxLength(10, 'guests too long')
	),
	serviceType: v.picklist(['hapjes', 'taart'], 'service type is required'),
	choice: v.pipe(
		v.string(),
		v.transform((s) => s.replace(CRLF, ' ').trim()),
		v.minLength(1, 'choice is required'),
		v.maxLength(120, 'choice too long')
	),
	dagdeel: v.optional(
		v.pipe(
			v.string(),
			v.transform((s) => s.replace(CRLF, ' ').trim()),
			v.maxLength(40, 'dagdeel too long')
		),
		''
	),
	servingTime: v.optional(
		v.pipe(
			v.string(),
			v.transform((s) => s.replace(CRLF, ' ').trim()),
			v.maxLength(20, 'servingTime too long')
		),
		''
	),
	referral: v.optional(
		v.pipe(
			v.string(),
			v.transform((s) => s.replace(CRLF, ' ').trim()),
			v.maxLength(200, 'referral too long')
		),
		''
	),
	message: v.pipe(
		v.string(),
		v.transform((s) => s.replace(CRLF_NORMALIZE, '\n').trim()),
		v.minLength(1, 'message is required'),
		v.maxLength(5000, 'message too long')
	),
	website: v.optional(v.string(), ''),
	locale: v.optional(v.picklist(['nl', 'en']), 'nl')
});

export type Clean = v.InferOutput<typeof PayloadSchema>;
