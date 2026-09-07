import { useEffect, useState } from 'react';
import { Download, Smartphone, Chrome, X } from 'lucide-react';
import { toast } from 'sonner';

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const InstallApp = () => {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setDeferred(e as BIPEvent); };
    const onInstalled = () => { setInstalled(true); setDeferred(null); };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', onInstalled);
    if (window.matchMedia('(display-mode: standalone)').matches) setInstalled(true);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  };

  const downloadExtension = () => {
    fetch('/ab3d-extension.zip')
      .then(r => { if (!r.ok) throw new Error('Download failed'); return r.blob(); })
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'ab3d-extension.zip';
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch(err => toast.error(err.message || 'Download failed'));
  };

  if (installed) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Install app"
        className="fixed bottom-40 right-5 z-40 h-9 px-3 rounded-full bg-background/80 backdrop-blur border border-border/50 shadow-lg flex items-center gap-1.5 text-xs font-medium hover:bg-muted/50 transition-all"
      >
        <Download className="w-3.5 h-3.5" /> Install
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-background/70 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)}>
          <div className="w-full sm:max-w-md m-0 sm:m-4 rounded-t-2xl sm:rounded-2xl border border-border/40 bg-background shadow-2xl p-5 animate-slide-in-right" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Download className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-sm font-bold">Install ABD"I</div>
                  <div className="text-[10px] text-muted-foreground">Get the app on any device</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-md hover:bg-muted/50"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-3">
              <button
                onClick={install}
                disabled={!deferred}
                className="w-full flex items-start gap-3 p-3 rounded-xl border border-border/40 hover:bg-muted/30 transition-colors text-left disabled:opacity-60"
              >
                <Smartphone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">Install as App (PWA)</div>
                  <div className="text-[11px] text-muted-foreground">
                    {deferred
                      ? 'Tap to install on this device.'
                      : 'On iPhone: Share → Add to Home Screen. On Android/desktop Chrome: menu → Install app.'}
                  </div>
                </div>
              </button>

              <button
                onClick={downloadExtension}
                className="w-full flex items-start gap-3 p-3 rounded-xl border border-border/40 hover:bg-muted/30 transition-colors text-left"
              >
                <Chrome className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">Chrome Extension</div>
                  <div className="text-[11px] text-muted-foreground">
                    Download .zip → chrome://extensions → enable Developer mode → Load unpacked.
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallApp;
