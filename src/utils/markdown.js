// src/utils/markdown.js
export default function mdToHtml(md = "") {
  if (!md) return "";
  // escape HTML
  let h = md.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

  // headings ### 
  h = h.replace(/^### (.*)$/gm, "<h3>$1</h3>");
  // bold **text**
  h = h.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // links [text](url)
  h = h.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  // bullet lists: lines starting with "- " or •
  h = h.replace(/^(?:- |\u2022 )(.*)$/gm, "<li>$1</li>");
  h = h.replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>").replace(/<\/ul>\s*<ul>/g, ""); // merge adjacent ULs

  // line breaks → paragraphs (skip if block is h3 or ul)
  h = h
    .split(/\n{2,}/)
    .map((block) => {
      if (/^\s*<h3>/.test(block) || /^\s*<ul>/.test(block)) return block;
      const withBr = block.replace(/\n/g, "<br/>");
      return withBr.trim() ? `<p>${withBr}</p>` : "";
    })
    .join("\n");

  return h;
}
