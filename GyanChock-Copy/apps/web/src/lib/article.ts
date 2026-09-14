export function extractHeadings(body?: string) {
  if (!body) return [];
  const items: Array<{ id: string; text: string; level: number }> = [];
  const used = new Map<string, number>();
  for (const line of body.split('\n')) {
    const match = /^(#{2,3})\s+(.+)$/.exec(line.trim());
    if (!match) continue;
    const text = match[2].trim();
    const base = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const n = used.get(base) ?? 0;
    used.set(base, n + 1);
    items.push({ id: n ? `${base}-${n}` : base, text, level: match[1].length });
  }
  return items;
}

export function renderArticleBlocks(body?: string) {
  const headings = extractHeadings(body);
  if (!body) return [];
  if (!headings.length) return [{ type: 'text' as const, text: body }];
  const blocks: Array<{ type: 'h2' | 'h3' | 'text'; text: string; id?: string }> = [];
  let headingIndex = 0;
  for (const line of body.split('\n')) {
    const match = /^(#{2,3})\s+(.+)$/.exec(line.trim());
    if (match) {
      const heading = headings[headingIndex++];
      blocks.push({ type: match[1].length === 2 ? 'h2' : 'h3', text: heading?.text ?? match[2], id: heading?.id });
    } else {
      const last = blocks[blocks.length - 1];
      if (last?.type === 'text') last.text += `\n${line}`;
      else blocks.push({ type: 'text', text: line });
    }
  }
  return blocks;
}
