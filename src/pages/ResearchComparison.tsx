import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Minus } from "lucide-react";

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
