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
import type { Notification } from "../../services/backend/notifications";
import "./NotificationBell.css";

interface NotificationBellProps {
  onClick?: () => void;
  className?: string;
}

export function NotificationBell({ onClick, className = "" }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
    <div className={`notification-bell-container ${className}`} ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleBellClick}
        className="notification-bell-btn"
        title={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="mark-all-read-btn"
              >
                Mark all read
              </Button>
            )}
          </div>

          <div className="notification-list">
            {isLoading ? (
              <div className="notification-loading">
                <LoadingSpinner />
                <span>Loading...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                <span>🔔</span>
                <p>No notifications</p>
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
          </div>
        </div>
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
      className={`notification-item ${isUnread ? "unread" : ""}`}
      onClick={onClick}
    >
      <span className="notification-icon">{getIcon(notification.type)}</span>
      <div className="notification-content">
        <span className="notification-title">{notification.title}</span>
        {notification.body && (
          <span className="notification-body">{notification.body}</span>
        )}
        <span className="notification-time">{formatTime(notification.createdAt)}</span>
      </div>
      {isUnread && <span className="unread-dot" />}
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
