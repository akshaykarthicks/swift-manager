
import { useState, useEffect } from "react";
import { Notification } from "@/types";
import { notificationStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock, Check, AtSign, CheckCircle2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

export const NotificationList = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    // Get notifications from store
    setNotifications(notificationStore.getNotifications());
  }, []);
  
  const handleMarkAllAsRead = () => {
    notificationStore.markAllAsRead();
    // Update local state
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };
  
  const handleMarkAsRead = (id: string) => {
    notificationStore.markAsRead(id);
    // Update local state
    setNotifications((prev) => 
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "assignment":
        return <Bell className="h-5 w-5 text-blue-500" />;
      case "reminder":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "mention":
        return <AtSign className="h-5 w-5 text-purple-500" />;
      case "completion":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };
  
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center py-8">
        <Bell className="h-8 w-8 text-gray-300" />
        <p className="mt-2 text-center text-gray-500">No notifications yet</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center justify-between border-b p-3">
        <h3 className="font-medium">Notifications</h3>
        {notifications.some((n) => !n.read) && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>
      
      <div className="max-h-[350px] overflow-y-auto">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-start gap-3 border-b p-3 transition-colors hover:bg-slate-50 ${!notification.read ? "bg-blue-50" : ""}`}
          >
            <div className="mt-1 flex-shrink-0">
              {getNotificationIcon(notification.type)}
            </div>
            
            <div className="flex-1">
              <p className="text-sm">{notification.message}</p>
              <p className="mt-1 text-xs text-gray-500">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </p>
            </div>
            
            {!notification.read && (
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0 rounded-full"
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
