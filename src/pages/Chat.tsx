import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Bot, User, Send, Sparkles, Loader2, ArrowLeft,
  Lightbulb, HelpCircle, MapPin, Package,
} from 'lucide-react';
import { streamChat, type ChatMsg } from '@/lib/chatStream';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const suggestedQuestions = [
  { icon: Lightbulb, text: "What are the health benefits of Tulsi?" },
  { icon: MapPin, text: "Where can I find authentic Pashmina shawls?" },
  { icon: Package, text: "Tell me about traditional handicrafts from Bihar" },
  { icon: HelpCircle, text: "How is Madhubani painting made?" },
];

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1', role: 'assistant',
      content: "👋 Welcome! I'm your AI assistant for discovering local and indigenous products. I can help you learn about:\n\n• **Herbal medicines** and their traditional uses\n• **Local foods** and regional cuisines\n• **Handicrafts** and artisan products\n• **Cultural artifacts** and their significance\n• **Where to find** authentic products\n\nWhat would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(), role: 'user', content: messageText, timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Build chat history for AI
    const chatHistory: ChatMsg[] = messages
      .filter(m => m.id !== '1') // skip welcome msg
      .map(m => ({ role: m.role, content: m.content }));
    chatHistory.push({ role: 'user', content: messageText });

    let assistantSoFar = '';
    const assistantId = (Date.now() + 1).toString();

    try {
      await streamChat({
        messages: chatHistory,
        onDelta: (chunk) => {
          assistantSoFar += chunk;
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.id === assistantId) {
              return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
            }
            return [...prev, { id: assistantId, role: 'assistant', content: assistantSoFar, timestamp: new Date() }];
          });
        },
        onDone: () => setIsLoading(false),
        onError: (error) => {
          toast({ title: 'AI Error', description: error, variant: 'destructive' });
          setIsLoading(false);
        },
      });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to connect to AI assistant', variant: 'destructive' });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container max-w-4xl py-6 md:py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">AI Knowledge Assistant</h1>
              <p className="text-sm text-muted-foreground">Ask anything about local & indigenous products</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col h-[calc(100vh-280px)] min-h-[400px] rounded-2xl bg-card border border-border overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-sage/20 text-sage'}`}>
                  {message.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                </div>
                <div className={`max-w-[80%] px-5 py-3 rounded-2xl ${message.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted text-foreground rounded-tl-none'}`}>
                  <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                  <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-sage/20 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-sage" />
                </div>
                <div className="bg-muted px-5 py-3 rounded-2xl rounded-tl-none">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && (
            <div className="px-4 md:px-6 pb-4">
              <p className="text-sm text-muted-foreground mb-3">Try asking:</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {suggestedQuestions.map((q, i) => (
                  <button key={i} onClick={() => handleSend(q.text)} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-muted/50 hover:bg-muted text-left text-sm transition-colors">
                    <q.icon className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-foreground">{q.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 md:p-6 border-t border-border bg-background">
            <div className="flex gap-3">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Ask about local products, herbs, crafts..."
                className="flex-1 h-12"
                disabled={isLoading}
              />
              <Button onClick={() => handleSend()} disabled={!inputValue.trim() || isLoading} size="lg" className="px-6">
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Powered by AI • Connected to the LocalFinds product database
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Chat;
