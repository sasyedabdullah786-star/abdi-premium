import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars, OrbitControls, Html } from "@react-three/drei";
import { Link } from "react-router-dom";
import * as THREE from "three";
import Layout from "@/components/Layout";
import ShayariBanner from "@/components/ShayariBanner";
import { BookOpen, Wand2, Trophy, User, Mic } from "lucide-react";

const HoloRing = ({ color }: { color: string }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.x += dt * 0.2;
      ref.current.rotation.y += dt * 0.3;
    }
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[1.4, 0.02, 16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} />
    </mesh>
  );
};

const HoloCore = () => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.4;
  });
  return (
    <Float speed={2} floatIntensity={0.6}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.8, 1]} />
        <meshStandardMaterial
          color="#6366F1"
          emissive="#6366F1"
          emissiveIntensity={0.6}
          wireframe
        />
      </mesh>
      <HoloRing color="#A78BFA" />
      <HoloRing color="#6366F1" />
    </Float>
  );
};

const HUB_PANELS = [
  { to: "/ai-tools", label: "AI Companion", icon: Wand2, hint: "Quizzes • Flashcards • Notes" },
  { to: "/courses", label: "Courses", icon: BookOpen, hint: "Browse and enroll" },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy, hint: "Top learners" },
  { to: "/profile", label: "My Profile", icon: User, hint: "Stats • Streaks • Goals" },
];

const HolographicHub = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-10 space-y-6">
        <ShayariBanner />

        <div className="relative rounded-3xl overflow-hidden border border-primary/20 bg-gradient-to-b from-background via-background to-primary/5">
          <div className="h-[280px] md:h-[420px] relative">
            <Canvas camera={{ position: [0, 0, 4], fov: 55 }} dpr={[1, 1.5]}>
              <ambientLight intensity={0.4} />
              <pointLight position={[3, 3, 3]} intensity={1.5} color="#A78BFA" />
              <pointLight position={[-3, -2, 2]} intensity={1} color="#6366F1" />
              <Suspense fallback={null}>
                <HoloCore />
                <Stars radius={20} depth={30} count={1500} factor={2} fade speed={0.5} />
              </Suspense>
              <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.6} />
            </Canvas>
            <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 bg-gradient-to-t from-background/95 via-background/60 to-transparent">
              <h1 className="text-2xl md:text-4xl font-semibold tracking-tight">
                Welcome to your <span className="gradient-text">Holographic Hub</span>
              </h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                Tap a panel — or press the mic and say "Open Courses".
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {HUB_PANELS.map((p) => (
            <Link
              key={p.to}
              to={p.to}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-4 md:p-5 hover:border-primary/40 transition-all hover:-translate-y-0.5"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/15 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center mb-3">
                  <p.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="font-semibold text-sm md:text-base">{p.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{p.hint}</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/40 p-4 md:p-5 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <Mic className="w-4 h-4 text-primary" />
          </div>
          <div className="text-sm">
            <div className="font-medium">Voice Navigation</div>
            <div className="text-muted-foreground">
              Tap the mic (bottom-right) and try: "Open Courses", "Show Leaderboard", "Take me to AI Tools".
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HolographicHub;
