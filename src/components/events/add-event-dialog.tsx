/**
 * @project AncestorTree
 * @file src/components/events/add-event-dialog.tsx
 * @description Dialog form for adding new events
 * @version 1.1.0
 * @updated 2026-02-26
 */

"use client";

import { Search, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { EVENT_TYPE_META as EVENT_TYPE_LABELS } from '@constants';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateEvent } from "@/hooks/use-events";
import { useSearchPeople } from "@/hooks/use-people";
import { parseLunarString } from "@/lib/lunar-calendar";
import { cn } from "@/lib/utils";
import type { EventType, Person } from "@/types";

interface AddEventDialogProps {
  onClose: () => void;
}

export function AddEventDialog({ onClose }: AddEventDialogProps) {
  const createEvent = useCreateEvent();
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState<EventType>("gio");
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [personQuery, setPersonQuery] = useState("");
  const [personDropOpen, setPersonDropOpen] = useState(false);
  const [eventLunar, setEventLunar] = useState("");
  const [lunarError, setLunarError] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [recurring, setRecurring] = useState(true);

  const { data: searchResults, isFetching } = useSearchPeople(personQuery);
  const filteredResults = (searchResults ?? []).filter(
    (person) => !person.is_living,
  );

  const validateLunar = (value: string) => {
    setEventLunar(value);
    if (!value) {
      setLunarError("");
      return;
    }

    setLunarError(
      parseLunarString(value)
        ? ""
        : "Sai định dạng. VD: 15/7 (ngày/tháng)",
    );
  };

  const handleSelectPerson = (person: Person) => {
    setSelectedPerson(person);
    setPersonQuery("");
    setPersonDropOpen(false);

    if (eventType === "gio") {
      setTitle(`Giỗ ${person.display_name}`);
      if (person.death_lunar) {
        setEventLunar(person.death_lunar);
        setLunarError("");
      }
    }
  };

  const handleClearPerson = () => {
    setSelectedPerson(null);
    setPersonQuery("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề");
      return;
    }

    if (eventLunar && !parseLunarString(eventLunar)) {
      toast.error("Ngày âm lịch không hợp lệ");
      return;
    }

    try {
      await createEvent.mutateAsync({
        title: title.trim(),
        event_type: eventType,
        person_id: selectedPerson?.id,
        event_lunar: eventLunar || undefined,
        event_date: eventDate || undefined,
        location: location || undefined,
        description: description || undefined,
        recurring,
      });
      toast.success("Đã thêm sự kiện");
      onClose();
    } catch {
      toast.error("Lỗi khi thêm sự kiện");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Loại sự kiện</Label>
        <Select
          value={eventType}
          onValueChange={(value) => setEventType(value as EventType)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(EVENT_TYPE_LABELS).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {eventType === "gio" && (
        <div className="space-y-2">
          <Label>Người được giỗ</Label>
          {selectedPerson ? (
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 p-2">
              <div
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                  selectedPerson.gender === 1
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary text-secondary-foreground",
                )}
              >
                {selectedPerson.display_name.slice(-1)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {selectedPerson.display_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedPerson.death_lunar
                    ? `Giỗ ${selectedPerson.death_lunar} ÂL`
                    : `Đời ${selectedPerson.generation}`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                type="button"
                className="shrink-0"
                onClick={handleClearPerson}
                aria-label="Bỏ chọn người được giỗ"
              >
                <X className="size-3" />
              </Button>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên... (gõ tối thiểu 2 ký tự)"
                value={personQuery}
                onChange={(event) => {
                  setPersonQuery(event.target.value);
                  setPersonDropOpen(event.target.value.length >= 2);
                }}
                onFocus={() => {
                  if (personQuery.length >= 2) {
                    setPersonDropOpen(true);
                  }
                }}
                onBlur={() => setTimeout(() => setPersonDropOpen(false), 150)}
                className="pl-9"
              />
              {personDropOpen && (
                <div className="absolute z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md">
                  {isFetching ? (
                    <p className="p-3 text-sm text-muted-foreground">
                      Đang tìm...
                    </p>
                  ) : filteredResults.length === 0 ? (
                    <p className="p-3 text-sm text-muted-foreground">
                      {personQuery.length >= 2
                        ? "Không tìm thấy thành viên đã mất"
                        : "Gõ tối thiểu 2 ký tự"}
                    </p>
                  ) : (
                    filteredResults.map((person) => (
                      <button
                        key={person.id}
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-accent hover:text-accent-foreground"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          handleSelectPerson(person);
                        }}
                      >
                        <div
                          className={cn(
                            "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                            person.gender === 1
                              ? "bg-primary/10 text-primary"
                              : "bg-secondary text-secondary-foreground",
                          )}
                        >
                          {person.display_name.slice(-1)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {person.display_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Đời {person.generation}
                            {person.death_lunar
                              ? ` · Giỗ ${person.death_lunar} ÂL`
                              : ""}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Tiêu đề</Label>
        <Input
          id="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="VD: Giỗ Ông Nội"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="lunar">Ngày âm lịch (DD/MM)</Label>
          <Input
            id="lunar"
            value={eventLunar}
            onChange={(event) => validateLunar(event.target.value)}
            placeholder="15/7"
            className={cn(lunarError && "border-destructive")}
            aria-invalid={Boolean(lunarError)}
            aria-describedby={lunarError ? "lunar-error" : undefined}
          />
          {lunarError && (
            <p id="lunar-error" className="text-xs text-destructive">
              {lunarError}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Ngày dương lịch</Label>
          <Input
            id="date"
            type="date"
            value={eventDate}
            onChange={(event) => setEventDate(event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Địa điểm</Label>
        <Input
          id="location"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="VD: Nhà thờ họ"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="desc">Ghi chú</Label>
        <Textarea
          id="desc"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={2}
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="recurring"
          checked={recurring}
          onCheckedChange={(checked) => setRecurring(checked === true)}
        />
        <Label htmlFor="recurring" className="font-normal">
          Lặp lại hàng năm
        </Label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Hủy
        </Button>
        <Button type="submit" disabled={createEvent.isPending}>
          {createEvent.isPending ? 'Đang lưu...' : 'Thêm sự kiện'}
        </Button>
      </DialogFooter>
    </form>
  );
}
