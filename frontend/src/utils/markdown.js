/**
 * Simple Markdown to HTML converter
 * Handles: bold (**text**), italic (*text*), line breaks, paragraphs, lists
 */

export const markdownToHtml = (markdown) => {
  if (!markdown) return '';
  
  let html = markdown;
  
  // First, handle bold (**text** or __text__) - must come before italic
  // Use non-greedy matching and handle multiple instances
  html = html.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_]+?)__/g, '<strong>$1</strong>');
  
  // Then handle italic (*text* or _text_) - but not if part of **
  // Only match single * that's not part of **
  html = html.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em>$1</em>');
  html = html.replace(/(?<!_)_([^_\n]+?)_(?!_)/g, '<em>$1</em>');
  
  // Convert line breaks to <br/>
  html = html.replace(/\n/g, '<br/>');
  
  // Convert paragraphs (double <br/>)
  html = html.replace(/<br\/><br\/>/g, '</p><p>');
  html = '<p>' + html + '</p>';
  
  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p><br\/><\/p>/g, '');
  html = html.replace(/<p>\s*<\/p>/g, '');
  
  return html;
};

/**
 * HTML to Markdown converter (for editing)
 */
export const htmlToMarkdown = (html) => {
  if (!html) return '';
  
  let markdown = html;
  
  // Remove paragraph tags but keep content
  markdown = markdown.replace(/<p>/g, '');
  markdown = markdown.replace(/<\/p>/g, '\n\n');
  
  // Remove list tags
  markdown = markdown.replace(/<ul>/g, '');
  markdown = markdown.replace(/<\/ul>/g, '\n');
  markdown = markdown.replace(/<ol>/g, '');
  markdown = markdown.replace(/<\/ol>/g, '\n');
  markdown = markdown.replace(/<li>/g, '• ');
  markdown = markdown.replace(/<\/li>/g, '\n');
  
  // Convert HTML tags to markdown
  markdown = markdown.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
  markdown = markdown.replace(/<b>(.*?)<\/b>/g, '**$1**');
  markdown = markdown.replace(/<em>(.*?)<\/em>/g, '*$1*');
  markdown = markdown.replace(/<i>(.*?)<\/i>/g, '*$1*');
  
  // Convert <br/> to newlines
  markdown = markdown.replace(/<br\s*\/?>/gi, '\n');
  
  // Clean up extra newlines
  markdown = markdown.replace(/\n{3,}/g, '\n\n');
  markdown = markdown.trim();
  
  return markdown;
};
