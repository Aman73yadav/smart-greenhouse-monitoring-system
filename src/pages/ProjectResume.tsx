import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Code2, 
  Database, 
  Cloud, 
  Brain, 
  Layers, 
  Cpu, 
  Shield, 
  Smartphone,
  Zap,
  Box,
  Globe,
  Server
} from 'lucide-react';

const techStack = [
  {
    category: 'Frontend Framework',
    icon: Code2,
    items: [
      { name: 'React 18', description: 'Component-based UI library with hooks and concurrent features' },
      { name: 'TypeScript', description: 'Type-safe JavaScript for robust code' },
      { name: 'Vite 5', description: 'Fast build tool and development server' },
    ]
  },
  {
    category: 'UI/UX Design',
    icon: Layers,
    items: [
      { name: 'Tailwind CSS', description: 'Utility-first CSS framework for rapid styling' },
      { name: 'shadcn/ui', description: 'Beautiful, accessible component library' },
      { name: 'Lucide React', description: 'Modern, consistent icon library' },
      { name: 'Framer Motion', description: 'Production-ready animation library' },
    ]
  },
  {
    category: '3D Visualization',
    icon: Box,
    items: [
      { name: 'Three.js', description: '3D graphics library for WebGL rendering' },
      { name: 'React Three Fiber', description: 'React renderer for Three.js' },
      { name: '@react-three/drei', description: 'Useful helpers for React Three Fiber' },
    ]
  },
  {
    category: 'Backend & Database',
    icon: Database,
    items: [
      { name: 'Supabase', description: 'Open-source Firebase alternative with PostgreSQL' },
      { name: 'PostgreSQL', description: 'Advanced relational database' },
      { name: 'Row Level Security', description: 'Fine-grained access control policies' },
    ]
  },
  {
    category: 'Real-time Features',
    icon: Zap,
    items: [
      { name: 'Supabase Realtime', description: 'Live database subscriptions for instant updates' },
      { name: 'WebSocket API', description: 'Bi-directional communication protocol' },
    ]
  },
  {
    category: 'AI & Machine Learning',
    icon: Brain,
    items: [
      { name: 'Gemini AI', description: 'Google\'s multimodal AI for plant health diagnosis' },
      { name: 'Edge Functions', description: 'Serverless functions for AI processing' },
    ]
  },
  {
    category: 'Authentication & Security',
    icon: Shield,
    items: [
      { name: 'Supabase Auth', description: 'Secure user authentication system' },
      { name: 'JWT Tokens', description: 'Stateless authentication mechanism' },
      { name: 'Email Verification', description: 'Secure account confirmation flow' },
    ]
  },
  {
    category: 'IoT Integration',
    icon: Cpu,
    items: [
      { name: 'Wokwi Simulator', description: 'Virtual Arduino/ESP32 simulation' },
      { name: 'MQTT Protocol', description: 'Lightweight IoT messaging protocol' },
      { name: 'Sensor Simulation', description: 'Virtual temperature, humidity, soil sensors' },
    ]
  },
  {
    category: 'Voice & Audio',
    icon: Smartphone,
    items: [
      { name: 'Web Speech API', description: 'Browser-native speech recognition' },
      { name: 'Text-to-Speech', description: 'Voice feedback for system responses' },
      { name: 'Audio Visualizer', description: 'Real-time audio waveform display' },
    ]
  },
  {
    category: 'Charts & Analytics',
    icon: Cloud,
    items: [
      { name: 'Recharts', description: 'Composable charting library for React' },
      { name: 'React Query', description: 'Data fetching and caching management' },
    ]
  },
  {
    category: 'Deployment & DevOps',
    icon: Server,
    items: [
      { name: 'Vercel', description: 'Serverless deployment platform' },
      { name: 'GitHub Actions', description: 'CI/CD automation workflows' },
      { name: 'Environment Variables', description: 'Secure configuration management' },
    ]
  },
  {
    category: 'Additional Libraries',
    icon: Globe,
    items: [
      { name: 'React Router v6', description: 'Declarative routing for React' },
      { name: 'React Query', description: 'Powerful data synchronization' },
      { name: 'date-fns', description: 'Modern date utility library' },
      { name: 'clsx + tailwind-merge', description: 'Conditional class name handling' },
    ]
  }
];

