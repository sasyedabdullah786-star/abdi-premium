import { Save, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
import { useContactInfo } from "@/hooks/useContactInfo";
import { useToast } from "@/hooks/use-toast";

const ContactTab = () => {
  const { contactInfo, updateContactInfo } = useContactInfo();
  const { toast } = useToast();

  const socialLinks = contactInfo?.social_links as Record<string, string> || {};

  const handleUpdateSocialLink = (platform: string, url: string) => {
    updateContactInfo({
      social_links: {
        ...socialLinks,
        [platform]: url
      }
    });
  };

  const handleSave = () => {
    toast({ title: "Contact info saved!" });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="font-display text-2xl font-bold">Contact Information</h2>
        <p className="text-muted-foreground">Manage contact details displayed on your site</p>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h3 className="font-medium">Basic Information</h3>
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Mail className="w-4 h-4" /> Email Address
          </label>
          <input 
            type="email" 
            value={contactInfo?.email || ""} 
            onChange={(e) => updateContactInfo({ email: e.target.value })} 
            className="input-glass" 
            placeholder="contact@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Phone className="w-4 h-4" /> Phone Number
          </label>
          <input 
            type="tel" 
            value={contactInfo?.phone || ""} 
            onChange={(e) => updateContactInfo({ phone: e.target.value })} 
            className="input-glass" 
            placeholder="+1 234 567 8900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Address
          </label>
          <textarea 
            value={contactInfo?.address || ""} 
            onChange={(e) => updateContactInfo({ address: e.target.value })} 
            className="input-glass min-h-[80px]" 
            placeholder="123 Main Street, City, Country"
          />
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h3 className="font-medium">Social Media Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Facebook className="w-4 h-4" /> Facebook
            </label>
            <input 
              type="url" 
              value={socialLinks.facebook || ""} 
              onChange={(e) => handleUpdateSocialLink('facebook', e.target.value)} 
              className="input-glass" 
              placeholder="https://facebook.com/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Twitter className="w-4 h-4" /> Twitter/X
            </label>
            <input 
              type="url" 
              value={socialLinks.twitter || ""} 
              onChange={(e) => handleUpdateSocialLink('twitter', e.target.value)} 
              className="input-glass" 
              placeholder="https://twitter.com/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Instagram className="w-4 h-4" /> Instagram
            </label>
            <input 
              type="url" 
              value={socialLinks.instagram || ""} 
              onChange={(e) => handleUpdateSocialLink('instagram', e.target.value)} 
              className="input-glass" 
              placeholder="https://instagram.com/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Linkedin className="w-4 h-4" /> LinkedIn
            </label>
            <input 
              type="url" 
              value={socialLinks.linkedin || ""} 
              onChange={(e) => handleUpdateSocialLink('linkedin', e.target.value)} 
              className="input-glass" 
              placeholder="https://linkedin.com/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Youtube className="w-4 h-4" /> YouTube
            </label>
            <input 
              type="url" 
              value={socialLinks.youtube || ""} 
              onChange={(e) => handleUpdateSocialLink('youtube', e.target.value)} 
              className="input-glass" 
              placeholder="https://youtube.com/..."
            />
          </div>
        </div>
      </div>

      <button onClick={handleSave} className="btn-gradient flex items-center gap-2">
        <Save className="w-4 h-4" /> Save Contact Info
      </button>
    </div>
  );
};

export default ContactTab;
