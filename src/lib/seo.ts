const SCRIPT_END = '</' + 'script>';
const SCRIPT_START_LD = '<' + 'script type="application/ld+json">';

export function jsonLdScript(data: unknown): string {
	const safe = JSON.stringify(data).replaceAll(SCRIPT_END, '<\\/script>');
	return SCRIPT_START_LD + safe + SCRIPT_END;
}
