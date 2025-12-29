import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay, parseISO, setHours, setMinutes } from 'date-fns';
import { Calendar, Clock, Droplets, Lightbulb, Wind, Plus, GripVertical, Trash2, Edit2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Schedule } from '@/types/greenhouse';
import { zones } from '@/data/greenhouseData';
import { useSchedules, ScheduleEvent } from '@/hooks/useSchedules';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

interface ScheduleCalendarProps {
  initialSchedules?: Schedule[];
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const typeConfig = {
  irrigation: { icon: Droplets, color: 'bg-blue-500', label: 'Irrigation', textColor: 'text-blue-500' },
  lighting: { icon: Lightbulb, color: 'bg-amber-500', label: 'Lighting', textColor: 'text-amber-500' },
  ventilation: { icon: Wind, color: 'bg-emerald-500', label: 'Ventilation', textColor: 'text-emerald-500' },
};

const parseTime = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours + minutes / 60;
};

const formatHour = (hour: number) => {
  const h = Math.floor(hour);
  return h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;
};

export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({ initialSchedules }) => {
  const { user } = useAuth();
  const { schedules, loading, createSchedule, updateSchedule, deleteSchedule } = useSchedules();
  
  const [draggedSchedule, setDraggedSchedule] = useState<ScheduleEvent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleEvent | null>(null);
  const [selectedView, setSelectedView] = useState<'week' | 'day'>('week');
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [saving, setSaving] = useState(false);

  const [newSchedule, setNewSchedule] = useState<Partial<ScheduleEvent>>({
    title: '',
    type: 'irrigation',
    zone: 'Zone A',
    startTime: '08:00',
    endTime: '08:30',
    days: [1, 2, 3, 4, 5],
    isActive: true,
  });

  const handleDragStart = (e: React.DragEvent, schedule: ScheduleEvent) => {
    setDraggedSchedule(schedule);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, dayIndex: number, hour: number) => {
    e.preventDefault();
    if (!draggedSchedule) return;

    const duration = parseTime(draggedSchedule.endTime) - parseTime(draggedSchedule.startTime);
    const newStartHour = Math.max(0, Math.min(23 - duration, hour));
    const newStartTime = `${String(Math.floor(newStartHour)).padStart(2, '0')}:00`;
    const newEndTime = `${String(Math.floor(newStartHour + duration)).padStart(2, '0')}:${String(Math.round((duration % 1) * 60)).padStart(2, '0')}`;

    const newDays = draggedSchedule.days.includes(dayIndex) 
      ? draggedSchedule.days 
      : [...draggedSchedule.days, dayIndex].sort();
    
    const updatedEvent: ScheduleEvent = {
      ...draggedSchedule,
      startTime: newStartTime,
      endTime: newEndTime,
      days: newDays,
    };

    await updateSchedule(updatedEvent);
    setDraggedSchedule(null);
  };

  const handleAddSchedule = async () => {
    if (!newSchedule.title || !newSchedule.type) return;

    setSaving(true);
    
    const schedule: Omit<ScheduleEvent, 'id'> = {
      title: newSchedule.title!,
      type: newSchedule.type as 'irrigation' | 'lighting' | 'ventilation',
      zone: newSchedule.zone!,
      startTime: newSchedule.startTime!,
      endTime: newSchedule.endTime!,
      days: newSchedule.days!,
      isActive: newSchedule.isActive!,
      color: typeConfig[newSchedule.type as keyof typeof typeConfig].color,
    };

    if (editingSchedule) {
      await updateSchedule({ ...schedule, id: editingSchedule.id });
    } else {
      await createSchedule(schedule);
    }

    setSaving(false);
    setIsDialogOpen(false);
    setEditingSchedule(null);
    setNewSchedule({
      title: '',
      type: 'irrigation',
      zone: 'Zone A',
      startTime: '08:00',
      endTime: '08:30',
      days: [1, 2, 3, 4, 5],
      isActive: true,
    });
  };

  const handleEditSchedule = (schedule: ScheduleEvent) => {
    setEditingSchedule(schedule);
    setNewSchedule(schedule);
    setIsDialogOpen(true);
  };

  const handleDeleteSchedule = async (id: string) => {
    await deleteSchedule(id);
  };

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Please log in to manage your schedules.</p>
        </div>
      </Card>
    );
  }

  // Show loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const toggleDay = (day: number) => {
    setNewSchedule(prev => ({
      ...prev,
      days: prev.days?.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...(prev.days || []), day].sort(),
    }));
  };

  const getSchedulesForDayAndHour = (dayIndex: number, hour: number) => {
    return schedules.filter(s => {
      if (!s.days.includes(dayIndex)) return false;
      const start = parseTime(s.startTime);
      const end = parseTime(s.endTime);
      return hour >= start && hour < end;
    });
  };

  const getScheduleHeight = (schedule: ScheduleEvent) => {
    const duration = parseTime(schedule.endTime) - parseTime(schedule.startTime);
    return Math.max(duration * 48, 24);
  };

  const getScheduleTop = (schedule: ScheduleEvent, hour: number) => {
    const start = parseTime(schedule.startTime);
    return (start - hour) * 48;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
            <Button
              variant={selectedView === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedView('week')}
            >
              Week
            </Button>
            <Button
              variant={selectedView === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedView('day')}
            >
              Day
            </Button>
          </div>
          {selectedView === 'day' && (
            <Select value={String(selectedDay)} onValueChange={(v) => setSelectedDay(Number(v))}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FULL_DAYS.map((day, i) => (
                  <SelectItem key={i} value={String(i)}>{day}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="hidden md:flex items-center gap-4 text-sm">
            {Object.entries(typeConfig).map(([key, config]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className={cn('w-3 h-3 rounded', config.color)} />
                <span className="text-muted-foreground">{config.label}</span>
              </div>
            ))}
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingSchedule ? 'Edit Schedule' : 'Create New Schedule'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Title</Label>
                  <Input
                    value={newSchedule.title}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Morning Irrigation"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Type</Label>
                    <Select
                      value={newSchedule.type}
                      onValueChange={(v) => setNewSchedule(prev => ({ ...prev, type: v as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="irrigation">Irrigation</SelectItem>
                        <SelectItem value="lighting">Lighting</SelectItem>
                        <SelectItem value="ventilation">Ventilation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Zone</Label>
                    <Select
                      value={newSchedule.zone}
                      onValueChange={(v) => setNewSchedule(prev => ({ ...prev, zone: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All Zones">All Zones</SelectItem>
                        {zones.map(zone => (
                          <SelectItem key={zone.id} value={zone.name.split(' - ')[0]}>{zone.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={newSchedule.startTime}
                      onChange={(e) => setNewSchedule(prev => ({ ...prev, startTime: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={newSchedule.endTime}
                      onChange={(e) => setNewSchedule(prev => ({ ...prev, endTime: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Days</Label>
                  <div className="flex gap-1">
                    {DAYS.map((day, i) => (
                      <Button
                        key={day}
                        type="button"
                        variant={newSchedule.days?.includes(i) ? 'default' : 'outline'}
                        size="sm"
                        className="w-10 h-10 p-0"
                        onClick={() => toggleDay(i)}
                      >
                        {day.charAt(0)}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Active</Label>
                  <Switch
                    checked={newSchedule.isActive}
                    onCheckedChange={(v) => setNewSchedule(prev => ({ ...prev, isActive: v }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>Cancel</Button>
                <Button onClick={handleAddSchedule} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingSchedule ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Schedule List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {schedules.map(schedule => {
          const config = typeConfig[schedule.type];
          const Icon = config.icon;
          return (
            <Card
              key={schedule.id}
              className={cn(
                'cursor-move transition-all hover:shadow-md',
                !schedule.isActive && 'opacity-60'
              )}
              draggable
              onDragStart={(e) => handleDragStart(e, schedule)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className={cn('p-2 rounded-lg', config.color, 'bg-opacity-20')}>
                      <Icon className={cn('w-4 h-4', config.textColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm truncate">{schedule.title}</h4>
                        {!schedule.isActive && (
                          <Badge variant="outline" className="text-xs">Paused</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{schedule.zone}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{schedule.startTime} - {schedule.endTime}</span>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {DAYS.map((day, i) => (
                          <span
                            key={day}
                            className={cn(
                              'w-5 h-5 rounded text-[10px] flex items-center justify-center',
                              schedule.days.includes(i)
                                ? `${config.color} text-white`
                                : 'bg-muted text-muted-foreground'
                            )}
                          >
                            {day.charAt(0)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditSchedule(schedule)}>
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteSchedule(schedule.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {selectedView === 'week' ? 'Weekly Schedule' : `${FULL_DAYS[selectedDay]} Schedule`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header */}
              <div className="grid border-b" style={{ gridTemplateColumns: `80px repeat(${selectedView === 'week' ? 7 : 1}, 1fr)` }}>
                <div className="p-3 text-sm font-medium text-muted-foreground border-r">Time</div>
                {(selectedView === 'week' ? DAYS : [DAYS[selectedDay]]).map((day, i) => (
                  <div key={day} className="p-3 text-sm font-medium text-center border-r last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>

              {/* Time slots */}
              <div className="max-h-[500px] overflow-y-auto">
                {HOURS.filter(h => h >= 5 && h <= 22).map(hour => (
                  <div
                    key={hour}
                    className="grid border-b"
                    style={{ gridTemplateColumns: `80px repeat(${selectedView === 'week' ? 7 : 1}, 1fr)` }}
                  >
                    <div className="p-2 text-xs text-muted-foreground border-r flex items-start justify-end pr-3">
                      {formatHour(hour)}
                    </div>
                    {(selectedView === 'week' ? DAYS.map((_, i) => i) : [selectedDay]).map(dayIndex => {
                      const schedulesAtHour = getSchedulesForDayAndHour(dayIndex, hour);
                      const isFirstHour = schedulesAtHour.filter(s => Math.floor(parseTime(s.startTime)) === hour);
                      
                      return (
                        <div
                          key={dayIndex}
                          className="relative h-12 border-r last:border-r-0 hover:bg-muted/30 transition-colors"
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, dayIndex, hour)}
                        >
                          {isFirstHour.map((schedule, idx) => {
                            const config = typeConfig[schedule.type];
                            const Icon = config.icon;
                            const height = getScheduleHeight(schedule);
                            
                            return (
                              <div
                                key={schedule.id}
                                className={cn(
                                  'absolute left-0.5 right-0.5 rounded px-1.5 py-0.5 text-white text-[10px] overflow-hidden cursor-move z-10',
                                  config.color,
                                  !schedule.isActive && 'opacity-50'
                                )}
                                style={{
                                  height: `${height}px`,
                                  top: 0,
                                }}
                                draggable
                                onDragStart={(e) => handleDragStart(e, schedule)}
                              >
                                <div className="flex items-center gap-1">
                                  <GripVertical className="w-2.5 h-2.5 opacity-60" />
                                  <Icon className="w-2.5 h-2.5" />
                                  <span className="truncate font-medium">{schedule.title}</span>
                                </div>
                                {height > 30 && (
                                  <div className="text-[9px] opacity-80 mt-0.5">
                                    {schedule.startTime} - {schedule.endTime}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        Drag and drop schedules to reschedule • Click edit to modify details
      </p>
    </div>
  );
};
