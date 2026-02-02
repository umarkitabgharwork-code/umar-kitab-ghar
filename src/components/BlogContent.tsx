// Safe blog content renderer - converts HTML to React elements
// This is safer than dangerouslySetInnerHTML for controlled content

interface BlogContentProps {
  content: string;
}

export function BlogContent({ content }: BlogContentProps) {
  // Split content by HTML tags and process
  const parts: React.ReactNode[] = [];
  let key = 0;

  // Simple parser for our known HTML structure
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);

  lines.forEach((line) => {
    if (line.startsWith('<h2>')) {
      const text = line.replace(/<h2>|<\/h2>/g, '').trim();
      parts.push(
        <h2 key={key++} className="text-2xl font-semibold mt-8 mb-4 text-foreground">
          {text}
        </h2>
      );
    } else if (line.startsWith('<ul>')) {
      // Handle list - find all <li> tags
      const listItems: string[] = [];
      const liMatches = line.match(/<li>(.*?)<\/li>/g);
      if (liMatches) {
        liMatches.forEach(li => {
          const text = li.replace(/<li>|<\/li>/g, '').trim();
          if (text) listItems.push(text);
        });
      }
      if (listItems.length > 0) {
        parts.push(
          <ul key={key++} className="my-4 list-disc list-inside space-y-1 text-muted-foreground">
            {listItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        );
      }
    } else if (line.startsWith('<p>')) {
      const text = line.replace(/<p>|<\/p>/g, '').trim();
      if (text) {
        parts.push(
          <p key={key++} className="text-muted-foreground leading-relaxed mb-4">
            {text}
          </p>
        );
      }
    } else if (line && !line.startsWith('<')) {
      // Plain text paragraph
      parts.push(
        <p key={key++} className="text-muted-foreground leading-relaxed mb-4">
          {line}
        </p>
      );
    }
  });

  return (
    <div className="prose prose-lg max-w-none mb-8
      prose-headings:text-foreground prose-headings:font-semibold
      prose-p:text-muted-foreground prose-p:leading-relaxed
      prose-ul:text-muted-foreground prose-li:text-muted-foreground
      prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
      prose-ul:my-4 prose-li:my-1">
      {parts}
    </div>
  );
}
