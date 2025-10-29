import { MessageSquare } from 'lucide-react';
import { useMessaging } from '@/contexts/MessagingContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function MessageNotificationBadge() {
  const { unreadCount } = useMessaging();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (unreadCount === 0) return null;

  const handleClick = () => {
    navigate(`/${user?.role === 'super_admin' ? 'super-admin' : user?.role}/messages`);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="relative"
      onClick={handleClick}
    >
      <MessageSquare className="h-5 w-5" />
      <Badge
        variant="destructive"
        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
      >
        {unreadCount}
      </Badge>
    </Button>
  );
}