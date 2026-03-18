import { useState, useRef, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSupport, useSupportMessages } from '@/hooks/useSupport';
import { useAuth } from '@/hooks/useAuth';
import { MessageSquare, Send, Plus, ArrowLeft, Clock } from 'lucide-react';

const Support = () => {
  const { user } = useAuth();
  const { conversations, loading, createConversation } = useSupport();
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const [newSubject, setNewSubject] = useState('');
  const [showNew, setShowNew] = useState(false);

  const activeConvo = conversations.find(c => c.id === activeConvoId);

  const handleCreate = async () => {
    if (!newSubject.trim()) return;
    const convo = await createConversation(newSubject.trim());
    if (convo) {
      setActiveConvoId(convo.id);
      setNewSubject('');
      setShowNew(false);
    }
  };

  if (activeConvoId && activeConvo) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-6">
          <button
            onClick={() => setActiveConvoId(null)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Back to conversations
          </button>
          <div className="rounded-2xl bg-card border border-border overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 220px)' }}>
            <div className="p-4 border-b border-border bg-muted/30">
              <h2 className="font-semibold text-foreground">{activeConvo.subject}</h2>
              <p className="text-xs text-muted-foreground">
                <Badge variant={activeConvo.status === 'open' ? 'default' : 'secondary'} className="text-xs">
                  {activeConvo.status}
                </Badge>
              </p>
            </div>
            <ChatArea conversationId={activeConvoId} userId={user?.id || ''} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Support</h1>
            <p className="text-muted-foreground text-sm">Chat with our team for help</p>
          </div>
          <Button variant="hero" onClick={() => setShowNew(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Query
          </Button>
        </div>

        {showNew && (
          <div className="mb-6 p-4 rounded-xl bg-card border border-border flex gap-3">
            <Input
              placeholder="What do you need help with?"
              value={newSubject}
              onChange={e => setNewSubject(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
            <Button onClick={handleCreate}>Start Chat</Button>
            <Button variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
          </div>
        )}

        {loading ? (
          <p className="text-muted-foreground text-center py-12">Loading...</p>
        ) : conversations.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">No conversations yet</h3>
            <p className="text-muted-foreground mb-4">Start a new query to chat with our admin team</p>
            <Button variant="hero" onClick={() => setShowNew(true)}>
              <Plus className="h-4 w-4 mr-2" /> New Query
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveConvoId(c.id)}
                className="w-full text-left p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-foreground">{c.subject}</h3>
                  <Badge variant={c.status === 'open' ? 'default' : 'secondary'} className="text-xs">
                    {c.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(c.created_at).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

const ChatArea = ({ conversationId, userId }: { conversationId: string; userId: string }) => {
  const { messages, loading, sendMessage } = useSupportMessages(conversationId);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setInput('');
    await sendMessage(msg, 'user');
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && <p className="text-center text-muted-foreground text-sm">Loading messages...</p>}
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
              m.sender_id === userId
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : 'bg-muted text-foreground rounded-bl-md'
            }`}>
              {m.sender_role === 'admin' && m.sender_id !== userId && (
                <p className="text-xs font-semibold mb-1 opacity-70">Admin</p>
              )}
              <p>{m.message}</p>
              <p className="text-[10px] mt-1 opacity-60">
                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 border-t border-border flex gap-2">
        <Input
          placeholder="Type your message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <Button size="icon" onClick={handleSend}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
};

export default Support;
