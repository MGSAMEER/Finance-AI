"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bell, Check, CheckCheck } from "lucide-react";
import { useNotifications } from "@/stores/useNotifications";
import dayjs from "dayjs";

export function NotificationsBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { items, markAllRead, markRead, getUnreadCount } = useNotifications();
  
  const unreadCount = getUnreadCount();
  const hasUnread = unreadCount > 0;

  const handleMarkAllRead = () => {
    markAllRead();
    setIsOpen(false);
  };

  const handleMarkRead = (id: string) => {
    markRead(id);
  };

  const formatTimestamp = (ts: number) => {
    const now = dayjs();
    const notificationTime = dayjs(ts);
    const diffMinutes = now.diff(notificationTime, 'minute');
    const diffHours = now.diff(notificationTime, 'hour');
    const diffDays = now.diff(notificationTime, 'day');

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notificationTime.format('MMM D');
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
          {hasUnread && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between p-2 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {hasUnread && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        
        {items.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No notifications
          </div>
        ) : (
          <div className="py-1">
            {items.map((item) => (
              <DropdownMenuItem
                key={item.id}
                className={`p-3 cursor-pointer ${
                  !item.read ? 'bg-muted/50' : ''
                }`}
                onClick={() => handleMarkRead(item.id)}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="flex-shrink-0 mt-0.5">
                    {item.read ? (
                      <Check className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm ${!item.read ? 'font-semibold' : 'font-medium'}`}>
                      {item.title}
                    </div>
                    {item.body && (
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {item.body}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-2">
                      {formatTimestamp(item.ts)}
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
