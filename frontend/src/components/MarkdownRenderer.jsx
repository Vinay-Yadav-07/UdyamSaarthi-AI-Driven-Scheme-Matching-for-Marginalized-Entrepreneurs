import React from 'react';

/**
 * Safely parses and renders Markdown formatted text into React elements.
 * Supports:
 * - Bold text (**text** or __text__)
 * - Headers (#, ##, ###)
 * - Bullet lists (*, -, •)
 * - Numbered lists (1., 2., etc.)
 * - Code blocks (```...```)
 * - Inline code (`...`)
 */
export default function MarkdownRenderer({ content = '', className = '' }) {
  if (!content) return null;

  // Function to parse inline formatting like **bold** and `code`
  const parseInline = (text) => {
    // Split by bold (**...** or __...__) and inline code (`...`)
    const parts = [];
    const regex = /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const token = match[0];
      if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(<strong key={match.index} className="font-black text-slate-900">{token.slice(2, -2)}</strong>);
      } else if (token.startsWith('__') && token.endsWith('__')) {
        parts.push(<strong key={match.index} className="font-black text-slate-900">{token.slice(2, -2)}</strong>);
      } else if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(<code key={match.index} className="bg-slate-100 px-1.5 py-0.5 rounded text-amber-800 text-xs font-mono">{token.slice(1, -1)}</code>);
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Split content by code blocks first
  const blocks = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className={`space-y-2 leading-relaxed text-slate-800 ${className}`}>
      {blocks.map((block, bIdx) => {
        if (block.startsWith('```') && block.endsWith('```')) {
          const codeContent = block.slice(3, -3).replace(/^[a-z]+\n/, '');
          return (
            <pre key={bIdx} className="bg-slate-900 text-slate-100 p-3 rounded-xl text-xs font-mono overflow-x-auto my-2 border border-slate-800">
              <code>{codeContent}</code>
            </pre>
          );
        }

        // Split regular block into lines
        const lines = block.split('\n');
        const renderedElements = [];
        let currentList = null;
        let listType = null;

        lines.forEach((line, lIdx) => {
          const trimmed = line.trim();

          if (!trimmed) {
            if (currentList) {
              renderedElements.push(
                listType === 'ul' ? (
                  <ul key={`list-${lIdx}`} className="list-disc list-inside space-y-1 my-1 pl-2 text-xs sm:text-sm">
                    {currentList}
                  </ul>
                ) : (
                  <ol key={`list-${lIdx}`} className="list-decimal list-inside space-y-1 my-1 pl-2 text-xs sm:text-sm">
                    {currentList}
                  </ol>
                )
              );
              currentList = null;
              listType = null;
            }
            return;
          }

          // Headers
          if (trimmed.startsWith('### ')) {
            renderedElements.push(
              <h3 key={lIdx} className="text-base font-extrabold text-slate-900 mt-3 mb-1">
                {parseInline(trimmed.slice(4))}
              </h3>
            );
          } else if (trimmed.startsWith('## ')) {
            renderedElements.push(
              <h2 key={lIdx} className="text-lg font-black text-slate-900 mt-4 mb-1">
                {parseInline(trimmed.slice(3))}
              </h2>
            );
          } else if (trimmed.startsWith('# ')) {
            renderedElements.push(
              <h1 key={lIdx} className="text-xl font-black text-slate-900 mt-4 mb-2">
                {parseInline(trimmed.slice(2))}
              </h1>
            );
          }
          // Bullet lists (*, -, •)
          else if (/^[*•-]\s+/.test(trimmed)) {
            const itemText = trimmed.replace(/^[*•-]\s+/, '');
            if (!currentList || listType !== 'ul') {
              if (currentList) {
                renderedElements.push(
                  <ol key={`list-${lIdx}`} className="list-decimal list-inside space-y-1 my-1 pl-2 text-xs sm:text-sm">
                    {currentList}
                  </ol>
                );
              }
              currentList = [];
              listType = 'ul';
            }
            currentList.push(<li key={lIdx}>{parseInline(itemText)}</li>);
          }
          // Numbered lists (1., 2., etc.)
          else if (/^\d+\.\s+/.test(trimmed)) {
            const itemText = trimmed.replace(/^\d+\.\s+/, '');
            if (!currentList || listType !== 'ol') {
              if (currentList) {
                renderedElements.push(
                  <ul key={`list-${lIdx}`} className="list-disc list-inside space-y-1 my-1 pl-2 text-xs sm:text-sm">
                    {currentList}
                  </ul>
                );
              }
              currentList = [];
              listType = 'ol';
            }
            currentList.push(<li key={lIdx}>{parseInline(itemText)}</li>);
          }
          // Normal Paragraph Line
          else {
            if (currentList) {
              renderedElements.push(
                listType === 'ul' ? (
                  <ul key={`list-${lIdx}`} className="list-disc list-inside space-y-1 my-1 pl-2 text-xs sm:text-sm">
                    {currentList}
                  </ul>
                ) : (
                  <ol key={`list-${lIdx}`} className="list-decimal list-inside space-y-1 my-1 pl-2 text-xs sm:text-sm">
                    {currentList}
                  </ol>
                )
              );
              currentList = null;
              listType = null;
            }
            renderedElements.push(
              <p key={lIdx} className="text-xs sm:text-sm text-slate-800">
                {parseInline(line)}
              </p>
            );
          }
        });

        if (currentList) {
          renderedElements.push(
            listType === 'ul' ? (
              <ul key={`list-end`} className="list-disc list-inside space-y-1 my-1 pl-2 text-xs sm:text-sm">
                {currentList}
              </ul>
            ) : (
              <ol key={`list-end`} className="list-decimal list-inside space-y-1 my-1 pl-2 text-xs sm:text-sm">
                {currentList}
              </ol>
            )
          );
        }

        return <React.Fragment key={bIdx}>{renderedElements}</React.Fragment>;
      })}
    </div>
  );
}
