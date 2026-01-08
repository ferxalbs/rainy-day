/**
 * MeetingJoinButton Component
 *
 * Shows a "Join" button for events with meeting links.
 * Opens link in browser on click. Highlights events starting within 15 minutes.
 *
 * Requirements: 6.1, 6.2, 6.5
 */

import { useMemo } from "react";
import { Button } from "../ui/button";

interface MeetingJoinButtonProps {
  meetingLink: string | null | undefined;
  startTime?: string | null;
  className?: string;
  size?: "default" | "sm" | "icon" | "icon-sm";
  showLabel?: boolean;
}

export function MeetingJoinButton({
  meetingLink,
  startTime,
  className = "",
  size = "sm",
  showLabel = true,
}: MeetingJoinButtonProps) {
  // Don't render if no meeting link
  if (!meetingLink) {
    return null;
  }

  const isStartingSoon = useMemo(() => {
    if (!startTime) return false;
    try {
      const meetingTime = new Date(startTime);
      const now = new Date();
      const diffMinutes = (meetingTime.getTime() - now.getTime()) / (1000 * 60);
      // Starting within 15 minutes (and not already past)
      return diffMinutes >= -5 && diffMinutes <= 15;
    } catch {
      return false;
    }
  }, [startTime]);

  const handleJoin = () => {
    // Open meeting link in default browser
    window.open(meetingLink, "_blank", "noopener,noreferrer");
  };

  return (
    <Button
      variant={isStartingSoon ? "default" : "outline"}
      size={size}
      onClick={handleJoin}
      className={`meeting-join-btn ${isStartingSoon ? "starting-soon" : ""} ${className}`}
      title={isStartingSoon ? "Meeting starting soon - Join now!" : "Join meeting"}
    >
      <VideoIcon />
      {showLabel && <span>Join</span>}
    </Button>
  );
}

function VideoIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}

export default MeetingJoinButton;
