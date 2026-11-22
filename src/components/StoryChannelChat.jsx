import React, { useState, useRef, useEffect } from 'react';

export default function StoryChannelChat({
  messages,
  onSendMessage,
  onReact,
  onApproveSpread,
  onInspectSpread,
  currentOrder,
  role,
}) {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const quickPrompts = [
    { label: '❤️ Love Spread 2 watercolor colors!', text: 'The watercolor rendering for Spread 2 is lovely! Can we just soften Kabir’s curls slightly?' },
    { label: '✅ Approve Spread 2 for print', text: '✅ Spread 2 looks completely wonderful! We officially approve this spread for final print.' },
    { label: '📸 Upload birthday morning reference', text: 'Attached reference photo: Kabir’s red party hat from his morning puja.' },
    { label: '💬 Text tweak on Spread 3', text: 'For Spread 3, could Nani’s lullaby be italicized at the bottom left corner?' },
  ];

  return (
    <section className="chat-stage">
      {/* Top Banner */}
      <div className="chat-banner">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-ink)' }}>
              {currentOrder ? `Channel: #story-${currentOrder.orderId}` : 'Story Channel'}
            </h2>
            <span className="status-pill terracotta">
              <span className="status-dot"></span>
              <span>Nexconn GroupChannel</span>
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Direct studio collaboration between <strong>{currentOrder?.clientName || 'Client'}</strong> &amp;{' '}
            <strong>{currentOrder?.leadDesigner || 'Art Team'}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Active Role: <strong style={{ color: 'var(--brand-terracotta)' }}>{role === 'client' ? 'Client' : 'Lead Illustrator'}</strong>
          </span>
        </div>
      </div>

      {/* Message Stream */}
      <div className="message-stream" ref={scrollRef}>
        {messages.map((msg) => {
          const isOutgoing = msg.direction === 'outgoing' || (role === 'client' && msg.role === 'client') || (role === 'designer' && msg.role === 'designer');
          const isDesigner = msg.role === 'designer';
          const isAi = msg.type === 'ai_summary' || msg.senderName === 'ChapterBot AI';

          return (
            <div
              key={msg.id}
              className={`msg-bubble ${isOutgoing ? 'outgoing' : 'incoming'}`}
            >
              <div className="msg-header">
                <span style={{ fontWeight: '600', color: isDesigner ? 'var(--brand-terracotta)' : isAi ? '#9c6c19' : 'var(--text-ink)' }}>
                  {msg.senderName || (isDesigner ? 'Pooja (Lead Illustrator)' : isAi ? 'ChapterBot AI' : 'Meera (Client)')}
                </span>
                <span>•</span>
                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {msg.read && <span style={{ color: 'var(--sage-green)' }}>✓✓ Read</span>}
              </div>

              <div
                className={`msg-content-card ${isDesigner ? 'designer-card' : ''} ${isAi ? 'ai-card' : ''}`}
              >
                <div>{msg.text}</div>

                {/* If message has an attached spread image */}
                {msg.spread && (
                  <div className="spread-chat-preview">
                    <img
                      src={msg.spread.imageUrl}
                      alt={msg.spread.title}
                      onClick={() => onInspectSpread(msg.spread)}
                      style={{ cursor: 'pointer' }}
                    />
                    <div className="spread-meta-bar">
                      <div>
                        <strong style={{ fontSize: '13px' }}>Spread {msg.spread.spreadNum}: {msg.spread.title}</strong>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{msg.spread.note}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => onReact(msg.id, '❤️')}
                          style={{
                            padding: '4px 10px',
                            background: '#fdf6f4',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '12px',
                            border: '1px solid #ebd9d3',
                          }}
                        >
                          ❤️ Love it
                        </button>
                        <button
                          onClick={() => onApproveSpread(msg.spread.spreadNum)}
                          style={{
                            padding: '4px 12px',
                            background: 'var(--sage-bg)',
                            color: 'var(--sage-green)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '12px',
                            fontWeight: '600',
                            border: '1px solid rgba(56,107,82,0.3)',
                          }}
                        >
                          ✅ Approve for Print
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reactions list */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                    {msg.reactions.map((r, i) => (
                      <span
                        key={i}
                        style={{
                          background: 'rgba(0,0,0,0.05)',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                      >
                        {r.emoji} {r.count}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Bar */}
      <div className="chat-input-container">
        {/* Quick prompt suggestions */}
        <div className="quick-prompts-row">
          <span style={{ fontSize: '11px', color: 'var(--text-light)', whiteSpace: 'nowrap' }}>Quick notes:</span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              className="quick-prompt-pill"
              onClick={() => onSendMessage(p.text)}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input box */}
        <form onSubmit={handleSubmit} className="input-box-row">
          <input
            type="text"
            className="chat-input-field"
            placeholder={
              role === 'client'
                ? 'Type feedback, request tweaks on spreads, or ask questions...'
                : 'Share an updated spread sketch, color notes, or timeline update...'
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className="send-btn">
            <span>Send</span>
            <span>↵</span>
          </button>
        </form>
      </div>
    </section>
  );
}
