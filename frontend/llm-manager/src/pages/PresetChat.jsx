import React, { useEffect, useState, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { useParams } from 'react-router-dom';

const WS_URL = 'ws://127.0.0.1:8000/inference/ws';
const API_URL = 'http://127.0.0.1:8000';

const PresetChat = () => {
  const { presetId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [presetName, setPresetName] = useState(''); // 🔹 preset name from API

  const wsRef = useRef(null);
  const scrollRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const loadPreset = async () => {
      try {
        const presetInfo = await fetch(`${API_URL}/presets/${presetId}`);
        if (presetInfo.ok) {
          const presetData = await presetInfo.json();
          setPresetName(presetData.public_name);
        } else {
          setPresetName('Unknown Preset');
        }

        await fetch(`${API_URL}/inference/load/${presetId}`, {
          method: 'POST',
        });

        wsRef.current = new WebSocket(WS_URL);
        wsRef.current.onopen = () => setLoading(false);
        wsRef.current.onerror = () => alert('WebSocket connection failed');
      } catch (err) {
        console.error('Failed to load preset', err);
        alert('Failed to load preset');
      }
    };

    loadPreset();

    return () => {
      wsRef.current?.close();
      clearTimeout(timeoutRef.current);
    };
  }, [presetId]);

  const handleSend = () => {
    if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const userMessage = { role: 'user', content: input.trim() };
    const assistantMessage = { role: 'assistant', content: '' };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput('');
    setSending(true);

    wsRef.current.send(userMessage.content);

    timeoutRef.current = setTimeout(() => {
      setSending(false);
    }, 10000);

    wsRef.current.onmessage = (event) => {
      const token = event.data;

      if (token === '__END__') {
        clearTimeout(timeoutRef.current);
        setSending(false);
        return;
      }

      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];

        const isWhitespace = /^\s*$/.test(token);
        if (!isWhitespace && last.content.endsWith(token)) return prev;

        last.content += token;
        return updated;
      });

      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    wsRef.current.onclose = () => {
      clearTimeout(timeoutRef.current);
      setSending(false);
    };
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-blue-100 text-blue-700">
        Loading preset...
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-blue-100">
      <Sidebar />

      <div className="flex flex-col flex-1 h-full min-h-0 min-w-0 bg-blue-100 pr-4">
        {/* Header */}
        <div className="px-4 py-4 text-lg font-semibold text-blue-700 flex items-center gap-2">
          <span className="inline-block text-xl">⚙</span>
          {presetName}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`max-w-[70%] px-4 py-3 rounded-xl shadow border text-sm whitespace-pre-wrap break-words ${
                msg.role === 'user'
                  ? 'ml-auto bg-blue-100 border-blue-300 text-blue-700'
                  : 'mr-auto bg-white border-gray-200 text-gray-800 text-left'
              }`}
            >
              {msg.content}
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t bg-blue-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 border border-gray-300 shadow-sm"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending}
              placeholder={sending ? 'Waiting for model...' : 'Type your message...'}
              className="flex-1 bg-transparent text-sm text-gray-800 focus:outline-none disabled:text-gray-400"
            />
            <button
              type="submit"
              className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
              disabled={sending}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default PresetChat;
