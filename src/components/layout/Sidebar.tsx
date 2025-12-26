import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Leaf, 
  ThermometerSun, 
  Settings2, 
  Calendar, 
  BarChart3, 
  Cpu, 
  Bell,
  Menu,
  X,
  Box
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: '3d-view', label: '3D Greenhouse', icon: Box },
  { id: 'plants', label: 'Plants', icon: Leaf },
  { id: 'sensors', label: 'Sensors', icon: ThermometerSun },
  { id: 'controls', label: 'Controls', icon: Settings2 },
  { id: 'schedules', label: 'Schedules', icon: Calendar },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'devices', label: 'IoT Devices', icon: Cpu },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-border"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-sidebar-foreground">GreenHouse</h1>
                <p className="text-xs text-muted-foreground">Smart Control System</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileOpen(false);
                }}
                className={cn(
                  "nav-link w-full",
                  activeTab === item.id && "nav-link-active"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* System Status */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="glass-panel p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="status-dot-success" />
                <span className="text-sm font-medium">System Online</span>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Active Devices</span>
                  <span className="text-foreground">14/16</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Zones</span>
                  <span className="text-foreground">4/5</span>
                </div>
                <div className="flex justify-between">
                  <span>Uptime</span>
                  <span className="text-foreground">99.8%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
