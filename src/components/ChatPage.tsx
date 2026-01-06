import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, 
  Send, 
  Phone, 
  Video, 
  MoreVertical, 
  Search,
  MessageCircle
} from 'lucide-react';

interface ChatPageProps {
  language: 'en' | 'hi';
  onBack: () => void;
  initialChatUserId?: string | null;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  is_read: boolean;
}

interface Conversation {
  id: string;
  name: string;
  email?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatar?: string;
  isOnline?: boolean;
  user_id: string;
}

const ChatPage: React.FC<ChatPageProps> = ({ language, onBack, initialChatUserId }) => {
  const [activeChat, setActiveChat] = useState<string | null>(initialChatUserId || null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const texts = {
    en: {
      search: 'Search conversations...',
      noConversations: 'No conversations yet',
      startConversation: 'Start a new conversation',
      typeMessage: 'Type a message...',
      send: 'Send',
      online: 'Online',
      offline: 'Offline',
      lastSeen: 'Last seen',
      delivered: 'Delivered',
      read: 'Read',
      sent: 'Sent',
      today: 'Today',
      yesterday: 'Yesterday',
      callFailed: 'Call feature coming soon',
      messageSent: 'Message sent',
      messageFailed: 'Failed to send message',
      noMessages: 'No messages yet',
      startChatting: 'Start chatting with this user'
    },
    hi: {
      search: 'बातचीत खोजें...',
      noConversations: 'अभी तक कोई बातचीत नहीं',
      startConversation: 'नई बातचीत शुरू करें',
      typeMessage: 'संदेश लिखें...',
      send: 'भेजें',
      online: 'ऑनलाइन',
      offline: 'ऑफलाइन',
      lastSeen: 'अंतिम बार देखा गया',
      delivered: 'पहुंचाया गया',
      read: 'पढ़ा गया',
      sent: 'भेजा गया',
      today: 'आज',
      yesterday: 'कल',
      callFailed: 'कॉल सुविधा जल्द आ रही है',
      messageSent: 'संदेश भेजा गया',
      messageFailed: 'संदेश भेजने में विफल',
      noMessages: 'अभी तक कोई संदेश नहीं',
      startChatting: 'इस उपयोगकर्ता के साथ चैट शुरू करें'
    }
  };

  // Load current user and conversations
  useEffect(() => {
    loadCurrentUser();
    loadConversations();
  }, []);

  // Load messages when activeChat changes
  useEffect(() => {
    if (activeChat && currentUser) {
      loadMessages(activeChat);
    }
  }, [activeChat, currentUser]);

  // Set up real-time message subscription
  useEffect(() => {
    if (!activeChat || !currentUser) return;

    const channel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${currentUser.id}`,
        },
        (payload) => {
          if (payload.new.sender_id === activeChat) {
            setMessages((prev) => [...prev, payload.new as Message]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChat, currentUser]);

  const loadCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Get all users from profiles to create potential conversations
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user.id);

      if (error) throw error;

      // Convert profiles to conversations format
      const conversationList: Conversation[] = profiles.map(profile => ({
        id: profile.user_id,
        name: profile.name || 'Unknown User',
        lastMessage: 'Start a conversation',
        timestamp: new Date().toISOString(),
        unreadCount: 0,
        isOnline: false,
        user_id: profile.user_id
      }));

      setConversations(conversationList);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setIsLoading(false);
    }
  };

  const loadMessages = async (otherUserId: string) => {
    try {
      if (!currentUser) return;

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', otherUserId)
        .eq('receiver_id', currentUser.id)
        .eq('is_read', false);

    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString(language === 'hi' ? 'hi-IN' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInDays === 1) {
      return texts[language].yesterday;
    } else {
      return date.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat || !currentUser) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUser.id,
          receiver_id: activeChat,
          content: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');
      
      // Reload messages to show the new message
      loadMessages(activeChat);
      
      toast({
        title: texts[language].messageSent,
      });

      // Create notification for receiver
      await supabase
        .from('notifications')
        .insert({
          user_id: activeChat,
          title: language === 'en' ? 'New Message' : 'नया संदेश',
          message: `${currentUser.user_metadata?.name || 'Someone'} sent you a message`,
          type: 'message'
        });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: texts[language].messageFailed,
        variant: 'destructive'
      });
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (activeChat) {
    const currentConversation = conversations.find(c => c.id === activeChat);
    
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Chat Header */}
        <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setActiveChat(null)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Avatar className="w-8 h-8">
              <AvatarFallback>{currentConversation?.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{currentConversation?.name}</h3>
              <p className="text-xs opacity-80">{currentConversation?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => toast({ title: texts[language].callFailed })}>
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => toast({ title: texts[language].callFailed })}>
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">{texts[language].noMessages}</p>
              <p className="text-sm">{texts[language].startChatting}</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.sender_id === currentUser?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1 ${
                    message.sender_id === currentUser?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    <span className="text-xs">{formatTime(message.created_at)}</span>
                    {message.sender_id === currentUser?.id && (
                      <span className="text-xs">
                        {message.is_read ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={texts[language].typeMessage}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={!newMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold">
          {language === 'en' ? 'Messages' : 'संदेश'}
        </h1>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={texts[language].search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Conversations */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p>Loading conversations...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{texts[language].noConversations}</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setActiveChat(conversation.id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="text-sm font-medium">{conversation.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {conversation.email}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">
                        {formatTime(conversation.timestamp)}
                      </div>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="secondary" className="mt-1">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatPage;