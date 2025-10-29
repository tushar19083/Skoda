import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMessaging, mockUsers } from '@/contexts/MessagingContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Send, Users, User, Reply, Search } from 'lucide-react';
import { format } from 'date-fns';
import { Message } from '@/types/message';

export function Messages() {
  const { user } = useAuth();
  const { messages, sendMessage, markAsRead } = useMessaging();
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState<'broadcast' | 'direct'>('broadcast');
  const [selectedRecipient, setSelectedRecipient] = useState<string>('');
  const [broadcastTo, setBroadcastTo] = useState<string>('all');
  const [searchRecipient, setSearchRecipient] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    if (replyingTo) {
      // Send reply to original sender
      sendMessage(newMessage, [replyingTo.senderId], undefined, replyingTo.id);
    } else if (messageType === 'broadcast') {
      if (broadcastTo === 'all') {
        sendMessage(newMessage, []);
      } else {
        sendMessage(newMessage, [], [broadcastTo]);
      }
    } else {
      if (selectedRecipient) {
        sendMessage(newMessage, [selectedRecipient]);
      }
    }

    setNewMessage('');
    setSelectedRecipient('');
    setReplyingTo(null);
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
    setMessageType('direct');
    setNewMessage('');
  };

  // Filter messages relevant to current user
  const userMessages = messages.filter(msg => {
    if (msg.senderId === user?.id) return true;
    if (msg.recipientIds.length === 0) return true; // broadcast to all
    if (msg.recipientIds.includes(user?.id || '')) return true;
    if (msg.recipientRoles?.includes(user?.role || '')) return true;
    return false;
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const availableRecipients = mockUsers.filter(u => u.id !== user?.id);

  // Filter recipients based on search
  const filteredRecipients = useMemo(() => {
    if (!searchRecipient.trim()) return availableRecipients;
    return availableRecipients.filter(u => 
      u.name.toLowerCase().includes(searchRecipient.toLowerCase()) ||
      u.role.toLowerCase().includes(searchRecipient.toLowerCase()) ||
      (u.location && u.location.toLowerCase().includes(searchRecipient.toLowerCase()))
    );
  }, [searchRecipient]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">Communicate with team members across locations</p>
      </div>

      {/* Send Message */}
      <Card>
        <CardHeader>
          <CardTitle>Send Message</CardTitle>
          <CardDescription>
            {replyingTo ? `Replying to ${replyingTo.senderName}` : 'Send a message to specific users or broadcast to roles'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {replyingTo && (
            <div className="p-3 bg-muted/50 rounded-lg border">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium">{replyingTo.senderName}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(null)}
                  className="h-6 px-2"
                >
                  Cancel Reply
                </Button>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{replyingTo.content}</p>
            </div>
          )}

          {!replyingTo && (
            <>
              <div className="flex gap-2">
                <Button
                  variant={messageType === 'broadcast' ? 'default' : 'outline'}
                  onClick={() => setMessageType('broadcast')}
                  className="flex-1"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Broadcast
                </Button>
                <Button
                  variant={messageType === 'direct' ? 'default' : 'outline'}
                  onClick={() => setMessageType('direct')}
                  className="flex-1"
                >
                  <User className="mr-2 h-4 w-4" />
                  Direct Message
                </Button>
              </div>

              {messageType === 'broadcast' ? (
                <Select value={broadcastTo} onValueChange={setBroadcastTo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="admin">All Admins</SelectItem>
                    <SelectItem value="trainer">All Trainers</SelectItem>
                    <SelectItem value="security">All Security</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, role, or location..."
                      value={searchRecipient}
                      onChange={(e) => setSearchRecipient(e.target.value)}
                      className="pl-9"
                    />
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
            </>
          )}

          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            rows={4}
          />

          <Button onClick={handleSend} className="w-full">
            <Send className="mr-2 h-4 w-4" />
            {replyingTo ? 'Send Reply' : 'Send Message'}
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
                  onClick={() => !msg.read && msg.senderId !== user?.id && markAsRead(msg.id)}
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
                        <Badge variant="secondary" className="mt-1">
                          Broadcast
                        </Badge>
                      ) : msg.recipientRoles ? (
                        <Badge variant="outline" className="mt-1">
                          To: {msg.recipientRoles.join(', ')}
                        </Badge>
                      ) : null}
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