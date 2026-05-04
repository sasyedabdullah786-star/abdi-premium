import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Web Speech API typings (browser-only)
type SR = any;

const ROUTES: { match: RegExp; path: string; label: string }[] = [
  { match: /\b(home|homepage|main)\b/i, path: "/", label: "Home" },
  { match: /\b(course|courses|subject)/i, path: "/courses", label: "Courses" },
  { match: /\b(blog|article|post)/i, path: "/blog", label: "Blog" },
  { match: /\b(contact|support)/i, path: "/contact", label: "Contact" },
  { match: /\b(profile|account|me)/i, path: "/profile", label: "Profile" },
  { match: /\b(leader.?board|rank)/i, path: "/leaderboard", label: "Leaderboard" },
  { match: /\b(ai|tools|companion|study)/i, path: "/ai-tools", label: "AI Tools" },
  { match: /\b(dashboard|admin|control)/i, path: "/dashboard", label: "Dashboard" },
  { match: /\b(holo|3d|holographic|hub)/i, path: "/hub", label: "3D Hub" },
];

export const useVoiceCommands = () => {
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recRef = useRef<SR | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSupported(!!SpeechRecognition);
  }, []);

  const handle = useCallback((text: string) => {
    setTranscript(text);
    const lower = text.toLowerCase();
    if (/^(open|go to|navigate|show|take me to)/i.test(lower) || true) {
      for (const r of ROUTES) {
        if (r.match.test(lower)) {
          toast.success(`Opening ${r.label}`);
          navigate(r.path);
          return;
        }
      }
    }
    toast.info(`Heard: "${text}" (no matching command)`);
  }, [navigate]);

  const start = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice not supported in this browser");
      return;
    }
    const rec: SR = new SpeechRecognition();
    rec.lang = "en-IN";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = (e: any) => {
      setListening(false);
      if (e.error !== "no-speech") toast.error(`Voice error: ${e.error}`);
    };
    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      handle(text);
    };
    rec.start();
    recRef.current = rec;
  }, [handle]);

  const stop = useCallback(() => {
    recRef.current?.stop?.();
    setListening(false);
  }, []);

  return { listening, supported, transcript, start, stop };
};
