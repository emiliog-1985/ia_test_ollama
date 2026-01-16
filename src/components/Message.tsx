import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { User, Copy, Check, Bot } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export const Message: React.FC<MessageProps> = ({ role, content }) => {
  const isUser = role === 'user';
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className={`d-flex gap-3 py-3 w-100 fade-in ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>

      {/* Avatar */}
      <div
        className={`d-flex align-items-center justify-content-center rounded-circle border flex-shrink-0 ${isUser ? 'bg-light' : 'bg-white'}`}
        style={{ width: 32, height: 32 }}
      >
        {isUser ? <User size={16} className="text-secondary" /> : <Bot size={18} className="text-dark" />}
      </div>

      <div className={`flex-grow-1 ${isUser ? 'text-end' : 'text-start'}`} style={{ maxWidth: '85%' }}>
        <div className={`d-inline-block text-start w-100 ${isUser ? 'bg-light rounded-4 py-3 px-4 border' : 'py-3'}`}>
          {isUser ? (
            <p className="m-0 text-dark" style={{ whiteSpace: 'pre-wrap' }}>{content}</p>
          ) : (
            <div className="markdown-content text-dark w-100">
              <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeContent = String(children).replace(/\n$/, '');
                    const codeIndex = node?.position?.start?.offset || 0;

                    return !inline && match ? (
                      <div className="rounded overflow-hidden my-3 border bg-white">
                        <div className="d-flex align-items-center justify-content-between px-3 py-2 bg-light border-bottom">
                          <span className="small font-monospace text-muted">{match[1]}</span>
                          <button
                            onClick={() => handleCopy(codeContent, codeIndex)}
                            className="btn btn-sm btn-link text-decoration-none text-muted p-0 d-flex align-items-center gap-1"
                          >
                            {copiedIndex === codeIndex ? (
                              <><Check size={14} /> Copied</>
                            ) : (
                              <><Copy size={14} /> Copy</>
                            )}
                          </button>
                        </div>
                        <SyntaxHighlighter
                          style={oneLight}
                          language={match[1]}
                          PreTag="div"
                          customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
                          {...props}
                        >
                          {codeContent}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