const projectHighlights = [
  {
    title: 'Real-time Monitoring',
    description: 'Live sensor data streaming with sub-second updates using WebSocket connections'
  },
  {
    title: 'AI-Powered Insights',
    description: 'Google Gemini AI integration for intelligent plant health diagnosis and recommendations'
  },
  {
    title: '3D Visualization',
    description: 'Interactive Three.js greenhouse models with growth simulation and virtual field visualization'
  },
  {
    title: 'Voice Control',
    description: 'Hands-free greenhouse management using Web Speech API for voice commands'
  },
  {
    title: 'Smart Automation',
    description: 'Automated irrigation, lighting, and climate control based on sensor thresholds'
  },
  {
    title: 'IoT Simulation',
    description: 'Virtual device management with Wokwi integration for hardware prototyping'
  },
  {
    title: 'Yield Prediction',
    description: 'AI-driven harvest forecasting using historical data and growth patterns'
  },
  {
    title: 'Multi-zone Management',
    description: 'Independent control systems for different greenhouse zones with custom schedules'
  }
];

const ProjectResume = () => {
  return (
    <div className="min-h-screen bg-background p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Smart Greenhouse Monitoring System</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          An AI-powered, full-stack IoT solution for intelligent greenhouse management with real-time monitoring, 
          predictive analytics, and immersive 3D visualization
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          <Badge variant="default">React</Badge>
          <Badge variant="secondary">TypeScript</Badge>
          <Badge variant="outline">Three.js</Badge>
          <Badge variant="default">Supabase</Badge>
          <Badge variant="secondary">AI/ML</Badge>
          <Badge variant="outline">IoT</Badge>
        </div>
      </div>

      {/* Project Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Project Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            The <strong>Smart Greenhouse Monitoring System</strong> is a comprehensive, production-ready web application 
            designed to revolutionize modern agriculture through technology. Built as a final year capstone project, 
            this system demonstrates enterprise-level software engineering practices while solving real-world agricultural challenges.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The platform integrates cutting-edge technologies including <strong>AI/ML for plant health diagnosis</strong>, 
            <strong> real-time sensor monitoring</strong>, <strong>3D greenhouse visualization</strong>, and 
            <strong> voice-controlled automation</strong>. It serves as a complete digital twin for greenhouse operations, 
            enabling data-driven decision making for optimal crop yields.
          </p>
          <Separator />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <p className="text-2xl font-bold text-primary">40+</p>
              <p className="text-sm text-muted-foreground">Pages/Screens</p>
            </div>
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <p className="text-2xl font-bold text-primary">15+</p>
              <p className="text-sm text-muted-foreground">3D Components</p>
            </div>
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <p className="text-2xl font-bold text-primary">25+</p>
              <p className="text-sm text-muted-foreground">Tech Stack Items</p>
            </div>
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <p className="text-2xl font-bold text-primary">100%</p>
              <p className="text-sm text-muted-foreground">Type Safety</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Key Features & Capabilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectHighlights.map((feature, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <h4 className="font-semibold mb-1">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technology Stack */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-primary" />
            Complete Technology Stack
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {techStack.map((category, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center gap-2">
                  <category.icon className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">{category.category}</h3>
                </div>
                <div className="space-y-2">
                  {category.items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {item.name}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{item.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Architecture */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5 text-primary" />
            System Architecture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-primary mb-2">Presentation Layer</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• React 18 + TypeScript</li>
                <li>• Tailwind CSS + shadcn/ui</li>
                <li>• Three.js 3D Visualization</li>
                <li>• Responsive Mobile Design</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-primary mb-2">Application Layer</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Supabase Edge Functions</li>
                <li>• AI/ML API Integration</li>
                <li>• Real-time WebSocket</li>
                <li>• Authentication Middleware</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-primary mb-2">Data Layer</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• PostgreSQL Database</li>
                <li>• Row Level Security</li>
                <li>• Real-time Subscriptions</li>
                <li>• IoT Sensor Storage</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground pt-8">
        <p>Built by Aman Kumar | Roll: 21541A0579 | Guide: Dr. K. K. Baseer</p>
        <p className="mt-1">Department of Computer Science & Engineering | GITAM University</p>
        <p className="mt-2">© 2025 Smart Greenhouse Monitoring System. All rights reserved.</p>
      </div>
    </div>
  );
};

export default ProjectResume;
