import React, { useState, useRef, useEffect } from 'react';

export default function StoryChannelChat({
  messages,
  onSendMessage,
  onSendPhoto,
  onReact,
  onApproveSpread,
  onInspectSpread,
  currentOrder,
  role,
}) {
  const [inputText, setInputText] = useState('');
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
    { label: '📸 Upload birthday morning reference', photo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80', caption: 'Reference photo: Kabir playing in theIndiranagar living room with Dadaji.' },
    { label: '💬 Text tweak on Spread 3', text: 'For Spread 3, could Nani’s lullaby be italicized at the bottom left corner?' },
  ];

  const availableEmojis = ['❤️', '👍', '🎨', '✨', '🔄'];

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
            Speaking as: <strong style={{ color: 'var(--brand-terracotta)' }}>{role === 'client' ? 'Client (Family)' : 'Lead Illustrator'}</strong>
          </span>
        </div>
      </div>

      {/* Message Stream */}
      <div className="message-stream" ref={scrollRef}>
        {messages.map((msg) => {
          const isAi = msg.type === 'ai_summary' || msg.senderName === 'ChapterBot AI';
          const isOutgoing = !isAi && ((role === 'client' && msg.role === 'client') || (role === 'designer' && msg.role === 'designer'));
          const isDesigner = msg.role === 'designer';

          return (
            <div
              key={msg.id}
              className={`msg-bubble ${isOutgoing ? 'outgoing' : 'incoming'}`}
              style={isAi ? { alignSelf: 'center', maxWidth: '92%', width: '100%' } : {}}
            >
              <div className="msg-header">
                <span style={{ fontWeight: '600', color: isDesigner ? 'var(--brand-terracotta)' : isAi ? '#9c6c19' : 'var(--text-ink)' }}>
                  {msg.senderName || (isDesigner ? 'Pooja (Lead Illustrator)' : isAi ? 'ChapterBot AI' : 'Client')}
                </span>
                <span>•</span>
                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {msg.read && <span style={{ color: 'var(--sage-green)' }}>✓✓ Read</span>}
              </div>

              <div
                className={`msg-content-card ${isDesigner ? 'designer-card' : ''} ${isAi ? 'ai-card' : ''}`}
                style={{ position: 'relative' }}
              >
                <div>{msg.text}</div>

                {/* If message has an uploaded photo */}
                {msg.imageUrl && (
                  <div style={{ marginTop: '10px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-linen)', maxWidth: '320px' }}>
                    <img src={msg.imageUrl} alt="Uploaded reference" style={{ width: '100%', display: 'block', maxHeight: '200px', objectFit: 'cover' }} />
                  </div>
                )}

                {/* If message has an attached spread proof */}
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

                {/* Reactions display & Quick Reaction Picker */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed #eae2d3' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {msg.reactions && msg.reactions.length > 0 ? (
                      msg.reactions.map((r, i) => (
                        <span
                          key={i}
                          onClick={() => onReact(msg.id, r.emoji)}
                          style={{
                            background: 'rgba(0,0,0,0.05)',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          {r.emoji} {r.count}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>React:</span>
                    )}
                  </div>

                  {/* Reaction quick emojis */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {availableEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => onReact(msg.id, emoji)}
                        style={{
                          fontSize: '12px',
                          padding: '2px 5px',
                          borderRadius: '4px',
                          background: 'transparent',
                          transition: 'transform 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.25)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        title={`React with ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Bar */}
      <div className="chat-input-container">
        {/* Quick prompt suggestions */}
        <div className="quick-prompts-row">
          <span style={{ fontSize: '11px', color: 'var(--text-light)', whiteSpace: 'nowrap' }}>Quick actions:</span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              className="quick-prompt-pill"
              onClick={() => {
                if (p.photo) {
                  onSendPhoto(p.photo, p.caption);
                } else {
                  onSendMessage(p.text);
                }
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input box */}
        <form onSubmit={handleSubmit} className="input-box-row">
          <button
            type="button"
            onClick={() => {
              onSendPhoto(
                'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
                'Uploaded reference memory photo: Living room celebration.'
              );
            }}
            title="Attach a memory photo"
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-linen)',
              background: 'var(--bg-parchment)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-muted)',
            }}
          >
            <span>📸</span>
            <span style={{ fontSize: '12px' }}>Photo</span>
          </button>

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
