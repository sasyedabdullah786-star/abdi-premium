import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const SHAYARIS = [
  { line: "मंज़िल उन्हीं को मिलती है, जिनके सपनों में जान होती है।", sub: "Dreams with fire never sleep." },
  { line: "किताबें ही हैं वो दौलत, जो कभी कम नहीं होती।", sub: "Knowledge — the only wealth that grows." },
  { line: "रात भर जागकर पढ़ने वाले ही सुबह की धूप के हक़दार हैं।", sub: "Sunrise belongs to those who studied the night." },
  { line: "हर सवाल का जवाब मिलेगा — बस कोशिश ज़ारी रखो।", sub: "Every question yields — keep going." },
  { line: "सपने वो नहीं जो नींद में आएं, सपने वो हैं जो नींद उड़ा दें।", sub: "True dreams cost your sleep." },
  { line: "मेहनत इतनी ख़ामोशी से करो, कि कामयाबी शोर मचा दे।", sub: "Work silently. Let success roar." },
];

const ShayariBanner = () => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setI((x) => (x + 1) % SHAYARIS.length), 6000);
    return () => window.clearInterval(t);
  }, []);
  const cur = SHAYARIS[i];
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 md:p-6 backdrop-blur-sm">
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative flex items-start gap-4">
        <div className="shrink-0 w-9 h-9 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div key={i} className="flex-1 animate-fade-in">
          <p className="text-base md:text-lg font-medium leading-snug text-foreground">{cur.line}</p>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">— {cur.sub}</p>
        </div>
      </div>
    </div>
  );
};

export default ShayariBanner;
