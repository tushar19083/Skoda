import { useState, useMemo, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMessaging, mockUsers } from '@/contexts/MessagingContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Users, User, Reply, Search, MapPin, Radio, MessageSquare, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Message } from '@/types/message';
import { getLocationName } from '@/constants/locations';

// Get all users from localStorage for recipient selection
const getAllUsers = (): Array<{ id: string; name: string; role: string; location?: string }> => {
  try {
    const stored = localStorage.getItem('app_users');
    if (stored) {
      const users = JSON.parse(stored);
      return users.map((u: any) => ({
        id: u.id || '',
        name: u.name || 'Unknown User',
        role: u.role || 'trainer',
        location: u.location || 'PTC',
      }));
    }
  } catch (err) {
    console.error('Error loading users from localStorage:', err);
  }
  // Fallback to mockUsers if localStorage is empty
  return mockUsers;
};

export function Messages() {
  const { user } = useAuth();
  const { messages, sendMessage, markAsRead } = useMessaging();
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState<'broadcast' | 'direct'>('broadcast');
  const [selectedRecipient, setSelectedRecipient] = useState<string>('');
  const [broadcastTo, setBroadcastTo] = useState<string>('all');
  const [searchRecipient, setSearchRecipient] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const messageTextareaRef = useRef<HTMLTextAreaElement>(null);
  const replySectionRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (!newMessage.trim() || !user) return;

    // Validation
    if (messageType === 'broadcast' && !broadcastTo) {
      return;
    }
    if (messageType === 'direct' && !selectedRecipient && !replyingTo) {
      return;
    }

    if (replyingTo) {
      // Send reply to original sender
      sendMessage(newMessage, [replyingTo.senderId], undefined, replyingTo.id);
    } else if (messageType === 'broadcast') {
      if (broadcastTo === 'all') {
        // Only super admin can broadcast to all
        if (user.role === 'super_admin') {
          sendMessage(newMessage, []);
        } else {
          // Admin broadcasts to their location only
          sendMessage(newMessage, [], ['all'], undefined, user.location);
        }
      } else if (broadcastTo.startsWith('location_')) {
        // Location-specific broadcast
        const location = broadcastTo.replace('location_', '');
        sendMessage(newMessage, [], ['all'], undefined, location);
      } else {
        // Role-based broadcast (restricted to admin's location if admin)
        sendMessage(newMessage, [], [broadcastTo], undefined, user.role === 'admin' ? user.location : undefined);
      }
    } else {
      if (selectedRecipient) {
        sendMessage(newMessage, [selectedRecipient]);
      }
    }

    setNewMessage('');
    setSelectedRecipient('');
    setReplyingTo(null);
    setBroadcastTo('all'); // Reset broadcast selection
    setMessageType('direct'); // Reset to direct after sending
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
    setMessageType('direct');
    setNewMessage('');
    
    // Scroll to textarea and focus it
    setTimeout(() => {
      if (replySectionRef.current) {
        replySectionRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
      // Focus textarea after scroll
      setTimeout(() => {
        if (messageTextareaRef.current) {
          messageTextareaRef.current.focus();
        }
      }, 300);
    }, 50);
  };
  
  // Auto-focus textarea when replying
  useEffect(() => {
    if (replyingTo && messageTextareaRef.current) {
      setTimeout(() => {
        messageTextareaRef.current?.focus();
      }, 350);
    }
  }, [replyingTo]);

  // Filter messages relevant to current user (with location-based filtering)
  const userMessages = messages.filter(msg => {
    if (!user) return false;
    
    // User's own messages
    if (msg.senderId === user.id) return true;
    
    // Direct messages to user
    if (msg.recipientIds.includes(user.id)) return true;
    
    // Location-based filtering for admin broadcasts
    if (msg.locationFilter && user.role !== 'super_admin') {
      // If message has location filter, only show to users in that location
      if (msg.locationFilter !== user.location && user.location !== 'ALL') {
        return false;
      }
    }
    
    // Broadcast messages
    if (msg.recipientIds.length === 0) {
      // Check if admin broadcast is restricted to location
      if (msg.locationFilter && user.role !== 'super_admin') {
        return msg.locationFilter === user.location || user.location === 'ALL';
      }
      return true; // broadcast to all (super admin)
    }
    
    // Role-based broadcasts
    if (msg.recipientRoles?.includes(user.role)) {
      // For admin broadcasts, check location filter
      if (msg.locationFilter && user.role !== 'super_admin' && msg.senderRole === 'admin') {
        return msg.locationFilter === user.location || user.location === 'ALL';
      }
      return true;
    }
    
    return false;
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Load users from localStorage for recipient selection (dynamic database)
  const [allUsers, setAllUsers] = useState<Array<{ id: string; name: string; role: string; location?: string }>>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  // Function to load users dynamically from database (localStorage)
  const loadUsers = useMemo(() => {
    return () => {
      try {
        setUsersLoading(true);
        const users = getAllUsers();
        setAllUsers(users);
      } catch (err) {
        console.error('Error loading users:', err);
        setAllUsers([]);
      } finally {
        setUsersLoading(false);
      }
    };
  }, []);

  // Initial load on mount
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Listen for storage changes (cross-tab updates)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'app_users') {
        loadUsers();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadUsers]);

  // Reload when page becomes visible (handles same-tab updates)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadUsers();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loadUsers]);

  // Reload when window gains focus (handles same-tab updates)
  useEffect(() => {
    const handleFocus = () => {
      loadUsers();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadUsers]);

  // Periodic refresh every 5 seconds to ensure data is up-to-date
  useEffect(() => {
    const interval = setInterval(() => {
      loadUsers();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [loadUsers]);

  // Listen for custom events when users are updated (same-tab updates)
  useEffect(() => {
    const handleUsersUpdate = () => {
      loadUsers();
    };

    window.addEventListener('users-updated', handleUsersUpdate);
    return () => window.removeEventListener('users-updated', handleUsersUpdate);
  }, [loadUsers]);

  // For direct messages, every user can message any other user across all roles and locations
  const availableRecipients = useMemo(() => {
    if (!user) return [];
    
    // Use dynamically loaded users from database (localStorage)
    // Fallback to mockUsers only if database is empty
    const users = allUsers.length > 0 ? allUsers : mockUsers;
    
    // Simply filter out the current user - everyone else is available for direct messaging
    return users.filter(u => u.id !== user.id);
  }, [allUsers, user]);

  // Filter recipients based on search
  const filteredRecipients = useMemo(() => {
    if (!searchRecipient.trim()) return availableRecipients;
    return availableRecipients.filter(u => 
      u.name.toLowerCase().includes(searchRecipient.toLowerCase()) ||
      u.role.toLowerCase().includes(searchRecipient.toLowerCase()) ||
      (u.location && u.location.toLowerCase().includes(searchRecipient.toLowerCase()))
    );
  }, [searchRecipient, availableRecipients]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">Communicate with team members across locations</p>
      </div>

      {/* Send Message */}
      <Card ref={replySectionRef}>
        <CardHeader>
          <CardTitle>Send Message</CardTitle>
          <CardDescription>
            {replyingTo ? `Replying to ${replyingTo.senderName}` : (user?.role === 'super_admin' || user?.role === 'admin') ? 'Choose between broadcast or direct message' : 'Send a direct message to a user'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {replyingTo && (
            <div className="p-3 bg-primary/5 rounded-lg border-2 border-primary/30 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Reply className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium text-primary">Replying to {replyingTo.senderName}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setReplyingTo(null);
                    messageTextareaRef.current?.blur();
                  }}
                  className="h-6 px-2"
                >
                  Cancel Reply
                </Button>
              </div>
              <div className="p-2 bg-muted/30 rounded mt-2">
                <p className="text-xs text-muted-foreground mb-1">Original message:</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{replyingTo.content}</p>
              </div>
            </div>
          )}

          {!replyingTo && (user?.role === 'super_admin' || user?.role === 'admin') && (
            <Tabs 
              value={messageType} 
              onValueChange={(value) => setMessageType(value as 'broadcast' | 'direct')}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="broadcast" className="flex items-center gap-2">
                  <Radio className="h-4 w-4" />
                  Broadcast
                </TabsTrigger>
                <TabsTrigger value="direct" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Direct Message
                </TabsTrigger>
              </TabsList>
              
              {/* Broadcast Tab */}
              <TabsContent value="broadcast" className="space-y-4 mt-4">

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Radio className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Select who will receive this broadcast message</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Broadcast To</Label>
                    <Select value={broadcastTo} onValueChange={setBroadcastTo}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                        {user?.role === 'super_admin' && (
                          <SelectItem value="all">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>All Users (All Locations)</span>
                            </div>
                          </SelectItem>
                        )}
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{user?.role === 'super_admin' ? 'All Admins (All Locations)' : `All Admins (${getLocationName(user?.location || 'PTC')})`}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="trainer">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{user?.role === 'super_admin' ? 'All Trainers (All Locations)' : `Trainers (${getLocationName(user?.location || 'PTC')})`}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="security">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{user?.role === 'super_admin' ? 'All Security (All Locations)' : `Security (${getLocationName(user?.location || 'PTC')})`}</span>
                          </div>
                        </SelectItem>
                        {user?.role === 'admin' && user?.location && (
                          <SelectItem value={`location_${user.location}`}>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>All Users at {getLocationName(user.location)}</span>
                            </div>
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Show broadcast preview */}
                  <div className="p-3 bg-muted/50 rounded-lg border border-dashed">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <p className="text-xs font-medium">Broadcast Preview</p>
                        <p className="text-xs text-muted-foreground">
                          {broadcastTo === 'all' && user?.role === 'super_admin' && 'Will be sent to all users across all locations'}
                          {broadcastTo === 'all' && user?.role === 'admin' && `Will be sent to all users at ${getLocationName(user?.location || 'PTC')}`}
                          {broadcastTo === 'admin' && user?.role === 'super_admin' && 'Will be sent to all administrators across all locations'}
                          {broadcastTo === 'admin' && user?.role === 'admin' && `Will be sent to all administrators at ${getLocationName(user?.location || 'PTC')}`}
                          {broadcastTo === 'trainer' && user?.role === 'super_admin' && 'Will be sent to all trainers across all locations'}
                          {broadcastTo === 'trainer' && user?.role === 'admin' && `Will be sent to all trainers at ${getLocationName(user?.location || 'PTC')}`}
                          {broadcastTo === 'security' && user?.role === 'super_admin' && 'Will be sent to all security personnel across all locations'}
                          {broadcastTo === 'security' && user?.role === 'admin' && `Will be sent to all security personnel at ${getLocationName(user?.location || 'PTC')}`}
                          {broadcastTo.startsWith('location_') && `Will be sent to all users at ${getLocationName(broadcastTo.replace('location_', ''))}`}
                        </p>
                        {user?.role === 'admin' && user?.location && (
                          <div className="flex items-center gap-1 mt-2">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              Broadcasting from: {getLocationName(user.location)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Direct Message Tab */}
              <TabsContent value="direct" className="space-y-4 mt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                    <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span>Send a private message to a specific user</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Recipient</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, role, or location..."
                        value={searchRecipient}
                        onChange={(e) => setSearchRecipient(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  {selectedRecipient ? (
                    <div className="p-3 bg-muted/50 rounded-lg border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {availableRecipients.find(u => u.id === selectedRecipient)?.location && (
                          <Badge variant="secondary" className="text-xs font-normal">
                            {availableRecipients.find(u => u.id === selectedRecipient)?.location}
                          </Badge>
                        )}
                        <span className="font-medium">
                          {availableRecipients.find(u => u.id === selectedRecipient)?.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          • {availableRecipients.find(u => u.id === selectedRecipient)?.role}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRecipient('')}
                        className="h-7 px-2"
                      >
                        Change
                      </Button>
                    </div>
                  ) : (
                    <Select
                      value={selectedRecipient}
                      onValueChange={(value) => {
                        setSelectedRecipient(value);
                        setSearchRecipient('');
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipient" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {availableRecipients.map(u => (
                          <SelectItem key={u.id} value={u.id}>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs font-normal">
                                {u.location}
                              </Badge>
                              <span className="font-medium">{u.name}</span>
                              <span className="text-xs text-muted-foreground">• {u.role}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  
                  {searchRecipient && (
                    <div className="border rounded-lg max-h-[300px] overflow-y-auto bg-background">
                      {filteredRecipients.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                          No recipients found
                        </div>
                      ) : (
                        <div className="p-1">
                          <p className="text-xs text-muted-foreground px-3 py-2">
                            {filteredRecipients.length} recipient{filteredRecipients.length !== 1 ? 's' : ''} found
                          </p>
                          {filteredRecipients.map(u => (
                            <button
                              key={u.id}
                              onClick={() => {
                                setSelectedRecipient(u.id);
                                setSearchRecipient('');
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-accent rounded-md transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs font-normal">
                                  {u.location}
                                </Badge>
                                <span className="font-medium">{u.name}</span>
                                <span className="text-xs text-muted-foreground">• {u.role}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}

          {!replyingTo && (user?.role !== 'super_admin' && user?.role !== 'admin') && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Recipient</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, role, or location..."
                    value={searchRecipient}
                    onChange={(e) => setSearchRecipient(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {selectedRecipient ? (
                <div className="p-3 bg-muted/50 rounded-lg border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {availableRecipients.find(u => u.id === selectedRecipient)?.location && (
                      <Badge variant="secondary" className="text-xs font-normal">
                        {availableRecipients.find(u => u.id === selectedRecipient)?.location}
                      </Badge>
                    )}
                    <span className="font-medium">
                      {availableRecipients.find(u => u.id === selectedRecipient)?.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      • {availableRecipients.find(u => u.id === selectedRecipient)?.role}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRecipient('')}
                    className="h-7 px-2"
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <Select
                  value={selectedRecipient}
                  onValueChange={(value) => {
                    setSelectedRecipient(value);
                    setSearchRecipient('');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {availableRecipients.map(u => (
                      <SelectItem key={u.id} value={u.id}>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs font-normal">
                            {u.location}
                          </Badge>
                          <span className="font-medium">{u.name}</span>
                          <span className="text-xs text-muted-foreground">• {u.role}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {searchRecipient && (
                <div className="border rounded-lg max-h-[300px] overflow-y-auto bg-background">
                  {filteredRecipients.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No recipients found
                    </div>
                  ) : (
                    <div className="p-1">
                      <p className="text-xs text-muted-foreground px-3 py-2">
                        {filteredRecipients.length} recipient{filteredRecipients.length !== 1 ? 's' : ''} found
                      </p>
                      {filteredRecipients.map(u => (
                        <button
                          key={u.id}
                          onClick={() => {
                            setSelectedRecipient(u.id);
                            setSearchRecipient('');
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-accent rounded-md transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs font-normal">
                              {u.location}
                            </Badge>
                            <span className="font-medium">{u.name}</span>
                            <span className="text-xs text-muted-foreground">• {u.role}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <Textarea
            ref={messageTextareaRef}
            placeholder={replyingTo ? `Reply to ${replyingTo.senderName}...` : "Type your message..."}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            rows={4}
            className={replyingTo ? "ring-2 ring-primary border-primary/50 shadow-sm" : ""}
          />

          <Button 
            onClick={handleSend} 
            className="w-full"
            disabled={
              !newMessage.trim() || 
              (replyingTo ? false : // Replies don't need additional validation
              (messageType === 'broadcast' && !broadcastTo) ||
              (messageType === 'direct' && !selectedRecipient))
            }
          >
            <Send className="mr-2 h-4 w-4" />
            {replyingTo ? 'Send Reply' : messageType === 'broadcast' ? 'Send Broadcast' : 'Send Message'}
          </Button>
        </CardContent>
      </Card>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Messages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {userMessages.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No messages yet</p>
          ) : (
            userMessages.map((msg) => {
              const parentMsg = msg.parentMessageId 
                ? messages.find(m => m.id === msg.parentMessageId)
                : null;

              return (
                <div
                  key={msg.id}
                  className={`p-4 rounded-lg border ${
                    msg.senderId === user?.id
                      ? 'bg-primary/5 border-primary/20'
                      : msg.read
                      ? 'bg-muted/20'
                      : 'bg-accent/10 border-accent'
                  }`}
                  onClick={() => {
                    // Mark as read when user clicks on message
                    if (!msg.read && msg.senderId !== user?.id) {
                      markAsRead(msg.id);
                    }
                  }}
                  onMouseEnter={() => {
                    // Auto-mark as read when user hovers over unread message
                    if (!msg.read && msg.senderId !== user?.id) {
                      markAsRead(msg.id);
                    }
                  }}
                >
                  {parentMsg && (
                    <div className="mb-3 pl-3 border-l-2 border-muted-foreground/30">
                      <p className="text-xs text-muted-foreground mb-1">
                        Replying to {parentMsg.senderName}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {parentMsg.content}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{msg.senderName}</p>
                      <p className="text-sm text-muted-foreground">
                        {msg.senderRole}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {format(msg.timestamp, 'MMM d, h:mm a')}
                      </p>
                      {msg.recipientIds.length === 0 ? (
                        <div className="flex flex-col gap-1 items-end">
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Radio className="h-3 w-3" />
                            Broadcast
                          </Badge>
                          {msg.locationFilter && (
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                              <MapPin className="h-2 w-2" />
                              {getLocationName(msg.locationFilter || '')}
                            </Badge>
                          )}
                          {msg.recipientRoles && msg.recipientRoles.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              To: {msg.recipientRoles.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(', ')}
                            </Badge>
                          )}
                        </div>
                      ) : msg.recipientRoles ? (
                        <Badge variant="outline" className="mt-1">
                          To: {msg.recipientRoles.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(', ')}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="mt-1 flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          Direct
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm mb-2">{msg.content}</p>
                  
                  {msg.senderId !== user?.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReply(msg);
                      }}
                      className="h-7 px-2 text-xs"
                    >
                      <Reply className="mr-1 h-3 w-3" />
                      Reply
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}