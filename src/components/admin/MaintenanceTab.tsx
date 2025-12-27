import { Construction, AlertTriangle, Save } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const MaintenanceTab = () => {
  const { settings, updateSettings } = useSiteSettings();
  const { toast } = useToast();
  const [message, setMessage] = useState(settings.maintenance_message);

  const handleToggleMaintenance = async () => {
    const result = await updateSettings({ 
      is_maintenance_mode: !settings.is_maintenance_mode 
    });
    if (result.success) {
      toast({ 
        title: settings.is_maintenance_mode ? 'Maintenance mode disabled' : 'Maintenance mode enabled',
        description: settings.is_maintenance_mode 
          ? 'Your site is now live' 
          : 'Visitors will see the maintenance page'
      });
    }
  };

  const handleSaveMessage = async () => {
    const result = await updateSettings({ maintenance_message: message });
    if (result.success) {
      toast({ title: 'Maintenance message saved' });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="font-display text-2xl font-bold">Maintenance Mode</h2>
        <p className="text-muted-foreground">Take your site offline for updates or changes</p>
      </div>

      {/* Status Card */}
      <div className={`glass-card p-6 ${settings.is_maintenance_mode ? 'border-warning/30 bg-warning/5' : 'border-success/30 bg-success/5'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              settings.is_maintenance_mode ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
            }`}>
              {settings.is_maintenance_mode ? (
                <Construction className="w-6 h-6" />
              ) : (
                <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
              )}
            </div>
            <div>
              <h3 className="font-display text-xl font-bold">
                {settings.is_maintenance_mode ? 'Site is Offline' : 'Site is Live'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {settings.is_maintenance_mode 
                  ? 'Visitors see the maintenance page' 
                  : 'Your site is accessible to everyone'}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleToggleMaintenance}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              settings.is_maintenance_mode 
                ? 'bg-success text-success-foreground hover:bg-success/90' 
                : 'bg-warning text-warning-foreground hover:bg-warning/90'
            }`}
          >
            {settings.is_maintenance_mode ? 'Go Live' : 'Enable Maintenance'}
          </button>
        </div>
      </div>

      {/* Warning */}
      {settings.is_maintenance_mode && (
        <div className="glass-card p-4 border-warning/30 bg-warning/5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-warning">Maintenance mode is active</p>
            <p className="text-sm text-muted-foreground mt-1">
              All visitors will see the maintenance page. Only admins can access the full site.
            </p>
          </div>
        </div>
      )}

      {/* Custom Message */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-medium flex items-center gap-2">
          <Construction className="w-4 h-4" />
          Maintenance Message
        </h3>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="input-glass min-h-[100px]"
          placeholder="We are currently performing maintenance. Please check back soon."
        />
        <button 
          onClick={handleSaveMessage} 
          className="btn-gradient flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Message
        </button>
      </div>
    </div>
  );
};

export default MaintenanceTab;
