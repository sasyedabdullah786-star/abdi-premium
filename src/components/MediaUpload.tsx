import { useRef, useState } from "react";
import { Upload, Loader2, X, Image as ImageIcon, Video, FileText, Link as LinkIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Kind = "image" | "video" | "pdf" | "any";

const ACCEPT: Record<Kind, string> = {
  image: "image/*",
  video: "video/mp4,video/webm,video/quicktime",
  pdf: "application/pdf",
  any: "image/*,video/*,application/pdf",
};

interface Props {
  value: string;
  onChange: (url: string) => void;
  kind?: Kind;
  folder?: string;
  label?: string;
  className?: string;
  /** Show a URL input as a fallback for those who want to paste links */
  allowUrl?: boolean;
}

const MediaUpload = ({
  value,
  onChange,
  kind = "image",
  folder = "uploads",
  label,
  className = "",
  allowUrl = true,
}: Props) => {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("media").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("media").getPublicUrl(path);
      onChange(data.publicUrl);
      toast({ title: "Uploaded", description: file.name });
    } catch (e: any) {
      toast({
        title: "Upload failed",
        description: e?.message || "Make sure you are signed in as admin.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) upload(f);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) upload(f);
  };

  const isImg = value && /\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(value);
  const isVid = value && /\.(mp4|webm|mov)(\?|$)/i.test(value);
  const isPdf = value && /\.pdf(\?|$)/i.test(value);

  const Icon = kind === "video" ? Video : kind === "pdf" ? FileText : ImageIcon;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="text-xs font-medium text-muted-foreground block">{label}</label>}

      {value ? (
        <div className="relative group rounded-lg border border-border/50 overflow-hidden bg-muted/20">
          {isImg && <img src={value} alt="" className="w-full h-32 object-cover" />}
          {isVid && <video src={value} className="w-full h-32 object-cover" muted playsInline />}
          {isPdf && (
            <div className="h-32 flex items-center justify-center gap-2 text-muted-foreground">
              <FileText className="w-6 h-6" /> PDF uploaded
            </div>
          )}
          {!isImg && !isVid && !isPdf && (
            <div className="h-12 flex items-center px-3 text-xs text-muted-foreground truncate">{value}</div>
          )}
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1 right-1 p-1 rounded-md bg-background/80 hover:bg-destructive hover:text-destructive-foreground border border-border/50"
            title="Remove"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className="cursor-pointer rounded-lg border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-colors p-4 flex flex-col items-center justify-center gap-1 text-center min-h-[96px]"
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          ) : (
            <>
              <Icon className="w-5 h-5 text-muted-foreground" />
              <div className="text-xs font-medium">Click or drop {kind === "any" ? "file" : kind}</div>
              <div className="text-[10px] text-muted-foreground">Stored on the platform (no external link)</div>
            </>
          )}
        </div>
      )}

      <input ref={inputRef} type="file" accept={ACCEPT[kind]} onChange={onPick} className="hidden" />

      {allowUrl && (
        <div className="relative">
          <LinkIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="…or paste a URL"
            className="input-glass text-xs w-full pl-8"
          />
        </div>
      )}
    </div>
  );
};

export default MediaUpload;
