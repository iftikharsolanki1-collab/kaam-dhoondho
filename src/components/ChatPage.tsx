import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, 
  Send, 
  Phone, 
  Video, 
  MoreVertical, 
  ArrowLeft,
  Search,
  Users,
  Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatPageProps {
  language: 'en' | 'hi';
  onBack: () => void;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp: string;
  sender_name: string;
  sender_avatar?: string;
  is_read: boolean;
}

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
}

export const ChatPage = ({ language, onBack }: ChatPageProps) => {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const texts = {
    en: {
      title: 'Messages',
      search: 'Search conversations...',
      typeMessage: 'Type a message...',
      send: 'Send',
      online: 'Online',
      offline: 'Offline',
      newChat: 'New Chat',
      allUsers: 'All Users',
      noConversations: 'No conversations yet',
      startChatting: 'Start chatting with other users',
      messageSent: 'Message sent',
      messageError: 'Failed to send message'
    },
    hi: {
      title: 'संदेश',
      search: 'बातचीत खोजें...',
      typeMessage: 'संदेश टाइप करें...',
      send: 'भेजें',
      online: 'ऑनलाइन',
      offline: 'ऑफलाइन',
      newChat: 'नई चैट',
      allUsers: 'सभी यूजर',
      noConversations: 'अभी तक कोई बातचीत नहीं',
      startChatting: 'अन्य उपयोगकर्ताओं के साथ चैट शुरू करें',
      messageSent: 'संदेश भेजा गया',
      messageError: 'संदेश भेजने में विफल'
    }
  };

  // Mock data for demonstration
  useEffect(() => {
    const mockConversations: Conversation[] = [
      {
        id: '1',
        name: 'Rajesh Kumar',
        avatar: '',
        lastMessage: 'Are you available for plumbing work tomorrow?',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        unreadCount: 2,
        isOnline: true
      },
      {
        id: '2', 
        name: 'Priya Sharma',
        avatar: '',
        lastMessage: 'Thank you for the excellent cleaning service!',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        unreadCount: 0,
        isOnline: false
      },
      {
        id: '3',
        name: 'Amit Singh',
        avatar: '',
        lastMessage: 'What is your rate for electrical work?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        unreadCount: 1,
        isOnline: true
      },
      {
        id: '4',
        name: 'Sunita Devi',
        avatar: '',
        lastMessage: 'I need a cook for next week. Are you free?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        unreadCount: 3,
        isOnline: false
      }
    ];
    
    setConversations(mockConversations);
  }, []);

  // Load messages for active chat
  useEffect(() => {
    if (activeChat) {
      const mockMessages: Message[] = [
        {
          id: '1',
          sender_id: activeChat,
          receiver_id: 'current_user',
          content: 'Hello! I saw your post about plumbing services.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          sender_name: conversations.find(c => c.id === activeChat)?.name || 'User',
          is_read: true
        },
        {
          id: '2',
          sender_id: 'current_user',
          receiver_id: activeChat,
          content: 'Yes, I provide plumbing services. What do you need help with?',
          timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
          sender_name: 'You',
          is_read: true
        },
        {
          id: '3',
          sender_id: activeChat,
          receiver_id: 'current_user',
          content: 'I have a leaking tap in my kitchen. Can you fix it tomorrow?',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          sender_name: conversations.find(c => c.id === activeChat)?.name || 'User',
          is_read: true
        },
        {
          id: '4',
          sender_id: 'current_user',
          receiver_id: activeChat,
          content: 'Sure! I can come tomorrow morning. My rate is ₹300 for tap repair.',
          timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
          sender_name: 'You',
          is_read: true
        }
      ];
      
      setMessages(mockMessages);
    }
  }, [activeChat, conversations]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString(language === 'en' ? 'en-US' : 'hi-IN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString(language === 'en' ? 'en-US' : 'hi-IN', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;

    setIsLoading(true);
    try {
      const messageId = Date.now().toString();
      const newMsg: Message = {
        id: messageId,
        sender_id: 'current_user',
        receiver_id: activeChat,
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        sender_name: 'You',
        is_read: false
      };

      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      
      // Update conversation last message
      setConversations(prev => 
        prev.map(conv => 
          conv.id === activeChat 
            ? { ...conv, lastMessage: newMessage.trim(), timestamp: new Date().toISOString() }
            : conv
        )
      );

      toast({
        title: texts[language].messageSent,
        description: language === 'en' ? 'Your message has been sent' : 'आपका संदेश भेजा गया है',
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: texts[language].messageError,
        description: language === 'en' ? 'Please try again' : 'कृपया फिर से कोशिश करें',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (activeChat) {
    const currentConversation = conversations.find(c => c.id === activeChat);
    
    return (
      <div className="flex flex-col h-screen bg-background">
        {/* Chat Header */}
        <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveChat(null)}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <Avatar className="w-10 h-10">
              <AvatarImage src={currentConversation?.avatar} alt={currentConversation?.name} />
              <AvatarFallback className="bg-primary-foreground/10 text-primary-foreground">
                {currentConversation?.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h3 className="font-semibold">{currentConversation?.name}</h3>
              <p className="text-xs text-primary-foreground/80">
                {currentConversation?.isOnline ? texts[language].online : texts[language].offline}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Phone className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Video className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === 'current_user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.sender_id === 'current_user' ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`p-3 rounded-lg ${
                      message.sender_id === 'current_user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 px-1">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
                
                {message.sender_id !== 'current_user' && (
                  <Avatar className="w-8 h-8 order-1 mr-2 mt-auto">
                    <AvatarImage src={message.sender_avatar} alt={message.sender_name} />
                    <AvatarFallback className="text-xs">
                      {message.sender_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t border-border bg-background">
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={texts[language].typeMessage}
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isLoading}
              className="px-6"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {texts[language].title}
            </h2>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          className="transition-all duration-200 hover:scale-105"
        >
          <Plus className="w-4 h-4 mr-2" />
          {texts[language].newChat}
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder={texts[language].search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 transition-all duration-200 focus:scale-[1.02]"
        />
      </div>

      {/* Conversations List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircle className="w-5 h-5 mr-2 text-primary" />
            {texts[language].title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">
                {texts[language].noConversations}
              </p>
              <p className="text-sm text-muted-foreground">
                {texts[language].startChatting}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredConversations.map((conversation, index) => (
                <div key={conversation.id}>
                  <Button
                    variant="ghost"
                    className="w-full p-4 h-auto justify-start transition-all duration-200 hover:scale-[1.02] hover:bg-muted/50"
                    onClick={() => setActiveChat(conversation.id)}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={conversation.avatar} alt={conversation.name} />
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {conversation.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-verified rounded-full border-2 border-background"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-foreground truncate">
                            {conversation.name}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(conversation.timestamp)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {conversation.lastMessage}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge 
                              variant="secondary" 
                              className="bg-primary text-primary-foreground text-xs min-w-[20px] h-5 flex items-center justify-center animate-pulse"
                            >
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Button>
                  {index < filteredConversations.length - 1 && <Separator className="my-1" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};