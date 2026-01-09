/**
 * Event Form Modal
 *
 * Native modal for creating and editing calendar events.
 * Uses shadcn components with glassmorphism design.
 */

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Calendar, Clock, MapPin, Loader2, X } from "lucide-react";

interface EventFormData {
  title: string;
  description: string;
  location: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isAllDay: boolean;
}

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description?: string;
    location?: string;
    start_time: string;
    end_time: string;
    is_all_day?: boolean;
  }) => Promise<void>;
  initialData?: Partial<EventFormData>;
  mode?: "create" | "edit";
}

const DURATION_PRESETS = [
  { label: "30min", minutes: 30 },
  { label: "1hr", minutes: 60 },
  { label: "1.5hr", minutes: 90 },
  { label: "2hr", minutes: 120 },
];

export function EventFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = "create",
}: EventFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<EventFormData>(() => {
    const now = new Date();
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
    nextHour.setMinutes(0, 0, 0);
    const endHour = new Date(nextHour.getTime() + 60 * 60 * 1000);

    return {
      title: "",
      description: "",
      location: "",
      date: now.toISOString().split("T")[0],
      startTime: nextHour.toTimeString().slice(0, 5),
      endTime: endHour.toTimeString().slice(0, 5),
      isAllDay: false,
    };
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData((prev) => ({
          ...prev,
          ...initialData,
        }));
      } else {
        const now = new Date();
        const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
        nextHour.setMinutes(0, 0, 0);
        const endHour = new Date(nextHour.getTime() + 60 * 60 * 1000);

        setFormData({
          title: "",
          description: "",
          location: "",
          date: now.toISOString().split("T")[0],
          startTime: nextHour.toTimeString().slice(0, 5),
          endTime: endHour.toTimeString().slice(0, 5),
          isAllDay: false,
        });
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  const handleDurationPreset = useCallback(
    (minutes: number) => {
      const [hours, mins] = formData.startTime.split(":").map(Number);
      const startDate = new Date(formData.date);
      startDate.setHours(hours, mins, 0, 0);

      const endDate = new Date(startDate.getTime() + minutes * 60 * 1000);
      setFormData((prev) => ({
        ...prev,
        endTime: endDate.toTimeString().slice(0, 5),
      }));
    },
    [formData.startTime, formData.date]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError("Please enter an event title");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Construct datetime using local timezone
      let startDateTime: string;
      let endDateTime: string;

      if (formData.isAllDay) {
        // For all-day events, use date-only format
        startDateTime = `${formData.date}T00:00:00`;
        endDateTime = `${formData.date}T23:59:59`;
      } else {
        // Parse date and time components
        const [year, month, day] = formData.date.split("-").map(Number);
        const [startHour, startMin] = formData.startTime.split(":").map(Number);
        const [endHour, endMin] = formData.endTime.split(":").map(Number);

        // Create Date objects in local timezone
        const startDate = new Date(
          year,
          month - 1,
          day,
          startHour,
          startMin,
          0
        );
        const endDate = new Date(year, month - 1, day, endHour, endMin, 0);

        // Convert to ISO strings (these will include the correct timezone offset)
        startDateTime = startDate.toISOString();
        endDateTime = endDate.toISOString();
      }

      await onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        location: formData.location.trim() || undefined,
        start_time: startDateTime,
        end_time: endDateTime,
        is_all_day: formData.isAllDay,
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save event");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] bg-card/10 backdrop-blur-xl rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Calendar className="w-5 h-5 text-primary" />
            {mode === "create" ? "New Event" : "Edit Event"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {mode === "create"
              ? "Create a new calendar event"
              : "Update event details"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          {/* Error Message */}
          {error && (
            <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-center justify-between">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setError(null)}
                className="p-1 hover:bg-destructive/20 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Event Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Meeting with team..."
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="h-11 bg-background/50 border-border/50 focus:border-primary/50 rounded-xl"
              autoFocus
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, date: e.target.value }))
              }
              className="h-11 bg-background/50 border-border/50 focus:border-primary/50 rounded-xl"
            />
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <Label
                htmlFor="allDay"
                className="text-sm font-medium cursor-pointer"
              >
                All-day event
              </Label>
            </div>
            <Switch
              id="allDay"
              checked={formData.isAllDay}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isAllDay: checked }))
              }
            />
          </div>

          {/* Time Selection */}
          {!formData.isAllDay && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-sm font-medium">
                    Start Time
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        startTime: e.target.value,
                      }))
                    }
                    className="h-11 bg-background/50 border-border/50 focus:border-primary/50 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime" className="text-sm font-medium">
                    End Time
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        endTime: e.target.value,
                      }))
                    }
                    className="h-11 bg-background/50 border-border/50 focus:border-primary/50 rounded-xl"
                  />
                </div>
              </div>

              {/* Duration Presets */}
              <div className="flex gap-2">
                {DURATION_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleDurationPreset(preset.minutes)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-border/30"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Location */}
          <div className="space-y-2">
            <Label
              htmlFor="location"
              className="text-sm font-medium flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-muted-foreground" />
              Location
            </Label>
            <Input
              id="location"
              placeholder="Office, Zoom, etc..."
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              className="h-11 bg-background/50 border-border/50 focus:border-primary/50 rounded-xl"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Add notes or details..."
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="min-h-[80px] bg-background/50 border-border/50 focus:border-primary/50 rounded-xl resize-none"
            />
          </div>
        </form>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || !formData.title.trim()}
            className="rounded-xl"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {mode === "create" ? "Creating..." : "Saving..."}
              </>
            ) : (
              <>{mode === "create" ? "Create Event" : "Save Changes"}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
