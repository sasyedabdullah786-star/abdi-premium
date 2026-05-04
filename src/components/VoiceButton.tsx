import { Mic, MicOff } from "lucide-react";
import { useVoiceCommands } from "@/hooks/useVoiceCommands";

const VoiceButton = () => {
  const { listening, supported, start, stop } = useVoiceCommands();
  if (!supported) return null;
  return (
    <button
      onClick={listening ? stop : start}
      title={listening ? "Listening..." : "Voice command"}
      className={`fixed bottom-24 right-6 z-40 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
        listening
          ? "bg-destructive text-destructive-foreground animate-pulse"
          : "bg-primary text-primary-foreground hover:scale-110"
      }`}
      aria-label="Voice command"
    >
      {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
    </button>
  );
};

export default VoiceButton;
