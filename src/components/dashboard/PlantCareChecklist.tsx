import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { CheckCircle2, Circle, Plus, Loader2, ListTodo, Droplets, Sun, Scissors, Bug, Sparkles, Trash2 } from 'lucide-react';

interface CareTask {
  id: string;
  zone: string;
  task_type: string;
  title: string;
  description: string | null;
  frequency: string;
  is_completed: boolean;
  completed_at: string | null;
  due_date: string;
}

const ZONES = ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E'];
const TASK_TYPES = [
  { value: 'watering', label: 'Watering', icon: Droplets, color: 'text-blue-500' },
  { value: 'lighting', label: 'Lighting', icon: Sun, color: 'text-yellow-500' },
  { value: 'pruning', label: 'Pruning', icon: Scissors, color: 'text-green-500' },
  { value: 'pest_control', label: 'Pest Control', icon: Bug, color: 'text-red-500' },
  { value: 'fertilizing', label: 'Fertilizing', icon: Sparkles, color: 'text-purple-500' },
  { value: 'other', label: 'Other', icon: ListTodo, color: 'text-muted-foreground' },
];
const FREQUENCIES = ['daily', 'weekly', 'biweekly', 'monthly'];

// Default tasks for new users
const DEFAULT_TASKS = [
  { zone: 'Zone A', task_type: 'watering', title: 'Water tomato plants', frequency: 'daily' },
  { zone: 'Zone A', task_type: 'pruning', title: 'Remove suckers from tomatoes', frequency: 'weekly' },
  { zone: 'Zone B', task_type: 'watering', title: 'Mist lettuce beds', frequency: 'daily' },
  { zone: 'Zone C', task_type: 'fertilizing', title: 'Apply pepper fertilizer', frequency: 'biweekly' },
  { zone: 'Zone D', task_type: 'pest_control', title: 'Check strawberries for pests', frequency: 'weekly' },
  { zone: 'Zone E', task_type: 'watering', title: 'Deep water root vegetables', frequency: 'weekly' },
];

export const PlantCareChecklist: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newTask, setNewTask] = useState({
    zone: '',
    task_type: '',
    title: '',
    description: '',
    frequency: 'daily',
  });

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('care_tasks')
        .select('*')
        .gte('due_date', today)
        .order('due_date', { ascending: true });

      if (error) throw error;
      
      // If no tasks exist, create default tasks
      if (!data || data.length === 0) {
        await createDefaultTasks();
      } else {
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultTasks = async () => {
    if (!user) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const tasksToInsert = DEFAULT_TASKS.map(t => ({
        user_id: user.id,
        zone: t.zone,
        task_type: t.task_type,
        title: t.title,
        frequency: t.frequency,
        due_date: today,
      }));

      const { data, error } = await supabase
        .from('care_tasks')
        .insert(tasksToInsert)
        .select();

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error creating default tasks:', error);
    }
  };

  const handleToggleTask = async (taskId: string, isCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from('care_tasks')
        .update({ 
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null
        })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, is_completed: isCompleted, completed_at: isCompleted ? new Date().toISOString() : null } : t
      ));

      if (isCompleted) {
        toast({ title: "Task completed! 🎉", description: "Great job taking care of your plants!" });
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast({ title: "Error", description: "Failed to update task", variant: "destructive" });
    }
  };

  const handleAddTask = async () => {
    if (!user || !newTask.zone || !newTask.task_type || !newTask.title) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('care_tasks')
        .insert({
          user_id: user.id,
          zone: newTask.zone,
          task_type: newTask.task_type,
          title: newTask.title,
          description: newTask.description || null,
          frequency: newTask.frequency,
          due_date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => [data, ...prev]);
      setIsDialogOpen(false);
      setNewTask({ zone: '', task_type: '', title: '', description: '', frequency: 'daily' });
      toast({ title: "Task added!", description: "New care task created successfully" });
    } catch (error) {
      console.error('Error adding task:', error);
      toast({ title: "Error", description: "Failed to add task", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase.from('care_tasks').delete().eq('id', taskId);
      if (error) throw error;
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast({ title: "Task deleted" });
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const filteredTasks = selectedZone === 'all' ? tasks : tasks.filter(t => t.zone === selectedZone);
  const completedCount = filteredTasks.filter(t => t.is_completed).length;
  const totalCount = filteredTasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const getTaskIcon = (taskType: string) => {
    const type = TASK_TYPES.find(t => t.value === taskType);
    if (!type) return ListTodo;
    return type.icon;
  };

  const getTaskColor = (taskType: string) => {
    const type = TASK_TYPES.find(t => t.value === taskType);
    return type?.color || 'text-muted-foreground';
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <ListTodo className="w-5 h-5 text-success" />
            </div>
            <div>
              <CardTitle className="text-lg">Daily Care Checklist</CardTitle>
              <p className="text-sm text-muted-foreground">
                {completedCount}/{totalCount} tasks completed today
              </p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Care Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Zone *</Label>
                    <Select value={newTask.zone} onValueChange={(v) => setNewTask(p => ({ ...p, zone: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select zone" /></SelectTrigger>
                      <SelectContent>
                        {ZONES.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Task Type *</Label>
                    <Select value={newTask.task_type} onValueChange={(v) => setNewTask(p => ({ ...p, task_type: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {TASK_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Task Title *</Label>
                  <Input value={newTask.title} onChange={(e) => setNewTask(p => ({ ...p, title: e.target.value }))} placeholder="e.g., Water tomato plants" />
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select value={newTask.frequency} onValueChange={(v) => setNewTask(p => ({ ...p, frequency: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FREQUENCIES.map(f => <SelectItem key={f} value={f} className="capitalize">{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Input value={newTask.description} onChange={(e) => setNewTask(p => ({ ...p, description: e.target.value }))} placeholder="Additional details..." />
                </div>
                <Button onClick={handleAddTask} disabled={isSaving} className="w-full">
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Add Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progressPercent}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-success transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Zone filter tabs */}
        <Tabs value={selectedZone} onValueChange={setSelectedZone}>
          <TabsList className="w-full flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="all" className="text-xs flex-1 min-w-[60px]">All</TabsTrigger>
            {ZONES.map(zone => (
              <TabsTrigger key={zone} value={zone} className="text-xs flex-1 min-w-[60px]">
                {zone.replace('Zone ', '')}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Task list */}
        {isLoading ? (
          <div className="h-[200px] flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredTasks.length > 0 ? (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {filteredTasks.map(task => {
                const TaskIcon = getTaskIcon(task.task_type);
                return (
                  <div 
                    key={task.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                      task.is_completed 
                        ? 'bg-success/5 border-success/20' 
                        : 'bg-card border-border hover:border-primary/30'
                    }`}
                  >
                    <button
                      onClick={() => handleToggleTask(task.id, !task.is_completed)}
                      className="mt-0.5 flex-shrink-0"
                    >
                      {task.is_completed ? (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <TaskIcon className={`w-4 h-4 ${getTaskColor(task.task_type)}`} />
                        <span className={`text-sm font-medium ${task.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {task.zone}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 capitalize">
                          {task.frequency}
                        </Badge>
                        {task.description && (
                          <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {task.description}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="h-[150px] flex flex-col items-center justify-center text-center p-4 border border-dashed border-border rounded-lg">
            <ListTodo className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No tasks for this zone</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
