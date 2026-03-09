import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Minus, Monitor, Server, Database, Cloud, Wifi, Shield, Cpu, Eye, Mic, BarChart3, Box, Zap, Globe, Mail, BrainCircuit, Layers, ArrowDown, Lock, Radio } from "lucide-react";
import dataFlowDiagram from "@/assets/data-flow-diagram.png";
import systemArchDiagram from "@/assets/system-architecture-diagram.png";
import useCaseDiagram from "@/assets/use-case-diagram.png";

const comparisonData = [
  {
    feature: "AI/ML Approach",
    traditional: "Custom-trained CNN/RNN models (TensorFlow, PyTorch)",
    proposed: "API-based LLM inference (Gemini 2.5 Flash, GPT-5)",
    advantage: "proposed",
  },
  {
    feature: "Training Data Requirement",
    traditional: "10,000–100,000+ labeled images/samples",
    proposed: "Zero training data — uses pre-trained foundation models",
    advantage: "proposed",
  },
  {
    feature: "Disease Detection Method",
    traditional: "Image classification via CNN (ResNet, VGG, MobileNet)",
    proposed: "Multimodal LLM with prompt-engineered diagnosis",
    advantage: "proposed",
  },
  {
    feature: "Yield Prediction",
    traditional: "Regression models (LSTM, Random Forest) trained on historical data",
    proposed: "LLM reasoning over real-time sensor + environmental context",
    advantage: "neutral",
  },
  {
    feature: "Model Accuracy",
    traditional: "85–95% (dataset-dependent, prone to overfitting)",
    proposed: "Contextually adaptive — no fixed accuracy metric, evaluated via prompt quality",
    advantage: "neutral",
  },
  {
    feature: "Deployment Complexity",
    traditional: "Requires GPU servers, model versioning, MLOps pipeline",
    proposed: "Serverless Edge Functions — zero infrastructure management",
    advantage: "proposed",
  },
  {
    feature: "Real-time Monitoring",
    traditional: "Polling-based (MQTT/HTTP) with 5–30s latency",
    proposed: "WebSocket-based (Supabase Realtime) with <500ms latency",
    advantage: "proposed",
  },
  {
    feature: "3D Visualization",
    traditional: "Rarely implemented; 2D dashboards with static charts",
    proposed: "Interactive 3D virtual field (Three.js / React Three Fiber)",
    advantage: "proposed",
  },
  {
    feature: "Irrigation Control",
    traditional: "Threshold-based or PID controllers",
    proposed: "Rule-based + AI-assisted with weather forecast integration",
    advantage: "proposed",
  },
  {
    feature: "Voice Interaction",
    traditional: "Not typically included",
    proposed: "Web Speech API for hands-free greenhouse control",
    advantage: "proposed",
  },
  {
    feature: "Cost of Development",
    traditional: "High — data collection, annotation, GPU training",
    proposed: "Low — API usage-based pricing, no training costs",
    advantage: "proposed",
  },
  {
    feature: "Scalability",
    traditional: "Limited by model retraining for new crops/diseases",
    proposed: "Instantly generalizable — LLMs handle unseen crops via knowledge",
    advantage: "proposed",
  },
  {
    feature: "Explainability",
    traditional: "Black-box (Grad-CAM heatmaps for partial explainability)",
    proposed: "Natural language explanations with reasoning chains",
    advantage: "proposed",
  },
  {
    feature: "Technology Stack",
    traditional: "Python, Flask/Django, TensorFlow, Arduino/Raspberry Pi",
    proposed: "React 18, TypeScript, Supabase, Deno Edge Functions, Three.js",
    advantage: "neutral",
  },
  {
    feature: "User Interface",
    traditional: "Basic web dashboard or mobile app",
    proposed: "Responsive SPA with 3D visualization, voice control, real-time alerts",
    advantage: "proposed",
  },
  {
    feature: "Data Security",
    traditional: "Basic authentication; manual access control on API endpoints",
    proposed: "Row Level Security (RLS) policies per table, JWT-based auth, RBAC-ready",
    advantage: "proposed",
  },
  {
    feature: "Authentication",
    traditional: "Custom session-based auth or basic token auth",
    proposed: "Supabase Auth with email verification, OAuth support, automatic session refresh",
    advantage: "proposed",
  },
  {
    feature: "API Security",
    traditional: "Manual rate limiting, CORS configuration",
    proposed: "Edge Functions with built-in CORS, anon key + service role separation",
    advantage: "proposed",
  },
  {
    feature: "System Maintenance",
    traditional: "Manual server updates, model retraining, dependency patching",
    proposed: "Serverless — zero server maintenance, auto-scaling Edge Functions",
    advantage: "proposed",
  },
  {
    feature: "Model Updates",
    traditional: "Requires retraining pipeline, data versioning, A/B testing infrastructure",
    proposed: "Automatic — foundation models updated by provider (Google/OpenAI)",
    advantage: "proposed",
  },
  {
    feature: "Database Maintenance",
    traditional: "Manual backups, index optimization, migration scripts",
    proposed: "Managed PostgreSQL with automatic backups and point-in-time recovery",
    advantage: "proposed",
  },
  {
    feature: "Offline Capability",
    traditional: "Limited — requires local model deployment on edge device",
    proposed: "Partial — cached dashboard UI works offline; AI features require connectivity",
    advantage: "neutral",
  },
  {
    feature: "Edge/Local Processing",
    traditional: "Possible via TensorFlow Lite on Raspberry Pi / microcontrollers",
    proposed: "Not supported — all inference via cloud API calls",
    advantage: "traditional",
  },
  {
    feature: "Network Dependency",
    traditional: "Can operate in air-gapped mode with local models",
    proposed: "Requires internet for AI inference, real-time sync, and weather data",
    advantage: "traditional",
  },
  {
    feature: "Data Privacy",
    traditional: "Full control — data stays on-premise if self-hosted",
    proposed: "Cloud-hosted with RLS isolation; data passes through third-party AI APIs",
    advantage: "neutral",
  },
  {
    feature: "Disaster Recovery",
    traditional: "Manual backup strategies, no built-in failover",
    proposed: "Managed cloud with automatic backups, multi-region availability",
    advantage: "proposed",
  },
  {
    feature: "Monitoring & Logging",
    traditional: "Custom logging with ELK stack or similar",
    proposed: "Built-in Edge Function logs, real-time database analytics, client-side error tracking",
    advantage: "proposed",
  },
];

