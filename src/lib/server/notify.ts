import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';

type NotifyContext = {
	source: string;
	url?: string;
	method?: string;
	status?: number;
	extra?: Record<string, unknown>;
};

const escapeHtml = (s: string) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function notifyError(error: unknown, context: NotifyContext): Promise<void> {
	const token = env.TELEGRAM_BOT_TOKEN;
	const chatId = env.TELEGRAM_CHAT_ID;

	const message =
		error instanceof Error ? `${error.name}: ${error.message}` : String(error);
	const stack = error instanceof Error && error.stack ? error.stack : null;

	const lines = [
		`<b>⚠️ Hangende Hapjes — ${escapeHtml(context.source)}</b>`,
		context.method && context.url
			? `<code>${escapeHtml(context.method)} ${escapeHtml(context.url)}</code>`
			: context.url
				? `<code>${escapeHtml(context.url)}</code>`
				: null,
		context.status ? `Status: <b>${context.status}</b>` : null,
		'',
		`<b>Error:</b> <code>${escapeHtml(message)}</code>`,
		stack ? `<pre>${escapeHtml(stack.split('\n').slice(0, 8).join('\n'))}</pre>` : null,
		context.extra
			? `<pre>${escapeHtml(JSON.stringify(context.extra, null, 2))}</pre>`
			: null
	].filter((l): l is string => l !== null);

	const text = lines.join('\n');

	if (!token || !chatId) {
		if (dev) {
			console.log('[notify] dev mode, no Telegram creds — would have sent:\n', text);
		} else {
			console.error('[notify] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not configured');
		}
		return;
	}

	try {
		const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				chat_id: chatId,
				text,
				parse_mode: 'HTML',
				disable_web_page_preview: true
			})
		});
		if (!res.ok) {
			console.error('[notify] Telegram send returned', res.status, await res.text());
		}
	} catch (err) {
		console.error('[notify] Telegram fetch failed', err);
	}
}
