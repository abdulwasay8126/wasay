import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Layout } from '../src/components/Layout';
import { ChatInput } from '../src/components/chat/ChatInput';
import { ChatMessage as ChatMessageView } from '../src/components/chat/ChatMessage';
import { ChatMessage } from '../src/types';
import { useRouter } from 'next/router';
import { useToast } from '../src/hooks/useToast';

export default function DashboardPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const activeTab = (router.query.tab as string) || 'chat';

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(text: string) {
    const now = new Date().toISOString();
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', text, timestamp: now };
    setMessages(prev => [...prev, userMessage]);
    setSending(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, timestamp: now })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send');
      const botText = data.reply || `Received: ${text}`;
      const botMessage: ChatMessage = { id: crypto.randomUUID(), role: 'bot', text: botText, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, botMessage]);
      addToast({ type: 'success', message: 'Message sent to webhook' });
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Webhook error' });
    } finally {
      setSending(false);
    }
  }

  const content = useMemo(() => {
    if (activeTab === 'home') {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Welcome 👋</h2>
            <p className="text-sm text-gray-600">Overview of your chat activity.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border rounded-xl p-4 shadow-sm">
              <div className="text-xs text-gray-500">Total Messages</div>
              <div className="mt-2 text-2xl font-semibold">{messages.length}</div>
            </div>
            <div className="bg-white border rounded-xl p-4 shadow-sm">
              <div className="text-xs text-gray-500">Webhook</div>
              <div className="mt-2 text-2xl font-semibold">{process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ? 'Configured' : 'Not set'}</div>
            </div>
            <div className="bg-white border rounded-xl p-4 shadow-sm">
              <div className="text-xs text-gray-500">Today</div>
              <div className="mt-2 text-2xl font-semibold">{messages.filter(m => new Date(m.timestamp).toDateString() === new Date().toDateString()).length}</div>
            </div>
            <div className="bg-white border rounded-xl p-4 shadow-sm">
              <div className="text-xs text-gray-500">Bot Replies</div>
              <div className="mt-2 text-2xl font-semibold">{messages.filter(m => m.role === 'bot').length}</div>
            </div>
          </div>
        </div>
      );
    }
    if (activeTab === 'settings') {
      return (
        <div className="space-y-6 max-w-2xl">
          <h2 className="text-xl font-semibold">Settings</h2>
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <div className="text-sm text-gray-600">Webhook URL</div>
            <div className="mt-2 text-sm">
              <code className="bg-gray-100 px-2 py-1 rounded break-all">{process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '(not set)'}</code>
            </div>
            <p className="mt-2 text-xs text-gray-500">Change this in your environment variables and redeploy.</p>
          </div>
        </div>
      );
    }
    return (
      <div className="flex flex-col h-[calc(100vh-6rem)] bg-white border rounded-2xl shadow-sm">
        <div className="flex-1 overflow-y-auto p-4 thin-scrollbar">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 text-sm">Start the conversation…</div>
          )}
          {messages.map(m => (
            <ChatMessageView key={m.id} message={m} />
          ))}
          <div ref={endRef} />
        </div>
        <div className="border-t">
          <ChatInput onSend={handleSend} />
          {sending && <div className="text-center text-xs text-gray-400 py-1">Sending…</div>}
        </div>
      </div>
    );
  }, [activeTab, messages, sending]);

  return <Layout>{content}</Layout>;
}

