import React, { useState, useEffect, useRef } from 'react';
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
  const [orderMessages, setOrderMessages] = useState({});
  const [inspectingSpread, setInspectingSpread] = useState(null);

  const roleRef = useRef(role);
  roleRef.current = role;

  const currentOrderRef = useRef(currentOrder);
  currentOrderRef.current = currentOrder;

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

  // 2. Setup session and connect to Nexconn Chat SDK when currentOrder changes
  useEffect(() => {
    if (!currentOrder) return;

    let unsubscribeMsg = null;
    let unsubscribeStatus = null;

    async function initSession() {
      try {
        setConnectionStatus('connecting');

        const activeRole = roleRef.current;
        const senderDisplayName =
          activeRole === 'client'
            ? currentOrder.clientName || 'Client'
            : currentOrder.leadDesigner || 'Pooja (Lead Illustrator)';

        // Request token from our backend (which calls Nexconn Auth API)
        const res = await fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: senderDisplayName,
            orderId: currentOrder.orderId,
            role: activeRole,
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
          const ordId = currentOrderRef.current?.orderId;
          if (!ordId) return;

          setOrderMessages((prevMap) => {
            const list = prevMap[ordId] || [];
            if (list.some((m) => m.id === newMsg.id)) return prevMap;
            return {
              ...prevMap,
              [ordId]: [...list, newMsg],
            };
          });
        });

        // Seed initial rich story context for the order if not already initialized
        setOrderMessages((prevMap) => {
          if (prevMap[currentOrder.orderId] && prevMap[currentOrder.orderId].length > 0) {
            return prevMap;
          }

          const seedSpread =
            currentOrder.activeDrafts?.[1] || currentOrder.activeDrafts?.[0] || null;

          const seedMessages = [
            {
              id: `seed-1-${currentOrder.orderId}`,
              senderName: `${currentOrder.clientName} (Client)`,
              role: 'client',
              text: `Hi Pooja! We've uploaded all photos for ${currentOrder.bookTitle}. Especially excited about the morning raga scene with grandfather!`,
              timestamp: Date.now() - 3600000 * 4,
              read: true,
            },
            {
              id: `seed-2-${currentOrder.orderId}`,
              senderName: currentOrder.leadDesigner || 'Pooja (Lead Illustrator)',
              role: 'designer',
              text: `Welcome! The reference photos are heartwarming. I've finished the watercolor proof for Spread ${seedSpread ? seedSpread.spreadNum : 1} below for your review:`,
              timestamp: Date.now() - 3600000 * 2,
              spread: seedSpread,
              read: true,
            },
            {
              id: `seed-3-${currentOrder.orderId}`,
              senderName: 'ChapterBot AI',
              role: 'ai',
              type: 'ai_summary',
              text: `📌 Story Milestone: Spread 1 approved. Spread ${seedSpread ? seedSpread.spreadNum : 2} proof is currently open for family review. You can react or click 'Approve for Print' once ready.`,
              timestamp: Date.now() - 3600000,
              read: true,
            },
          ];

          return {
            ...prevMap,
            [currentOrder.orderId]: seedMessages,
          };
        });
      } catch (err) {
        console.error('Session initialization error:', err);
      }
    }

    initSession();

    return () => {
      if (unsubscribeMsg) unsubscribeMsg();
      if (unsubscribeStatus) unsubscribeStatus();
    };
  }, [currentOrder?.orderId]);

  // Current active messages for this order
  const messages = (currentOrder && orderMessages[currentOrder.orderId]) || [];

  // 3. Handle sending new text message
  const handleSendMessage = async (text, extra = {}) => {
    if (!text.trim() || !currentOrder) return;

    const senderName =
      role === 'client'
        ? currentOrder.clientName || 'Meera'
        : currentOrder.leadDesigner || 'Pooja (Lead Illustrator)';

    await nexconn.sendTextMessage(text, {
      senderName,
      role,
      orderId: currentOrder.orderId,
      ...extra,
    });
  };

  // 4. Handle sending photo
  const handleSendPhoto = async (imageUrl, caption) => {
    if (!currentOrder) return;
    await handleSendMessage(caption || 'Shared reference memory photo for our storybook.', {
      imageUrl,
      type: 'photo_share',
    });
  };

  // 5. Handle reacting to messages
  const handleReact = (messageId, emoji) => {
    if (!currentOrder) return;

    setOrderMessages((prevMap) => {
      const list = prevMap[currentOrder.orderId] || [];
      const updatedList = list.map((m) => {
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
      });

      return {
        ...prevMap,
        [currentOrder.orderId]: updatedList,
      };
    });
  };

  // 6. Handle approving a spread
  const handleApproveSpread = (spreadNum) => {
    if (!currentOrder) return;

    const approvedSet = new Set(currentOrder.approvedSpreads || []);
    approvedSet.add(spreadNum);
    const updatedApproved = Array.from(approvedSet);

    const updatedDrafts = (currentOrder.activeDrafts || []).map((d) =>
      d.spreadNum === spreadNum ? { ...d, status: 'approved' } : d
    );

    const updatedOrder = {
      ...currentOrder,
      approvedSpreads: updatedApproved,
      activeDrafts: updatedDrafts,
    };

    setCurrentOrder(updatedOrder);

    // Also update orders directory list
    setOrders((prevOrders) =>
      prevOrders.map((o) => (o.orderId === currentOrder.orderId ? updatedOrder : o))
    );

    // Send announcement to chat
    handleSendMessage(
      `🎉 Spread ${spreadNum} has been officially approved for fine art printing! The Chapter Co. craft atelier has scheduled this for Japanese layflat binding.`
    );
  };

  // 7. Handle AI summary addition to chat
  const handlePostAiSummary = (aiData) => {
    if (!currentOrder) return;
    const summaryMsg = {
      id: 'ai-post-' + Date.now(),
      senderName: 'ChapterBot AI',
      role: 'ai',
      type: 'ai_summary',
      text: `📋 AI Studio Brief Updated: ${aiData.actionItems?.length || 3} revisions captured. ${aiData.summary}`,
      timestamp: Date.now(),
      read: true,
    };

    setOrderMessages((prevMap) => ({
      ...prevMap,
      [currentOrder.orderId]: [...(prevMap[currentOrder.orderId] || []), summaryMsg],
    }));
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
          onSendPhoto={handleSendPhoto}
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
