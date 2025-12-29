import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface ScheduleRecord {
  id: string;
  name: string;
  schedule_type: string;
  zone: string | null;
  start_time: string;
  end_time: string | null;
  days_of_week: number[] | null;
  is_active: boolean | null;
  user_id: string;
  created_at: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  type: 'irrigation' | 'lighting' | 'ventilation';
  zone: string;
  startTime: string;
  endTime: string;
  days: number[];
  isActive: boolean;
  color: string;
}

const typeConfig = {
  irrigation: { color: 'bg-blue-500' },
  lighting: { color: 'bg-amber-500' },
  ventilation: { color: 'bg-emerald-500' },
};

const toScheduleEvent = (record: ScheduleRecord): ScheduleEvent => ({
  id: record.id,
  title: record.name,
  type: record.schedule_type as 'irrigation' | 'lighting' | 'ventilation',
  zone: record.zone || 'All Zones',
  startTime: record.start_time,
  endTime: record.end_time || record.start_time,
  days: record.days_of_week || [1, 2, 3, 4, 5],
  isActive: record.is_active ?? true,
  color: typeConfig[record.schedule_type as keyof typeof typeConfig]?.color || 'bg-gray-500',
});

const toScheduleRecord = (event: ScheduleEvent, userId: string): Partial<ScheduleRecord> => ({
  id: event.id,
  name: event.title,
  schedule_type: event.type,
  zone: event.zone === 'All Zones' ? null : event.zone,
  start_time: event.startTime,
  end_time: event.endTime,
  days_of_week: event.days,
  is_active: event.isActive,
  user_id: userId,
});

export const useSchedules = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch schedules
  const fetchSchedules = useCallback(async () => {
    if (!user) {
      setSchedules([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setSchedules((data || []).map(toScheduleEvent));
      setError(null);
    } catch (err) {
      console.error('Error fetching schedules:', err);
      setError('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create schedule
  const createSchedule = async (event: Omit<ScheduleEvent, 'id'>) => {
    if (!user) return null;

    try {
      const newEvent = { ...event, id: crypto.randomUUID() };
      const record = toScheduleRecord(newEvent as ScheduleEvent, user.id);

      const { data, error } = await supabase
        .from('schedules')
        .insert({
          name: record.name!,
          schedule_type: record.schedule_type!,
          zone: record.zone,
          start_time: record.start_time!,
          end_time: record.end_time,
          days_of_week: record.days_of_week,
          is_active: record.is_active,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const createdEvent = toScheduleEvent(data);
      setSchedules(prev => [createdEvent, ...prev]);
      
      toast({ title: 'Schedule Created', description: `${createdEvent.title} has been added.` });
      return createdEvent;
    } catch (err) {
      console.error('Error creating schedule:', err);
      toast({ title: 'Error', description: 'Failed to create schedule', variant: 'destructive' });
      return null;
    }
  };

  // Update schedule
  const updateSchedule = async (event: ScheduleEvent) => {
    if (!user) return false;

    try {
      const record = toScheduleRecord(event, user.id);

      const { error } = await supabase
        .from('schedules')
        .update({
          name: record.name!,
          schedule_type: record.schedule_type!,
          zone: record.zone,
          start_time: record.start_time!,
          end_time: record.end_time,
          days_of_week: record.days_of_week,
          is_active: record.is_active,
        })
        .eq('id', event.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setSchedules(prev => prev.map(s => s.id === event.id ? event : s));
      toast({ title: 'Schedule Updated', description: `${event.title} has been updated.` });
      return true;
    } catch (err) {
      console.error('Error updating schedule:', err);
      toast({ title: 'Error', description: 'Failed to update schedule', variant: 'destructive' });
      return false;
    }
  };

  // Delete schedule
  const deleteSchedule = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setSchedules(prev => prev.filter(s => s.id !== id));
      toast({ title: 'Schedule Deleted', description: 'The schedule has been removed.' });
      return true;
    } catch (err) {
      console.error('Error deleting schedule:', err);
      toast({ title: 'Error', description: 'Failed to delete schedule', variant: 'destructive' });
      return false;
    }
  };

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    fetchSchedules();

    const channel = supabase
      .channel('schedules-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schedules',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newEvent = toScheduleEvent(payload.new as ScheduleRecord);
            setSchedules(prev => {
              if (prev.some(s => s.id === newEvent.id)) return prev;
              return [newEvent, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedEvent = toScheduleEvent(payload.new as ScheduleRecord);
            setSchedules(prev => prev.map(s => s.id === updatedEvent.id ? updatedEvent : s));
          } else if (payload.eventType === 'DELETE') {
            setSchedules(prev => prev.filter(s => s.id !== (payload.old as { id: string }).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchSchedules]);

  return {
    schedules,
    loading,
    error,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    refetch: fetchSchedules,
  };
};
