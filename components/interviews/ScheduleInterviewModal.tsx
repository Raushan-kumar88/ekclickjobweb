"use client";

import { useState } from "react";
import { CalendarIcon, VideoIcon, PhoneIcon, MapPinIcon, LinkIcon, ClockIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useScheduleInterview } from "@/hooks/useInterviews";
import { useAuthStore } from "@/stores/authStore";
import type { InterviewType } from "@/types";

const DURATIONS = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
];

const TYPE_OPTIONS: { value: InterviewType; label: string; icon: React.ElementType }[] = [
  { value: "video", label: "Video Call", icon: VideoIcon },
  { value: "phone", label: "Phone Call", icon: PhoneIcon },
  { value: "in-person", label: "In Person", icon: MapPinIcon },
];

interface ScheduleInterviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  seekerId: string;
  seekerName: string;
  onSuccess?: () => void;
}

export function ScheduleInterviewModal({
  open,
  onOpenChange,
  applicationId,
  jobId,
  jobTitle,
  companyName,
  seekerId,
  seekerName,
  onSuccess,
}: ScheduleInterviewModalProps) {
  const uid = useAuthStore((s) => s.uid);
  const scheduleInterview = useScheduleInterview();

  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState(45);
  const [type, setType] = useState<InterviewType>("video");
  const [meetingLink, setMeetingLink] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  // Min date = today
  const minDate = new Date().toISOString().slice(0, 10);

  async function handleSubmit() {
    if (!date) { toast.error("Please select a date"); return; }
    if (!uid) return;

    // Parse date + time safely using explicit parts
    const [year, month, day] = date.split("-").map(Number);
    const [hours, minutes] = time.split(":").map(Number);
    const scheduledAt = new Date(year, month - 1, day, hours, minutes, 0);

    if (isNaN(scheduledAt.getTime())) {
      toast.error("Invalid date or time. Please check your selection.");
      return;
    }
    if (scheduledAt <= new Date()) {
      toast.error("Please select a future date and time");
      return;
    }

    try {
      await scheduleInterview.mutateAsync({
        applicationId,
        jobId,
        jobTitle,
        companyName,
        employerId: uid,
        seekerId,
        seekerName,
        scheduledAt,
        duration,
        type,
        meetingLink: meetingLink.trim() || undefined,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      toast.success(`Interview scheduled with ${seekerName}`);
      // Reset form before closing
      setDate(""); setTime("10:00"); setDuration(45); setType("video");
      setMeetingLink(""); setLocation(""); setNotes("");
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "Unknown error";
      console.error("Schedule interview error:", err);
      toast.error(`Failed to schedule: ${msg}`);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Interview</DialogTitle>
          <p className="text-sm text-muted-foreground">
            with <span className="font-medium text-foreground">{seekerName}</span> for{" "}
            <span className="font-medium text-foreground">{jobTitle}</span>
          </p>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Interview type */}
          <div className="space-y-1.5">
            <Label>Interview Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {TYPE_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 text-xs font-medium transition-all ${
                    type === value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="iDate">
                <span className="flex items-center gap-1.5">
                  <CalendarIcon className="h-3.5 w-3.5" /> Date <span className="text-destructive">*</span>
                </span>
              </Label>
              <Input
                id="iDate"
                type="date"
                min={minDate}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="iTime">
                <span className="flex items-center gap-1.5">
                  <ClockIcon className="h-3.5 w-3.5" /> Time <span className="text-destructive">*</span>
                </span>
              </Label>
              <Input
                id="iTime"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <Label>Duration</Label>
            <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map((d) => (
                  <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Meeting link or location */}
          {type === "video" && (
            <div className="space-y-1.5">
              <Label htmlFor="iLink">
                <span className="flex items-center gap-1.5">
                  <LinkIcon className="h-3.5 w-3.5" /> Meeting Link
                </span>
              </Label>
              <Input
                id="iLink"
                placeholder="https://meet.google.com/..."
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
            </div>
          )}
          {type === "in-person" && (
            <div className="space-y-1.5">
              <Label htmlFor="iLocation">
                <span className="flex items-center gap-1.5">
                  <MapPinIcon className="h-3.5 w-3.5" /> Location
                </span>
              </Label>
              <Input
                id="iLocation"
                placeholder="Office address or room"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="iNotes">Notes for candidate <span className="text-muted-foreground">(optional)</span></Label>
            <textarea
              id="iNotes"
              rows={2}
              placeholder="What to prepare, dress code, topics to cover..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
            />
          </div>
        </div>

        <DialogFooter showCloseButton>
          <Button
            onClick={handleSubmit}
            disabled={scheduleInterview.isPending}
            className="gap-2"
          >
            <CalendarIcon className="h-4 w-4" />
            {scheduleInterview.isPending ? "Scheduling..." : "Schedule Interview"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
