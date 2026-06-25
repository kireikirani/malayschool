export function NewsContent({ html }: { html: string }) {
  return (
    <div
      className="prose prose-neutral max-w-none"
      // News content is authored exclusively via the admin TipTap editor, not arbitrary user input.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
