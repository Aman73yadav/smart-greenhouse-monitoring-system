import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Download, FileText, Loader2, Leaf, Thermometer, Droplets, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Plant {
  id: string;
  name: string;
  type: string;
  zone: string;
  growthStage: string;
  growthProgress: number;
  health: string;
  plantedDate: Date;
}

interface SensorData {
  type: string;
  value: number;
  unit: string;
  zone: string;
  status: string;
}

interface Schedule {
  id: string;
  name: string;
  zone: string;
  type: string;
  startTime: string;
  endTime: string;
  days: string[];
  isActive: boolean;
}

interface ReportGeneratorProps {
  plants: Plant[];
  sensorData: SensorData[];
  schedules?: Schedule[];
  analyticsData?: { yield: number; waterUsage: number; energyUsage: number; plantHealth: number }[];
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  plants,
  sensorData,
  schedules = [],
  analyticsData = []
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [includeSections, setIncludeSections] = useState({
    summary: true,
    plants: true,
    sensors: true,
    schedules: true,
    analytics: true,
    growthProgress: true,
  });

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Helper functions
      const addNewPageIfNeeded = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      const drawSectionHeader = (title: string, icon?: string) => {
        addNewPageIfNeeded(25);
        doc.setFillColor(34, 139, 34); // Forest green
        doc.roundedRect(margin, yPosition, pageWidth - margin * 2, 12, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${icon || ''} ${title}`, margin + 5, yPosition + 8);
        doc.setTextColor(0, 0, 0);
        yPosition += 18;
      };

      // ===== HEADER =====
      doc.setFillColor(22, 163, 74); // Primary green
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('🌱 Greenhouse Report', margin, 25);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${format(new Date(), 'PPpp')}`, margin, 35);
      
      doc.setTextColor(0, 0, 0);
      yPosition = 55;

      // ===== EXECUTIVE SUMMARY =====
      if (includeSections.summary) {
        drawSectionHeader('Executive Summary', '📊');
        
        const healthyPlants = plants.filter(p => p.health === 'excellent' || p.health === 'good').length;
        const healthRate = plants.length > 0 ? Math.round((healthyPlants / plants.length) * 100) : 0;
        
        const avgTemp = sensorData.filter(s => s.type === 'temperature').reduce((a, b) => a + b.value, 0) / Math.max(sensorData.filter(s => s.type === 'temperature').length, 1);
        const avgHumidity = sensorData.filter(s => s.type === 'humidity').reduce((a, b) => a + b.value, 0) / Math.max(sensorData.filter(s => s.type === 'humidity').length, 1);
        
        const summaryItems = [
          { label: 'Total Plants', value: plants.length.toString(), color: [34, 139, 34] },
          { label: 'Health Rate', value: `${healthRate}%`, color: healthRate > 80 ? [34, 139, 34] : [255, 165, 0] },
          { label: 'Avg Temperature', value: `${avgTemp.toFixed(1)}°C`, color: [255, 99, 71] },
          { label: 'Avg Humidity', value: `${avgHumidity.toFixed(1)}%`, color: [30, 144, 255] },
          { label: 'Active Schedules', value: schedules.filter(s => s.isActive).length.toString(), color: [138, 43, 226] },
        ];

        const cardWidth = (pageWidth - margin * 2 - 20) / 3;
        summaryItems.forEach((item, i) => {
          const row = Math.floor(i / 3);
          const col = i % 3;
          const x = margin + col * (cardWidth + 10);
          const y = yPosition + row * 25;
          
          doc.setFillColor(item.color[0], item.color[1], item.color[2]);
          doc.roundedRect(x, y, cardWidth, 20, 3, 3, 'F');
          
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(8);
          doc.text(item.label, x + 5, y + 8);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(item.value, x + 5, y + 16);
          doc.setFont('helvetica', 'normal');
        });
        
        yPosition += Math.ceil(summaryItems.length / 3) * 25 + 15;
        doc.setTextColor(0, 0, 0);
      }

      // ===== PLANT INVENTORY =====
      if (includeSections.plants && plants.length > 0) {
        addNewPageIfNeeded(60);
        drawSectionHeader('Plant Inventory', '🌿');
        
        // Table header
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, yPosition, pageWidth - margin * 2, 10, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        const headers = ['Name', 'Type', 'Zone', 'Stage', 'Progress', 'Health'];
        const colWidths = [35, 25, 25, 30, 25, 25];
        let xPos = margin + 3;
        headers.forEach((header, i) => {
          doc.text(header, xPos, yPosition + 7);
          xPos += colWidths[i];
        });
        yPosition += 12;
        doc.setFont('helvetica', 'normal');
        
        // Table rows
        plants.slice(0, 15).forEach((plant, index) => {
          addNewPageIfNeeded(12);
          
          if (index % 2 === 0) {
            doc.setFillColor(250, 250, 250);
            doc.rect(margin, yPosition - 2, pageWidth - margin * 2, 10, 'F');
          }
          
          xPos = margin + 3;
          doc.setFontSize(8);
          doc.text(plant.name.substring(0, 12), xPos, yPosition + 5);
          xPos += colWidths[0];
          doc.text(plant.type, xPos, yPosition + 5);
          xPos += colWidths[1];
          doc.text(plant.zone.substring(0, 8), xPos, yPosition + 5);
          xPos += colWidths[2];
          doc.text(plant.growthStage, xPos, yPosition + 5);
          xPos += colWidths[3];
          
          // Progress bar
          doc.setFillColor(220, 220, 220);
          doc.rect(xPos, yPosition + 2, 20, 4, 'F');
          doc.setFillColor(34, 139, 34);
          doc.rect(xPos, yPosition + 2, (plant.growthProgress / 100) * 20, 4, 'F');
          xPos += colWidths[4];
          
          // Health indicator
          const healthColors: Record<string, number[]> = {
            excellent: [34, 139, 34],
            good: [50, 205, 50],
            fair: [255, 165, 0],
            poor: [255, 69, 0]
          };
          const color = healthColors[plant.health] || [128, 128, 128];
          doc.setFillColor(color[0], color[1], color[2]);
          doc.circle(xPos + 5, yPosition + 4, 3, 'F');
          doc.setFontSize(7);
          doc.text(plant.health, xPos + 10, yPosition + 5);
          
          yPosition += 10;
        });
        
        if (plants.length > 15) {
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(`... and ${plants.length - 15} more plants`, margin, yPosition + 5);
          doc.setTextColor(0, 0, 0);
          yPosition += 10;
        }
        
        yPosition += 10;
      }

      // ===== GROWTH PROGRESS =====
      if (includeSections.growthProgress && plants.length > 0) {
        addNewPageIfNeeded(80);
        drawSectionHeader('Plant Growth Progress', '📈');
        
        // Growth stage distribution
        const stageGroups: Record<string, number> = {};
        plants.forEach(p => {
          stageGroups[p.growthStage] = (stageGroups[p.growthStage] || 0) + 1;
        });
        
        const stageColors: Record<string, number[]> = {
          seedling: [144, 238, 144],
          vegetative: [34, 139, 34],
          flowering: [255, 182, 193],
          fruiting: [255, 140, 0],
          harvest: [255, 215, 0]
        };
        
        let xOffset = margin;
        const barWidth = (pageWidth - margin * 2 - 40) / Object.keys(stageGroups).length;
        
        Object.entries(stageGroups).forEach(([stage, count]) => {
          const barHeight = Math.min(50, (count / plants.length) * 100);
          const color = stageColors[stage] || [128, 128, 128];
          
          doc.setFillColor(color[0], color[1], color[2]);
          doc.roundedRect(xOffset, yPosition + (50 - barHeight), barWidth - 5, barHeight, 2, 2, 'F');
          
          doc.setFontSize(7);
          doc.setTextColor(0, 0, 0);
          doc.text(stage.substring(0, 8), xOffset + 2, yPosition + 58);
          doc.text(`${count}`, xOffset + barWidth / 2 - 3, yPosition + (45 - barHeight));
          
          xOffset += barWidth;
        });
        
        yPosition += 70;
      }

      // ===== SENSOR DATA =====
      if (includeSections.sensors && sensorData.length > 0) {
        addNewPageIfNeeded(60);
        drawSectionHeader('Sensor Readings', '📡');
        
        const sensorGroups: Record<string, SensorData[]> = {};
        sensorData.forEach(s => {
          if (!sensorGroups[s.type]) sensorGroups[s.type] = [];
          sensorGroups[s.type].push(s);
        });
        
        const sensorIcons: Record<string, string> = {
          temperature: '🌡️',
          humidity: '💧',
          moisture: '🌊',
          light: '☀️',
          soil_ph: '🧪',
          co2: '💨'
        };
        
        const sensorColors: Record<string, number[]> = {
          temperature: [255, 99, 71],
          humidity: [30, 144, 255],
          moisture: [0, 191, 255],
          light: [255, 215, 0],
          soil_ph: [147, 112, 219],
          co2: [169, 169, 169]
        };
        
        const sensorCardWidth = (pageWidth - margin * 2 - 15) / 3;
        let sensorIndex = 0;
        
        Object.entries(sensorGroups).forEach(([type, sensors]) => {
          const row = Math.floor(sensorIndex / 3);
          const col = sensorIndex % 3;
          const x = margin + col * (sensorCardWidth + 7);
          const y = yPosition + row * 35;
          
          addNewPageIfNeeded(35);
          
          const color = sensorColors[type] || [128, 128, 128];
          doc.setFillColor(color[0], color[1], color[2]);
          doc.roundedRect(x, y, sensorCardWidth, 30, 3, 3, 'F');
          
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(`${sensorIcons[type] || '📊'} ${type}`, x + 5, y + 10);
          
          const avgValue = sensors.reduce((a, b) => a + b.value, 0) / sensors.length;
          doc.setFontSize(14);
          doc.text(`${avgValue.toFixed(1)} ${sensors[0]?.unit || ''}`, x + 5, y + 23);
          
          doc.setFont('helvetica', 'normal');
          sensorIndex++;
        });
        
        yPosition += Math.ceil(Object.keys(sensorGroups).length / 3) * 35 + 15;
        doc.setTextColor(0, 0, 0);
      }

      // ===== SCHEDULES =====
      if (includeSections.schedules && schedules.length > 0) {
        addNewPageIfNeeded(60);
        drawSectionHeader('Automation Schedules', '⏰');
        
        schedules.slice(0, 10).forEach((schedule, i) => {
          addNewPageIfNeeded(20);
          
          const isActive = schedule.isActive;
          doc.setFillColor(isActive ? 240 : 250, isActive ? 255 : 240, isActive ? 240 : 240);
          doc.roundedRect(margin, yPosition, pageWidth - margin * 2, 15, 2, 2, 'F');
          
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text(schedule.name, margin + 5, yPosition + 6);
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.text(`${schedule.type} | ${schedule.zone}`, margin + 5, yPosition + 12);
          
          doc.text(`${schedule.startTime} - ${schedule.endTime}`, pageWidth - margin - 50, yPosition + 9);
          
          // Status indicator
          doc.setFillColor(isActive ? 34 : 200, isActive ? 139 : 200, isActive ? 34 : 200);
          doc.circle(pageWidth - margin - 8, yPosition + 7.5, 3, 'F');
          
          yPosition += 18;
        });
        
        yPosition += 10;
      }

      // ===== FOOTER ON ALL PAGES =====
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFillColor(240, 240, 240);
        doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('Smart Greenhouse Management System', margin, pageHeight - 6);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 6);
      }

      // Save the PDF
      const fileName = `greenhouse-report-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "Report Generated!",
        description: `${fileName} has been downloaded successfully.`,
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Report Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Generate a comprehensive PDF report of your greenhouse data, plant growth progress, and sensor readings.
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(includeSections).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox
                id={key}
                checked={value}
                onCheckedChange={(checked) =>
                  setIncludeSections(prev => ({ ...prev, [key]: checked === true }))
                }
              />
              <Label htmlFor={key} className="text-sm capitalize cursor-pointer">
                {key === 'growthProgress' ? 'Growth Progress' : key}
              </Label>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            onClick={generatePDF}
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download PDF Report
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-2 pt-4 border-t">
          <div className="text-center p-2 bg-primary/10 rounded-lg">
            <Leaf className="w-4 h-4 mx-auto text-primary mb-1" />
            <p className="text-xs text-muted-foreground">{plants.length} Plants</p>
          </div>
          <div className="text-center p-2 bg-temperature/10 rounded-lg">
            <Thermometer className="w-4 h-4 mx-auto text-temperature mb-1" />
            <p className="text-xs text-muted-foreground">{sensorData.filter(s => s.type === 'temperature').length} Sensors</p>
          </div>
          <div className="text-center p-2 bg-humidity/10 rounded-lg">
            <Droplets className="w-4 h-4 mx-auto text-humidity mb-1" />
            <p className="text-xs text-muted-foreground">{sensorData.filter(s => s.type === 'humidity').length} Readings</p>
          </div>
          <div className="text-center p-2 bg-accent/10 rounded-lg">
            <Calendar className="w-4 h-4 mx-auto text-accent-foreground mb-1" />
            <p className="text-xs text-muted-foreground">{schedules.length} Schedules</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
