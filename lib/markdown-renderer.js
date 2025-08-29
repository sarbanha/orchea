/**
 * Markdown Renderer - Simple Markdown to HTML converter
 */
class MarkdownRenderer {
    static render(markdown) {
        let html = markdown;

        // Headers
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

        // Bold
        html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');

        // Italic
        html = html.replace(/\*(.*)\*/gim, '<em>$1</em>');

        // Code blocks
        html = html.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>');

        // Inline code
        html = html.replace(/`([^`]*)`/gim, '<code>$1</code>');

        // Links
        html = html.replace(/\[([^\]]*)\]\(([^\)]*)\)/gim, '<a href="$2">$1</a>');

        // Lists
        html = html.replace(/^\d+\.\s(.*)$/gim, '<li>$1</li>');
        html = html.replace(/^-\s(.*)$/gim, '<li>$1</li>');
        
        // Wrap consecutive list items in ul/ol tags
        html = html.replace(/(<li>.*<\/li>)/gims, function(match) {
            if (match.includes('1.')) {
                return '<ol>' + match + '</ol>';
            } else {
                return '<ul>' + match + '</ul>';
            }
        });

        // Paragraphs
        html = html.replace(/\n\n/gim, '</p><p>');
        html = '<p>' + html + '</p>';

        // Clean up empty paragraphs
        html = html.replace(/<p><\/p>/gim, '');
        html = html.replace(/<p>(<h[1-6]>)/gim, '$1');
        html = html.replace(/(<\/h[1-6]>)<\/p>/gim, '$1');
        html = html.replace(/<p>(<pre>)/gim, '$1');
        html = html.replace(/(<\/pre>)<\/p>/gim, '$1');
        html = html.replace(/<p>(<ul>|<ol>)/gim, '$1');
        html = html.replace(/(<\/ul>|<\/ol>)<\/p>/gim, '$1');

        return html;
    }
}
