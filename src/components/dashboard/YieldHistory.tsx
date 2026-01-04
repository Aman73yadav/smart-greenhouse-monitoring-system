import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Plus, Loader2, BarChart3, Calendar } from 'lucide-react';

interface YieldRecord {
  id: string;
  plant_type: string;
  zone: string | null;
  predicted_yield: number | null;
  actual_yield: number | null;
  predicted_harvest_date: string | null;
  actual_harvest_date: string | null;
  notes: string | null;
  created_at: string;
}

const PLANT_TYPES = ['Tomatoes', 'Lettuce', 'Peppers', 'Strawberries', 'Carrots', 'Cucumbers', 'Eggplant'];
const ZONES = ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E'];

export const YieldHistory: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<YieldRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newRecord, setNewRecord] = useState({
    plant_type: '',
    zone: '',
    predicted_yield: '',
    actual_yield: '',
    predicted_harvest_date: '',
    actual_harvest_date: '',
    notes: '',
  });

  useEffect(() => {
    if (user) {
      fetchRecords();
    }
  }, [user]);

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('yield_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching yield records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRecord = async () => {
    if (!user || !newRecord.plant_type) {
      toast({ title: "Error", description: "Please select a plant type", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from('yield_records').insert({
        user_id: user.id,
        plant_type: newRecord.plant_type,
        zone: newRecord.zone || null,
        predicted_yield: newRecord.predicted_yield ? parseFloat(newRecord.predicted_yield) : null,
        actual_yield: newRecord.actual_yield ? parseFloat(newRecord.actual_yield) : null,
        predicted_harvest_date: newRecord.predicted_harvest_date || null,
        actual_harvest_date: newRecord.actual_harvest_date || null,
        notes: newRecord.notes || null,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Yield record saved!" });
      setIsDialogOpen(false);
      setNewRecord({ plant_type: '', zone: '', predicted_yield: '', actual_yield: '', predicted_harvest_date: '', actual_harvest_date: '', notes: '' });
      fetchRecords();
    } catch (error) {
      console.error('Error saving record:', error);
      toast({ title: "Error", description: "Failed to save record", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // Prepare chart data
  const chartData = PLANT_TYPES.map(type => {
    const typeRecords = records.filter(r => r.plant_type === type);
    const totalPredicted = typeRecords.reduce((sum, r) => sum + (r.predicted_yield || 0), 0);
    const totalActual = typeRecords.reduce((sum, r) => sum + (r.actual_yield || 0), 0);
    return {
      name: type,
      predicted: totalPredicted,
      actual: totalActual,
      accuracy: totalPredicted > 0 ? Math.round((totalActual / totalPredicted) * 100) : 0,
    };
  }).filter(d => d.predicted > 0 || d.actual > 0);

  // Timeline data
  const timelineData = records
    .filter(r => r.actual_harvest_date && r.actual_yield)
    .sort((a, b) => new Date(a.actual_harvest_date!).getTime() - new Date(b.actual_harvest_date!).getTime())
    .slice(-10)
    .map(r => ({
      date: new Date(r.actual_harvest_date!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      yield: r.actual_yield,
      plant: r.plant_type,
    }));

  const totalPredicted = records.reduce((sum, r) => sum + (r.predicted_yield || 0), 0);
  const totalActual = records.reduce((sum, r) => sum + (r.actual_yield || 0), 0);
  const overallAccuracy = totalPredicted > 0 ? Math.round((totalActual / totalPredicted) * 100) : 0;

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Yield History & Tracking</CardTitle>
              <p className="text-sm text-muted-foreground">
                Compare predicted vs actual yields over time
              </p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Record
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Yield Record</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Plant Type *</Label>
                    <Select value={newRecord.plant_type} onValueChange={(v) => setNewRecord(p => ({ ...p, plant_type: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select plant" /></SelectTrigger>
                      <SelectContent>
                        {PLANT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Zone</Label>
                    <Select value={newRecord.zone} onValueChange={(v) => setNewRecord(p => ({ ...p, zone: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select zone" /></SelectTrigger>
                      <SelectContent>
                        {ZONES.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Predicted Yield (kg)</Label>
                    <Input type="number" step="0.1" value={newRecord.predicted_yield} onChange={(e) => setNewRecord(p => ({ ...p, predicted_yield: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Actual Yield (kg)</Label>
                    <Input type="number" step="0.1" value={newRecord.actual_yield} onChange={(e) => setNewRecord(p => ({ ...p, actual_yield: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Predicted Harvest</Label>
                    <Input type="date" value={newRecord.predicted_harvest_date} onChange={(e) => setNewRecord(p => ({ ...p, predicted_harvest_date: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Actual Harvest</Label>
                    <Input type="date" value={newRecord.actual_harvest_date} onChange={(e) => setNewRecord(p => ({ ...p, actual_harvest_date: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input value={newRecord.notes} onChange={(e) => setNewRecord(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes..." />
                </div>
                <Button onClick={handleSaveRecord} disabled={isSaving} className="w-full">
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save Record
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-primary/5 rounded-lg text-center">
            <p className="text-xl font-bold text-primary">{records.length}</p>
            <p className="text-xs text-muted-foreground">Records</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <p className="text-xl font-bold">{totalPredicted.toFixed(1)} kg</p>
            <p className="text-xs text-muted-foreground">Predicted</p>
          </div>
          <div className="p-3 bg-success/10 rounded-lg text-center">
            <p className="text-xl font-bold text-success">{totalActual.toFixed(1)} kg</p>
            <p className="text-xs text-muted-foreground">Actual</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg text-center">
            <p className="text-xl font-bold text-primary">{overallAccuracy}%</p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </div>
        </div>

        {isLoading ? (
          <div className="h-[200px] flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : chartData.length > 0 ? (
          <>
            {/* Bar Chart - Predicted vs Actual */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Predicted vs Actual by Plant Type
              </h4>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="predicted" name="Predicted (kg)" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="actual" name="Actual (kg)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Timeline Chart */}
            {timelineData.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Harvest Timeline
                </h4>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value, name, props) => [`${value} kg`, props.payload.plant]}
                      />
                      <Line type="monotone" dataKey="yield" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="h-[200px] flex flex-col items-center justify-center text-center p-6 border border-dashed border-border rounded-lg">
            <BarChart3 className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-1">No yield records yet</p>
            <p className="text-xs text-muted-foreground">Add your first record to start tracking yields</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
