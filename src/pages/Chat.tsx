import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Bot,
  User,
  Send,
  Sparkles,
  Loader2,
  ArrowLeft,
  Lightbulb,
  HelpCircle,
  MapPin,
  Package,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const suggestedQuestions = [
  {
    icon: Lightbulb,
    text: "What are the health benefits of Tulsi?",
  },
  {
    icon: MapPin,
    text: "Where can I find authentic Pashmina shawls?",
  },
  {
    icon: Package,
    text: "Tell me about traditional handicrafts from Bihar",
  },
  {
    icon: HelpCircle,
    text: "How is Madhubani painting made?",
  },
];

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "👋 Welcome! I'm your AI assistant for discovering local and indigenous products. I can help you learn about:\n\n• **Herbal medicines** and their traditional uses\n• **Local foods** and regional cuisines\n• **Handicrafts** and artisan products\n• **Cultural artifacts** and their significance\n• **Where to find** authentic products\n\nWhat would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response (will be replaced with actual AI integration)
    setTimeout(() => {
      const responses = [
        "That's a great question! Based on our community knowledge database, I can tell you that this product has been used traditionally for generations. Would you like me to share more specific details about its preparation or where to find it?",
        "I found some interesting information! This is a traditional product that holds significant cultural value. Local artisans have been crafting these for centuries using techniques passed down through generations.",
        "According to our database, this product is commonly found in local markets throughout the region. I can help you locate specific sellers or markets if you'd like!",
        "I don't have complete information about this specific product yet. Would you like to contribute your knowledge? Your input helps us build a more comprehensive database for everyone!",
      ];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container max-w-4xl py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">
                AI Knowledge Assistant
              </h1>
              <p className="text-sm text-muted-foreground">
                Ask anything about local & indigenous products
              </p>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex flex-col h-[calc(100vh-280px)] min-h-[400px] rounded-2xl bg-card border border-border overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-sage/20 text-sage'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="h-5 w-5" />
                  ) : (
                    <Bot className="h-5 w-5" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] px-5 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                      : 'bg-muted text-foreground rounded-tl-none'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-line">
                    {message.content}
                  </p>
                  <p
                    className={`text-xs mt-2 ${
                      message.role === 'user'
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
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

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <div className="px-4 md:px-6 pb-4">
              <p className="text-sm text-muted-foreground mb-3">Try asking:</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSend(question.text)}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-muted/50 hover:bg-muted text-left text-sm transition-colors"
                  >
                    <question.icon className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-foreground">{question.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 md:p-6 border-t border-border bg-background">
            <div className="flex gap-3">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about local products, herbs, crafts..."
                className="flex-1 h-12"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isLoading}
                size="lg"
                className="px-6"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Can't find what you're looking for?{' '}
              <Link to="/contribute" className="text-primary hover:underline">
                Help us by contributing your knowledge
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Chat;
