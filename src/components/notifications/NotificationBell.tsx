/**
 * NotificationBell Component
 *
 * Displays a bell icon with unread notification count badge.
 * Shows a dropdown with notification list on click.
 *
 * Requirements: 3.4, 3.6
 */

import { useState, useRef, useEffect } from "react";
import { useNotifications } from "../../hooks/useNotifications";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import type { Notification } from "../../services/backend/notifications";

interface NotificationBellProps {
  onClick?: () => void;
  className?: string;
}

export function NotificationBell({
  onClick,
  className = "",
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } =
    useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleBellClick = () => {
    setIsOpen(!isOpen);
    onClick?.();
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.readAt) {
      await markAsRead(notification.id);
    }
    // Could navigate to relevant item based on notification.data
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "reminder":
        return "⏰";
      case "task_due":
        return "📋";
      case "plan_ready":
        return "✨";
      case "email_summary":
        return "📧";
      case "system":
        return "⚙️";
      default:
        return "🔔";
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleBellClick}
        className="relative"
        title={`Notifications${
          unreadCount > 0 ? ` (${unreadCount} unread)` : ""
        }`}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-destructive rounded-full pointer-events-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute top-[calc(100%+8px)] right-0 w-80 max-h-[400px] mica-blur border-2 border-border/60 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 p-0 flex flex-col">
          <CardHeader className="flex flex-row justify-between items-center px-4 py-3 border-b border-border bg-muted/20 transition-colors space-y-0">
            <CardTitle className="text-sm font-semibold text-foreground">
              Notifications
            </CardTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-auto p-0 text-xs text-primary hover:text-primary/80"
              >
                Mark all read
              </Button>
            )}
          </CardHeader>
          <CardContent className="overflow-y-auto max-h-[340px] p-0 flex-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-2 p-6 text-muted-foreground">
                <LoadingSpinner />
                <span>Loading...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 p-6 text-muted-foreground">
                <span className="text-2xl">🔔</span>
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification)}
                  formatTime={formatTime}
                  getIcon={getNotificationIcon}
                />
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Individual notification item
 */
interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  formatTime: (timestamp: number) => string;
  getIcon: (type: Notification["type"]) => string;
}

function NotificationItem({
  notification,
  onClick,
  formatTime,
  getIcon,
}: NotificationItemProps) {
  const isUnread = !notification.readAt;

  return (
    <button
      className={`flex items-start gap-3 w-full p-3 text-left transition-colors border-b border-border/50 last:border-0 hover:bg-muted/50
        ${isUnread ? "bg-primary/5 hover:bg-primary/10" : "bg-transparent"}`}
      onClick={onClick}
    >
      <span className="text-lg flex-shrink-0 mt-0.5">
        {getIcon(notification.type)}
      </span>
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <span
          className={`text-sm ${
            isUnread
              ? "font-semibold text-foreground"
              : "font-medium text-foreground/80"
          } truncate`}
        >
          {notification.title}
        </span>
        {notification.body && (
          <span className="text-xs text-muted-foreground truncate">
            {notification.body}
          </span>
        )}
        <span className="text-[10px] text-muted-foreground/70">
          {formatTime(notification.createdAt)}
        </span>
      </div>
      {isUnread && (
        <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
      )}
    </button>
  );
}

function BellIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="animate-spin"
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1" />
    </svg>
  );
}

export default NotificationBell;
