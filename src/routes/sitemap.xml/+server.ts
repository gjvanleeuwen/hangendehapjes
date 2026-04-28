import { BUILD_DATE, ROUTES, SITE_URL } from '$lib/site-config';
import type { RequestHandler } from './$types';

export const prerender = true;

const altUrlNl = SITE_URL + ROUTES.nl;
const altUrlEn = SITE_URL + ROUTES.en;

const lastmod = BUILD_DATE.slice(0, 10);

type UrlEntry = {
	loc: string;
	priority: string;
	alternates?: boolean;
};

const urls: UrlEntry[] = [
	{ loc: altUrlNl, priority: '1.0', alternates: true },
	{ loc: altUrlEn, priority: '0.8', alternates: true },
	{ loc: SITE_URL + '/blog/hoeveel-hapjes-per-persoon', priority: '0.7' }
];

export const GET: RequestHandler = async () => {
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls
	.map(
		({ loc, priority, alternates }) => `  <url>
    <loc>${loc}</loc>${
			alternates
				? `
    <xhtml:link rel="alternate" hreflang="nl" href="${altUrlNl}" />
    <xhtml:link rel="alternate" hreflang="en" href="${altUrlEn}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${altUrlNl}" />`
				: ''
		}
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`
	)
	.join('\n')}
</urlset>
`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