const AdvantageIcon = ({ type }: { type: string }) => {
  if (type === "proposed") return <Badge variant="default" className="bg-primary text-primary-foreground text-xs">Ours</Badge>;
  if (type === "traditional") return <Badge variant="destructive" className="text-xs">Traditional</Badge>;
  return <Badge variant="secondary" className="text-xs">Comparable</Badge>;
};

const ResearchComparison = () => {
  const proposedCount = comparisonData.filter(d => d.advantage === "proposed").length;
  const neutralCount = comparisonData.filter(d => d.advantage === "neutral").length;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Literature Review — Comparative Analysis
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Table: Comparison of Proposed AI-Powered Smart Greenhouse System vs Traditional ML-Based Greenhouse Monitoring Systems
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6 max-w-lg mx-auto">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{proposedCount}</p>
            <p className="text-xs text-muted-foreground">Proposed Advantages</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-muted-foreground">{neutralCount}</p>
            <p className="text-xs text-muted-foreground">Comparable</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{comparisonData.length}</p>
            <p className="text-xs text-muted-foreground">Total Criteria</p>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Feature-by-Feature Comparison</CardTitle>
          <CardDescription>
            Proposed System (API-based LLM + Real-time WebSocket + 3D Visualization) vs Traditional Systems (Custom ML Models + Polling-based + 2D Dashboards)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px] font-bold">Feature / Criterion</TableHead>
                <TableHead className="font-bold">Traditional ML-Based Systems</TableHead>
                <TableHead className="font-bold">Proposed System (Ours)</TableHead>
                <TableHead className="w-[100px] text-center font-bold">Edge</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonData.map((row, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium text-foreground">{row.feature}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{row.traditional}</TableCell>
                  <TableCell className="text-sm">{row.proposed}</TableCell>
                  <TableCell className="text-center">
                    <AdvantageIcon type={row.advantage} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Use Case Diagram */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Use Case Diagram</CardTitle>
          <CardDescription>
            UML use case diagram showing all actor interactions with the Smart Greenhouse system — Farmer, IoT Devices, AI Services, Weather API, and Email Service
          </CardDescription>
        </CardHeader>
        <CardContent>
          <img
            src={useCaseDiagram}
            alt="Use Case Diagram showing Farmer, IoT Devices, AI Service, Weather API, and Email Service actors interacting with the Smart Greenhouse System"
            className="w-full rounded-lg border border-border"
          />
        </CardContent>
      </Card>

      {/* System Architecture Diagram — Interactive */}
      <Card className="mt-6 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            System Architecture Diagram
          </CardTitle>
          <CardDescription>
            3-Tier layered architecture of the proposed AI-powered smart greenhouse system with serverless backend and real-time data pipeline
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-0">
          {/* PRESENTATION LAYER */}
          <div className="relative">
            <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Monitor className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">PRESENTATION LAYER</h3>
                  <p className="text-[10px] text-muted-foreground">React 18 Single Page Application</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: Box, label: "3D Visualization", desc: "Three.js / R3F", color: "text-violet-500" },
                  { icon: BarChart3, label: "Analytics", desc: "Recharts", color: "text-blue-500" },
                  { icon: Mic, label: "Voice Control", desc: "Web Speech API", color: "text-emerald-500" },
                  { icon: Eye, label: "Real-time UI", desc: "WebSocket Sync", color: "text-amber-500" },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border border-border bg-background/80 p-3 text-center space-y-1 hover:shadow-md transition-shadow">
                    <item.icon className={`h-5 w-5 mx-auto ${item.color}`} />
                    <p className="text-xs font-semibold text-foreground">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Connector */}
            <div className="flex flex-col items-center py-2 text-muted-foreground">
              <div className="h-4 w-px bg-border" />
              <Badge variant="outline" className="text-[9px] px-2 py-0.5 bg-background">HTTPS / WebSocket</Badge>
              <ArrowDown className="h-3 w-3 mt-1" />
            </div>
          </div>

          {/* APPLICATION LAYER */}
          <div className="relative">
            <div className="rounded-xl border-2 border-blue-500/40 bg-blue-500/5 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Server className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">APPLICATION LAYER</h3>
                  <p className="text-[10px] text-muted-foreground">Supabase Edge Functions (Deno Runtime)</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { icon: Cpu, label: "Sensor Ingest", desc: "sensor-data", color: "text-cyan-500" },
                  { icon: BrainCircuit, label: "AI Diagnosis", desc: "plant-health-diagnosis", color: "text-purple-500" },
                  { icon: Zap, label: "Yield Prediction", desc: "yield-prediction", color: "text-orange-500" },
                  { icon: Globe, label: "Weather Forecast", desc: "Open-Meteo API", color: "text-sky-500" },
                  { icon: Mail, label: "Email Alerts", desc: "Resend API", color: "text-pink-500" },
                  { icon: Eye, label: "Disease ID", desc: "plant-disease-identify", color: "text-red-500" },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border border-border bg-background/80 p-3 text-center space-y-1 hover:shadow-md transition-shadow">
                    <item.icon className={`h-5 w-5 mx-auto ${item.color}`} />
                    <p className="text-xs font-semibold text-foreground">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Connector */}
            <div className="flex flex-col items-center py-2 text-muted-foreground">
              <div className="h-4 w-px bg-border" />
              <Badge variant="outline" className="text-[9px] px-2 py-0.5 bg-background">SQL / Realtime Subscriptions</Badge>
              <ArrowDown className="h-3 w-3 mt-1" />
            </div>
          </div>

          {/* DATA LAYER */}
          <div className="relative">
            <div className="rounded-xl border-2 border-emerald-500/40 bg-emerald-500/5 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Database className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">DATA LAYER</h3>
                  <p className="text-[10px] text-muted-foreground">PostgreSQL + Row Level Security + Triggers</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "sensor_readings", desc: "Temp, Humidity, CO₂", icon: Radio },
                  { label: "plants", desc: "Growth stage, health", icon: Eye },
                  { label: "iot_devices", desc: "Status, firmware", icon: Wifi },
                  { label: "profiles", desc: "User accounts", icon: Shield },
                  { label: "care_tasks", desc: "Schedules, checklists", icon: Check },
                  { label: "yield_records", desc: "Predicted vs actual", icon: BarChart3 },
                  { label: "control_settings", desc: "HVAC, irrigation", icon: Cpu },
                  { label: "schedules", desc: "Automation rules", icon: Zap },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border border-border bg-background/80 p-2.5 space-y-0.5 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-1.5">
                      <item.icon className="h-3 w-3 text-emerald-500 shrink-0" />
                      <p className="text-[10px] font-mono font-semibold text-foreground truncate">{item.label}</p>
                    </div>
                    <p className="text-[9px] text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-[9px] gap-1"><Lock className="h-2.5 w-2.5" />RLS Policies</Badge>
                <Badge variant="secondary" className="text-[9px] gap-1"><Zap className="h-2.5 w-2.5" />Triggers</Badge>
                <Badge variant="secondary" className="text-[9px] gap-1"><Radio className="h-2.5 w-2.5" />Realtime Publication</Badge>
                <Badge variant="secondary" className="text-[9px] gap-1"><Shield className="h-2.5 w-2.5" />JWT Auth</Badge>
              </div>
            </div>
          </div>

          {/* External Services */}
          <div className="mt-4 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 p-4">
            <p className="text-[10px] font-semibold text-muted-foreground mb-3 uppercase tracking-wider">External Services</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Google Gemini 2.5 Flash", desc: "AI Inference", icon: BrainCircuit },
                { label: "OpenAI GPT-5", desc: "AI Inference", icon: BrainCircuit },
                { label: "Open-Meteo", desc: "Weather Data", icon: Cloud },
                { label: "Resend", desc: "Transactional Email", icon: Mail },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-border bg-background/60 p-2.5 text-center space-y-0.5">
                  <item.icon className="h-4 w-4 mx-auto text-muted-foreground" />
                  <p className="text-[10px] font-semibold text-foreground">{item.label}</p>
                  <p className="text-[9px] text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Original System Architecture Image (for reference) */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">System Architecture — Block Diagram</CardTitle>
          <CardDescription>Original high-level block diagram representation</CardDescription>
        </CardHeader>
        <CardContent>
          <img
            src={systemArchDiagram}
            alt="System Architecture Diagram showing User Interface, Application, Backend, and External Services layers"
            className="w-full rounded-lg border border-border"
          />
        </CardContent>
      </Card>

      {/* Data Flow Diagram */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Data Flow Diagram</CardTitle>
          <CardDescription>
            End-to-end data pipeline from IoT sensor devices through backend processing to the real-time user dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <img
            src={dataFlowDiagram}
            alt="Data Flow Diagram showing sensor data movement from IoT devices through Edge Functions and PostgreSQL to the React dashboard via WebSocket"
            className="w-full rounded-lg border border-border"
          />
        </CardContent>
      </Card>

      {/* Sequence Diagram */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Plant Disease Diagnosis — Sequence Diagram</CardTitle>
          <CardDescription>
            Workflow showing the plant disease identification process from image upload to AI-powered diagnosis response
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="bg-muted/30 rounded-lg p-6 font-mono text-xs leading-relaxed text-foreground whitespace-pre">
{`User                    React Frontend           Edge Function            Gemini 2.5 Flash
 │                           │                        │                        │
 │  Upload plant image       │                        │                        │
 │ ─────────────────────────>│                        │                        │
 │                           │                        │                        │
 │                           │  FileReader API        │                        │
 │                           │  Convert to Base64     │                        │
 │                           │                        │                        │
 │                           │  POST /plant-disease-  │                        │
 │                           │  identify              │                        │
 │                           │ ──────────────────────>│                        │
 │                           │                        │                        │
 │                           │                        │  Send image + prompt   │
 │                           │                        │ ──────────────────────>│
 │                           │                        │                        │
 │                           │                        │                        │  Analyze image
 │                           │                        │                        │  Identify disease
 │                           │                        │                        │  Generate treatment
 │                           │                        │                        │
 │                           │                        │  JSON response         │
 │                           │                        │  (disease, confidence, │
 │                           │                        │   treatment plan)      │
 │                           │                        │ <──────────────────────│
 │                           │                        │                        │
 │                           │  Diagnosis result      │                        │
 │                           │ <──────────────────────│                        │
 │                           │                        │                        │
 │  Display diagnosis        │                        │                        │
 │  with treatment plan      │                        │                        │
 │ <─────────────────────────│                        │                        │
 │                           │                        │                        │`}
          </div>
        </CardContent>
      </Card>

      {/* Methodology */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Research Methodology</CardTitle>
          <CardDescription>
            System development approach and research design adopted for the proposed AI-powered smart greenhouse system
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-foreground space-y-4">
          <div>
            <h4 className="font-semibold mb-1">1. Development Methodology — Agile with Iterative Prototyping</h4>
            <p className="text-muted-foreground">
              The system was developed using an <strong>Agile methodology</strong> with iterative prototyping cycles. Each sprint (1–2 weeks) focused on delivering a functional increment — starting with core sensor monitoring, then layering AI diagnostics, 3D visualization, and voice control in subsequent iterations. This approach enabled continuous user feedback and rapid adaptation to emerging requirements.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">2. Research Design — Design Science Research (DSR)</h4>
            <p className="text-muted-foreground">
              The study follows the <strong>Design Science Research</strong> paradigm (Hevner et al., 2004), which emphasizes creating innovative IT artifacts to solve identified problems. The artifact — the AI-powered greenhouse system — was iteratively designed, implemented, and evaluated against traditional ML-based approaches using the comparative framework presented above.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">3. System Architecture — Serverless & Event-Driven</h4>
            <p className="text-muted-foreground">
              A <strong>serverless, event-driven architecture</strong> was adopted using Supabase Edge Functions (Deno runtime) for backend logic, PostgreSQL with Row Level Security for data persistence, and WebSocket-based real-time subscriptions for live sensor updates. This eliminates infrastructure management overhead and enables automatic horizontal scaling.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">4. AI Integration Strategy — API-First LLM Inference</h4>
            <p className="text-muted-foreground">
              Rather than training custom models, the system leverages <strong>pre-trained foundation models</strong> (Google Gemini 2.5 Flash, OpenAI GPT-5) via API calls with domain-specific prompt engineering. This zero-shot approach eliminates the need for labeled training datasets, GPU infrastructure, and MLOps pipelines — significantly reducing development cost and time-to-deployment.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">5. Frontend Architecture — Component-Based SPA</h4>
            <p className="text-muted-foreground">
              The user interface was built as a <strong>Single Page Application (SPA)</strong> using React 18 with TypeScript, following atomic design principles. Key UI innovations include interactive 3D greenhouse visualization (Three.js/React Three Fiber), Web Speech API integration for voice commands, and real-time chart rendering with Recharts.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">6. Evaluation Method — Comparative Analysis</h4>
            <p className="text-muted-foreground">
              The proposed system was evaluated through <strong>comparative analysis</strong> against traditional ML-based greenhouse systems across {comparisonData.length} criteria spanning AI capability, deployment complexity, security, maintenance, offline support, and user experience. The comparison table above summarizes findings, with {proposedCount} criteria favoring the proposed approach and {neutralCount} rated as comparable.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">7. Tools & Technologies</h4>
            <div className="flex flex-wrap gap-2 mt-2">
              {["React 18", "TypeScript", "Supabase", "PostgreSQL", "Deno Edge Functions", "Three.js", "Gemini 2.5 Flash", "GPT-5", "Tailwind CSS", "Recharts", "Web Speech API", "Vite"].map((tech) => (
                <Badge key={tech} variant="outline" className="text-xs">{tech}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key References */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Key References for Literature Review</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>[1] Kamilaris, A. & Prenafeta-Boldú, F.X. (2018). "Deep learning in agriculture: A survey." <em>Computers and Electronics in Agriculture</em>, 147, 70–90.</p>
          <p>[2] Ferentinos, K.P. (2018). "Deep learning models for plant disease detection and diagnosis." <em>Computers and Electronics in Agriculture</em>, 145, 311–318.</p>
          <p>[3] Liakos, K.G. et al. (2018). "Machine learning in agriculture: A review." <em>Sensors</em>, 18(8), 2674.</p>
          <p>[4] Gondchawar, N. & Kawitkar, R.S. (2016). "IoT based smart agriculture." <em>IJARCCE</em>, 5(6), 838–842.</p>
          <p>[5] Shamshiri, R.R. et al. (2018). "Research and development in agricultural robotics: A perspective of digital farming." <em>Int. J. Agric. & Biol. Eng.</em>, 11(4), 1–14.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResearchComparison;
