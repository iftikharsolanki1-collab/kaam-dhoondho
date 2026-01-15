import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  MessageCircle,
  Check,
  CheckCheck,
  Smile,
  Paperclip,
  Mic,
  Camera,
  Copy,
  Trash2,
  Forward,
  Reply,
  Star,
  X
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
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showMessageOptions, setShowMessageOptions] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingChannelRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const texts = {
    en: {
      search: 'Search...',
      noConversations: 'No chats yet',
      startConversation: 'Start a new conversation',
      typeMessage: 'Message',
      send: 'Send',
      online: 'online',
      offline: 'offline',
      lastSeen: 'last seen',
      delivered: 'Delivered',
      read: 'Read',
      sent: 'Sent',
      today: 'Today',
      yesterday: 'Yesterday',
      callFailed: 'Call feature coming soon',
      messageSent: 'Message sent',
      messageFailed: 'Failed to send message',
      noMessages: 'No messages yet',
      startChatting: 'Say hi to start the conversation!',
      chats: 'Chats',
      copy: 'Copy',
      delete: 'Delete',
      forward: 'Forward',
      reply: 'Reply',
      star: 'Star',
      copied: 'Message copied',
      deleted: 'Message deleted',
      deleteConfirm: 'Delete this message?',
      typing: 'typing...'
    },
    hi: {
      search: 'खोजें...',
      noConversations: 'अभी कोई चैट नहीं',
      startConversation: 'नई बातचीत शुरू करें',
      typeMessage: 'संदेश',
      send: 'भेजें',
      online: 'ऑनलाइन',
      offline: 'ऑफलाइन',
      lastSeen: 'अंतिम बार',
      delivered: 'पहुंचाया गया',
      read: 'पढ़ा गया',
      sent: 'भेजा गया',
      today: 'आज',
      yesterday: 'कल',
      callFailed: 'कॉल जल्द आ रही है',
      messageSent: 'संदेश भेजा गया',
      messageFailed: 'संदेश भेजने में विफल',
      noMessages: 'अभी कोई संदेश नहीं',
      startChatting: 'हाय कहें!',
      chats: 'चैट्स',
      copy: 'कॉपी',
      delete: 'डिलीट',
      forward: 'फॉरवर्ड',
      reply: 'जवाब दें',
      star: 'स्टार',
      copied: 'संदेश कॉपी किया',
      deleted: 'संदेश डिलीट किया',
      deleteConfirm: 'यह संदेश डिलीट करें?',
      typing: 'टाइप कर रहा है...'
    }
  };

  useEffect(() => {
    loadCurrentUser();
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeChat && currentUser) {
      loadMessages(activeChat);
    }
  }, [activeChat, currentUser]);

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

  // Typing indicator realtime channel
  useEffect(() => {
    if (!activeChat || !currentUser) return;

    const channelName = [currentUser.id, activeChat].sort().join('-');
    const typingChannel = supabase.channel(`typing-${channelName}`);

    typingChannel
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.userId === activeChat) {
          setIsOtherTyping(true);
          // Auto-hide after 3 seconds
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = setTimeout(() => {
            setIsOtherTyping(false);
          }, 3000);
        }
      })
      .on('broadcast', { event: 'stop_typing' }, (payload) => {
        if (payload.payload.userId === activeChat) {
          setIsOtherTyping(false);
        }
      })
      .subscribe();

    typingChannelRef.current = typingChannel;

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      supabase.removeChannel(typingChannel);
    };
  }, [activeChat, currentUser]);

  // Broadcast typing status
  const broadcastTyping = () => {
    if (typingChannelRef.current && currentUser) {
      typingChannelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: currentUser.id }
      });
    }
  };

  const broadcastStopTyping = () => {
    if (typingChannelRef.current && currentUser) {
      typingChannelRef.current.send({
        type: 'broadcast',
        event: 'stop_typing',
        payload: { userId: currentUser.id }
      });
    }
  };

  // Handle input change with typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    broadcastTyping();
  };

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

      // Load ALL profiles (contacts) except current user
      const { data: profiles, error: profileError } = await supabase
        .from('profiles_public')
        .select('user_id, name, avatar_url')
        .neq('user_id', user.id);

      if (profileError) throw profileError;

      // Get last messages for each contact
      const { data: messages } = await supabase
        .from('messages')
        .select('sender_id, receiver_id, content, created_at, is_read')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      // Count unread messages per user
      const unreadCounts: Record<string, number> = {};
      const lastMessages: Record<string, { content: string; timestamp: string }> = {};
      
      messages?.forEach(msg => {
        const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        
        // Track last message
        if (!lastMessages[otherUserId]) {
          lastMessages[otherUserId] = {
            content: msg.content,
            timestamp: msg.created_at
          };
        }
        
        // Count unread messages (where current user is receiver)
        if (msg.receiver_id === user.id && !msg.is_read) {
          unreadCounts[otherUserId] = (unreadCounts[otherUserId] || 0) + 1;
        }
      });

      const conversationList: Conversation[] = (profiles || []).map(profile => ({
        id: profile.user_id || '',
        name: profile.name || 'Unknown User',
        lastMessage: lastMessages[profile.user_id || '']?.content || 'Tap to start chat',
        timestamp: lastMessages[profile.user_id || '']?.timestamp || new Date().toISOString(),
        unreadCount: unreadCounts[profile.user_id || ''] || 0,
        isOnline: Math.random() > 0.5,
        user_id: profile.user_id || '',
        avatar: profile.avatar_url || undefined
      }));

      // Sort: users with messages first (by timestamp), then others
      conversationList.sort((a, b) => {
        const aHasMessages = lastMessages[a.user_id];
        const bHasMessages = lastMessages[b.user_id];
        if (aHasMessages && !bHasMessages) return -1;
        if (!aHasMessages && bHasMessages) return 1;
        if (aHasMessages && bHasMessages) {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        }
        return a.name.localeCompare(b.name);
      });

      // If initialChatUserId provided, ensure that user is in the list
      if (initialChatUserId && !conversationList.find(c => c.user_id === initialChatUserId)) {
        const { data: initialProfile } = await supabase
          .from('profiles_public')
          .select('user_id, name, avatar_url')
          .eq('user_id', initialChatUserId)
          .single();
          
        if (initialProfile) {
          conversationList.unshift({
            id: initialProfile.user_id || '',
            name: initialProfile.name || 'Unknown User',
            lastMessage: 'Tap to start chat',
            timestamp: new Date().toISOString(),
            unreadCount: 0,
            isOnline: Math.random() > 0.5,
            user_id: initialProfile.user_id || '',
            avatar: initialProfile.avatar_url || undefined
          });
        }
      }

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString(language === 'hi' ? 'hi-IN' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).toLowerCase();
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return texts[language].today;
    if (diffInDays === 1) return texts[language].yesterday;
    return date.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
      day: 'numeric',
      month: 'short'
    });
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
      loadMessages(activeChat);

      await supabase.rpc('send_notification', {
        recipient_id: activeChat,
        notif_title: language === 'en' ? 'New Message' : 'नया संदेश',
        notif_message: `${currentUser.user_metadata?.name || 'Someone'} sent you a message`,
        notif_type: 'message'
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

  // Group messages by date
  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';
    
    msgs.forEach(msg => {
      const msgDate = new Date(msg.created_at).toDateString();
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msg.created_at, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });
    
    return groups;
  };

  // Message long press handlers
  const handleMessageLongPressStart = (message: Message) => {
    longPressTimer.current = setTimeout(() => {
      setSelectedMessage(message);
      setShowMessageOptions(true);
    }, 500);
  };

  const handleMessageLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleCopyMessage = async () => {
    if (selectedMessage) {
      await navigator.clipboard.writeText(selectedMessage.content);
      toast({ title: texts[language].copied });
      setShowMessageOptions(false);
      setSelectedMessage(null);
    }
  };

  const handleDeleteMessage = async () => {
    if (selectedMessage && currentUser) {
      try {
        const { error } = await supabase
          .from('messages')
          .delete()
          .eq('id', selectedMessage.id)
          .eq('sender_id', currentUser.id);

        if (error) throw error;
        
        setMessages(prev => prev.filter(m => m.id !== selectedMessage.id));
        toast({ title: texts[language].deleted });
      } catch (error) {
        console.error('Error deleting message:', error);
        toast({ title: texts[language].messageFailed, variant: 'destructive' });
      }
      setShowMessageOptions(false);
      setSelectedMessage(null);
    }
  };

  const handleForwardMessage = () => {
    if (selectedMessage) {
      setNewMessage(selectedMessage.content);
      setShowMessageOptions(false);
      setSelectedMessage(null);
      setActiveChat(null);
    }
  };

  const closeMessageOptions = () => {
    setShowMessageOptions(false);
    setSelectedMessage(null);
  };

  // Chat View - WhatsApp Style
  if (activeChat) {
    const currentConversation = conversations.find(c => c.id === activeChat);
    const messageGroups = groupMessagesByDate(messages);
    
    return (
      <div className="flex flex-col h-screen w-screen bg-[#0b141a]">
        {/* WhatsApp Style Header */}
        <div className="bg-[#202c33] px-2 py-2 flex items-center gap-2 shadow-md">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-[#aebac1] hover:bg-[#374045] h-10 w-10"
            onClick={() => setActiveChat(null)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <Avatar className="h-10 w-10 border-2 border-[#00a884]">
            <AvatarImage src={currentConversation?.avatar} />
            <AvatarFallback className="bg-[#00a884] text-white font-semibold">
              {currentConversation?.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-[#e9edef] truncate text-base">
              {currentConversation?.name}
            </h3>
            {isOtherTyping ? (
              <p className="text-xs text-[#00a884] animate-pulse flex items-center gap-1">
                <span className="flex gap-0.5">
                  <span className="w-1.5 h-1.5 bg-[#00a884] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-[#00a884] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-[#00a884] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </span>
                {texts[language].typing}
              </p>
            ) : (
              <p className="text-xs text-[#8696a0]">
                {currentConversation?.isOnline ? texts[language].online : `${texts[language].lastSeen} today`}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-[#aebac1] hover:bg-[#374045] h-10 w-10"
              onClick={() => toast({ title: texts[language].callFailed })}
            >
              <Video className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-[#aebac1] hover:bg-[#374045] h-10 w-10"
              onClick={() => toast({ title: texts[language].callFailed })}
            >
              <Phone className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-[#aebac1] hover:bg-[#374045] h-10 w-10"
            >
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div 
          className="flex-1 overflow-y-auto px-3 py-2 min-h-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23182229' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundColor: '#0b141a'
          }}
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="bg-[#182229] rounded-lg px-4 py-3 shadow">
                <p className="text-[#8696a0] text-sm">
                  🔒 {language === 'en' ? 'Messages are end-to-end encrypted' : 'संदेश एंड-टू-एंड एन्क्रिप्टेड हैं'}
                </p>
              </div>
            </div>
          ) : (
            <>
              {messageGroups.map((group, groupIdx) => (
                <div key={groupIdx}>
                  {/* Date Divider */}
                  <div className="flex justify-center my-3">
                    <span className="bg-[#182229] text-[#8696a0] text-xs px-3 py-1 rounded-lg shadow">
                      {formatDate(group.date)}
                    </span>
                  </div>
                  
                  {/* Messages */}
                  {group.messages.map((message, idx) => {
                    const isSent = message.sender_id === currentUser?.id;
                    const isFirst = idx === 0 || group.messages[idx - 1].sender_id !== message.sender_id;
                    const isSelected = selectedMessage?.id === message.id;
                    
                      return (
                      <div
                        key={message.id}
                        className={`flex mb-1 ${isSent ? 'justify-end' : 'justify-start'}`}
                        onTouchStart={() => handleMessageLongPressStart(message)}
                        onTouchEnd={handleMessageLongPressEnd}
                        onMouseDown={() => handleMessageLongPressStart(message)}
                        onMouseUp={handleMessageLongPressEnd}
                        onMouseLeave={handleMessageLongPressEnd}
                        onClick={() => {
                          setSelectedMessage(message);
                          setShowMessageOptions(true);
                        }}
                      >
                        <div
                          className={`relative max-w-[75%] px-3 py-1.5 rounded-lg shadow transition-all ${
                            isSent
                              ? 'bg-[#005c4b] text-[#e9edef]'
                              : 'bg-[#202c33] text-[#e9edef]'
                          } ${isFirst ? (isSent ? 'rounded-tr-none' : 'rounded-tl-none') : ''} ${
                            isSelected ? 'ring-2 ring-[#00a884] scale-[1.02]' : ''
                          }`}
                        >
                          {/* Message bubble tail */}
                          {isFirst && (
                            <div
                              className={`absolute top-0 w-0 h-0 ${
                                isSent
                                  ? 'right-[-8px] border-l-[8px] border-l-[#005c4b] border-t-[8px] border-t-transparent'
                                  : 'left-[-8px] border-r-[8px] border-r-[#202c33] border-t-[8px] border-t-transparent'
                              }`}
                            />
                          )}
                          
                          <p className="text-sm leading-relaxed break-words select-none">{message.content}</p>
                          
                          <div className={`flex items-center justify-end gap-1 mt-0.5 -mb-0.5`}>
                            <span className="text-[10px] text-[#8696a0]">
                              {formatTime(message.created_at)}
                            </span>
                            {isSent && (
                              message.is_read ? (
                                <CheckCheck className="w-4 h-4 text-[#53bdeb]" />
                              ) : (
                                <Check className="w-4 h-4 text-[#8696a0]" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Options Modal */}
        {showMessageOptions && selectedMessage && (
          <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
            onClick={closeMessageOptions}
          >
            <div 
              className="bg-[#233138] w-full max-w-md rounded-t-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Selected message preview */}
              <div className="px-4 py-3 border-b border-[#374045]">
                <p className="text-[#8696a0] text-xs mb-1">
                  {selectedMessage.sender_id === currentUser?.id ? 'You' : conversations.find(c => c.id === activeChat)?.name}
                </p>
                <p className="text-[#e9edef] text-sm line-clamp-2">{selectedMessage.content}</p>
              </div>
              
              {/* Options */}
              <div className="py-2">
                <button
                  className="w-full px-4 py-3 flex items-center gap-4 hover:bg-[#374045] active:bg-[#374045] transition-colors"
                  onClick={handleCopyMessage}
                >
                  <Copy className="w-5 h-5 text-[#8696a0]" />
                  <span className="text-[#e9edef]">{texts[language].copy}</span>
                </button>
                
                <button
                  className="w-full px-4 py-3 flex items-center gap-4 hover:bg-[#374045] active:bg-[#374045] transition-colors"
                  onClick={handleForwardMessage}
                >
                  <Forward className="w-5 h-5 text-[#8696a0]" />
                  <span className="text-[#e9edef]">{texts[language].forward}</span>
                </button>
                
                <button
                  className="w-full px-4 py-3 flex items-center gap-4 hover:bg-[#374045] active:bg-[#374045] transition-colors"
                  onClick={() => {
                    setNewMessage(`> ${selectedMessage.content}\n`);
                    closeMessageOptions();
                  }}
                >
                  <Reply className="w-5 h-5 text-[#8696a0]" />
                  <span className="text-[#e9edef]">{texts[language].reply}</span>
                </button>
                
                <button
                  className="w-full px-4 py-3 flex items-center gap-4 hover:bg-[#374045] active:bg-[#374045] transition-colors"
                  onClick={closeMessageOptions}
                >
                  <Star className="w-5 h-5 text-[#8696a0]" />
                  <span className="text-[#e9edef]">{texts[language].star}</span>
                </button>
                
                {selectedMessage.sender_id === currentUser?.id && (
                  <button
                    className="w-full px-4 py-3 flex items-center gap-4 hover:bg-[#374045] active:bg-[#374045] transition-colors"
                    onClick={handleDeleteMessage}
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                    <span className="text-red-500">{texts[language].delete}</span>
                  </button>
                )}
              </div>
              
              {/* Cancel button */}
              <div className="border-t border-[#374045]">
                <button
                  className="w-full px-4 py-4 flex items-center justify-center gap-2 hover:bg-[#374045] active:bg-[#374045] transition-colors"
                  onClick={closeMessageOptions}
                >
                  <X className="w-5 h-5 text-[#8696a0]" />
                  <span className="text-[#8696a0]">Cancel</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Message Input - WhatsApp Style */}
        <div 
          className="bg-[#202c33] px-2 py-2 pb-safe sticky bottom-0 z-50 border-t border-[#2a3942]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-[#8696a0] hover:bg-[#374045] h-10 w-10 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Smile className="w-6 h-6" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="text-[#8696a0] hover:bg-[#374045] h-10 w-10 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            
            <div className="flex-1 relative" onClick={(e) => e.stopPropagation()}>
              <Input
                value={newMessage}
                onChange={handleInputChange}
                placeholder={texts[language].typeMessage}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    broadcastStopTyping();
                    sendMessage();
                  }
                }}
                onBlur={broadcastStopTyping}
                onClick={(e) => e.stopPropagation()}
                autoComplete="off"
                className="bg-[#2a3942] border-none text-[#e9edef] placeholder:text-[#8696a0] rounded-lg h-10 pr-10 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button 
                variant="ghost" 
                size="icon"
                className="absolute right-0 top-0 text-[#8696a0] hover:bg-transparent h-10 w-10"
                onClick={(e) => e.stopPropagation()}
              >
                <Camera className="w-5 h-5" />
              </Button>
            </div>
            
            <Button 
              size="icon"
              className={`h-10 w-10 rounded-full shrink-0 ${
                newMessage.trim() 
                  ? 'bg-[#00a884] hover:bg-[#00a884]/90 text-white' 
                  : 'bg-[#00a884] hover:bg-[#00a884]/90 text-white'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                if (newMessage.trim()) {
                  broadcastStopTyping();
                  sendMessage();
                }
              }}
            >
              {newMessage.trim() ? (
                <Send className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-[#111b21]">
      {/* Header */}
      <div className="bg-[#202c33] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-[#aebac1] hover:bg-[#374045] h-10 w-10"
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold text-[#e9edef]">
            {texts[language].chats}
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-[#aebac1] hover:bg-[#374045] h-10 w-10"
          >
            <Camera className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-[#aebac1] hover:bg-[#374045] h-10 w-10"
          >
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-3 py-2 bg-[#111b21]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8696a0]" />
          <Input
            placeholder={texts[language].search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#202c33] border-none text-[#e9edef] placeholder:text-[#8696a0] rounded-lg h-10 focus-visible:ring-0"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <div className="w-20 h-20 bg-[#202c33] rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-10 h-10 text-[#8696a0]" />
            </div>
            <p className="text-[#8696a0] text-lg">{texts[language].noConversations}</p>
            <p className="text-[#667781] text-sm mt-1">{texts[language].startConversation}</p>
          </div>
        ) : (
          <div className="divide-y divide-[#222d34]">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-[#202c33] cursor-pointer transition-colors active:bg-[#2a3942]"
                onClick={() => setActiveChat(conversation.id)}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={conversation.avatar} />
                    <AvatarFallback className="bg-[#00a884] text-white font-semibold text-lg">
                      {conversation.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] rounded-full border-2 border-[#111b21]" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="font-medium text-[#e9edef] truncate">
                      {conversation.name}
                    </h3>
                    <span className={`text-xs shrink-0 ml-2 ${
                      conversation.unreadCount > 0 ? 'text-[#00a884]' : 'text-[#8696a0]'
                    }`}>
                      {formatTime(conversation.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[#8696a0] truncate">
                      {conversation.lastMessage}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <Badge className="bg-[#00a884] text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full ml-2">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;