import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import OrderSidebar from './components/OrderSidebar.jsx';
import StoryChannelChat from './components/StoryChannelChat.jsx';
import AiAssistantSidebar from './components/AiAssistantSidebar.jsx';
import SpreadModal from './components/SpreadModal.jsx';
import nexconn from './nexconnService.js';

export default function App() {
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [role, setRole] = useState('client'); // 'client' or 'designer'
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inspectingSpread, setInspectingSpread] = useState(null);

  // 1. Fetch orders on mount
  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        if (data.length > 0) {
          setCurrentOrder(data[0]);
        }
      })
      .catch((err) => console.error('Failed to load sample orders:', err));
  }, []);

  // 2. Setup session and connect to Nexconn Chat SDK
  useEffect(() => {
    if (!currentOrder) return;

    let unsubscribeMsg = null;
    let unsubscribeStatus = null;

    async function initSession() {
      try {
        setConnectionStatus('connecting');

        // Request token from our backend (which calls Nexconn Auth API)
        const res = await fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: role === 'client' ? currentOrder.clientName : 'Pooja (Lead Illustrator)',
            orderId: currentOrder.orderId,
            role: role,
            bookTitle: currentOrder.bookTitle,
          }),
        });

        const sessionData = await res.json();
        setSession(sessionData);

        // Fetch app config
        const configRes = await fetch('/api/config');
        const configData = await configRes.json();

        // Initialize Nexconn Chat SDK
        await nexconn.initAndConnect(configData.appKey, sessionData.token, sessionData.userId);
        nexconn.setStoryChannel(sessionData.channelId);

        unsubscribeStatus = nexconn.onStatusChange((status) => {
          setConnectionStatus(status);
        });

        // Listen for new messages
        unsubscribeMsg = nexconn.onMessage((newMsg) => {
          setMessages((prev) => {
            // avoid duplicate id
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        });

        // Seed initial rich story context for the order
        const seedMessages = [
          {
            id: 'seed-1',
            senderName: 'Meera (Client)',
            role: 'client',
            text: `Hi Pooja! We've uploaded all photos for ${currentOrder.bookTitle}. Especially excited about the morning raga scene with Kabir and his grandfather!`,
            timestamp: Date.now() - 3600000 * 4,
            read: true,
          },
          {
            id: 'seed-2',
            senderName: 'Pooja (Lead Illustrator)',
            role: 'designer',
            text: `Welcome Meera & Rohan! The photos of Kabir at Cubbon Park and by the French window are heartwarming. I've finished the watercolor proof for Spread 2 below:`,
            timestamp: Date.now() - 3600000 * 2,
            spread: currentOrder.activeDrafts?.[1] || currentOrder.activeDrafts?.[0],
            read: true,
          },
          {
            id: 'seed-3',
            senderName: 'ChapterBot AI',
            role: 'ai',
            type: 'ai_summary',
            text: `📌 Story Milestone: Spread 1 approved. Spread 2 proof is currently open for family review. You can react or click 'Approve for Print' once ready.`,
            timestamp: Date.now() - 3600000,
            read: true,
          },
        ];

        setMessages(seedMessages);
      } catch (err) {
        console.error('Session initialization error:', err);
      }
    }

    initSession();

    return () => {
      if (unsubscribeMsg) unsubscribeMsg();
      if (unsubscribeStatus) unsubscribeStatus();
    };
  }, [currentOrder?.orderId, role]);

  // 3. Handle sending new messages
  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const senderName = role === 'client' ? currentOrder?.clientName || 'Meera' : 'Pooja (Lead Illustrator)';

    await nexconn.sendTextMessage(text, {
      senderName,
      role,
      orderId: currentOrder?.orderId,
    });
  };

  // 4. Handle reacting to messages
  const handleReact = (messageId, emoji) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === messageId) {
          const reactions = m.reactions || [];
          const existing = reactions.find((r) => r.emoji === emoji);
          let updatedReactions;
          if (existing) {
            updatedReactions = reactions.map((r) =>
              r.emoji === emoji ? { ...r, count: r.count + 1 } : r
            );
          } else {
            updatedReactions = [...reactions, { emoji, count: 1 }];
          }
          return { ...m, reactions: updatedReactions };
        }
        return m;
      })
    );
  };

  // 5. Handle approving a spread
  const handleApproveSpread = (spreadNum) => {
    // Update local order state
    setCurrentOrder((prev) => {
      if (!prev) return prev;
      const approved = new Set(prev.approvedSpreads || []);
      approved.add(spreadNum);
      const drafts = (prev.activeDrafts || []).map((d) =>
        d.spreadNum === spreadNum ? { ...d, status: 'approved' } : d
      );
      return {
        ...prev,
        approvedSpreads: Array.from(approved),
        activeDrafts: drafts,
      };
    });

    // Send announcement to chat
    handleSendMessage(
      `🎉 Spread ${spreadNum} has been officially approved for fine art printing! The Chapter Co. craft atelier has scheduled this for Japanese layflat binding.`
    );
  };

  // 6. Handle AI summary addition to chat
  const handlePostAiSummary = (aiData) => {
    const summaryMsg = {
      id: 'ai-post-' + Date.now(),
      senderName: 'ChapterBot AI',
      role: 'ai',
      type: 'ai_summary',
      text: `📋 AI Studio Brief Updated: ${aiData.actionItems?.length || 3} revisions captured. ${aiData.summary}`,
      timestamp: Date.now(),
      read: true,
    };
    setMessages((prev) => [...prev, summaryMsg]);
  };

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <Header
        currentOrder={currentOrder}
        role={role}
        onToggleRole={(newRole) => setRole(newRole)}
        connectionStatus={connectionStatus}
        orders={orders}
        onSelectOrder={(ord) => setCurrentOrder(ord)}
      />

      {/* Main Grid Workspace */}
      <div className="workspace-grid">
        {/* Left: Keepsake Order Details & Spreads */}
        <OrderSidebar
          order={currentOrder}
          onSelectSpread={(draft) => setInspectingSpread(draft)}
          onOpenApprovalModal={() => {}}
        />

        {/* Center: Real-Time Chat & Proofing Feed */}
        <StoryChannelChat
          messages={messages}
          onSendMessage={handleSendMessage}
          onReact={handleReact}
          onApproveSpread={handleApproveSpread}
          onInspectSpread={(draft) => setInspectingSpread(draft)}
          currentOrder={currentOrder}
          role={role}
        />

        {/* Right: ChapterBot AI Assistant & Specs */}
        <AiAssistantSidebar
          currentOrder={currentOrder}
          messages={messages}
          onPostAiSummary={handlePostAiSummary}
        />
      </div>

      {/* High-Res Proof Inspection Modal */}
      <SpreadModal
        spread={inspectingSpread}
        onClose={() => setInspectingSpread(null)}
        onApprove={(num) => handleApproveSpread(num)}
      />
    </div>
  );
}
