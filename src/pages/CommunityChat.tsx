import { useState, useEffect, useRef } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Send, Users, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChatMessage {
  id: string;
  user_id: string;
  user_email: string;
  message: string;
  created_at: string;
}

const CommunityChat = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/verify?redirect=/community');
      return;
    }
    if (!user) return;

    // Fetch existing messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);
      if (data) setMessages(data);
    };
    fetchMessages();

    // Subscribe to realtime
    const channel = supabase
      .channel('community-chat')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'chat_messages' },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== (payload.old as any).id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loading, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;
    setSending(true);
    await supabase.from('chat_messages').insert({
      user_id: user.id,
      user_email: user.email || 'Anonymous',
      message: newMessage.trim(),
    });
    setNewMessage('');
    setSending(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('chat_messages').delete().eq('id', id);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-6 flex flex-col max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Community Chat</h1>
            <p className="text-sm text-muted-foreground">Connect with the community and admins in real time</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 bg-card border border-border rounded-2xl p-4 overflow-y-auto mb-4 min-h-[400px] max-h-[60vh] space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              No messages yet. Start the conversation! 🎉
            </div>
          )}
          {messages.map((msg) => {
            const isOwn = msg.user_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold opacity-80">
                      {msg.user_email?.split('@')[0]}
                    </span>
                    {isAdmin && !isOwn && (
                      <button
                        onClick={() => handleDelete(msg.id)}
                        className="text-xs opacity-60 hover:opacity-100"
                        title="Delete message"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed">{msg.message}</p>
                  <span className="text-[10px] opacity-60 mt-1 block">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex gap-2"
        >
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            maxLength={500}
            className="flex-1"
          />
          <Button type="submit" disabled={sending || !newMessage.trim()} className="gap-2">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default CommunityChat;
