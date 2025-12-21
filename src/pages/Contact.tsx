import { useState } from "react";
import { Mail, Phone, MapPin, Send, Twitter, Facebook, Instagram } from "lucide-react";
import Layout from "@/components/Layout";
import { useContactInfo } from "@/hooks/useContactInfo";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { contactInfo, loading } = useContactInfo();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Message Sent!",
      description: "We'll get back to you as soon as possible.",
    });
    
    setFormData({ name: '', email: '', message: '' });
    setSending(false);
  };

  const socialIcons: Record<string, typeof Twitter> = {
    twitter: Twitter,
    facebook: Facebook,
    instagram: Instagram
  };

  return (
    <Layout title="Contact Us">
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6 animate-fade-in">
            <div className="glass-card p-8">
              <h2 className="font-display text-2xl font-bold mb-6 gradient-text">Get in Touch</h2>
              
              {loading ? (
                <div className="text-muted-foreground">Loading...</div>
              ) : (
                <div className="space-y-6">
                  {contactInfo?.address && (
                    <div className="flex items-start gap-4">
                      <div className="icon-gradient shrink-0">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium mb-1">Address</div>
                        <div className="text-muted-foreground">{contactInfo.address}</div>
                      </div>
                    </div>
                  )}
                  
                  {contactInfo?.phone && (
                    <div className="flex items-start gap-4">
                      <div className="icon-gradient shrink-0">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium mb-1">Phone</div>
                        <a href={`tel:${contactInfo.phone}`} className="text-muted-foreground hover:text-primary transition-colors">
                          {contactInfo.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {contactInfo?.email && (
                    <div className="flex items-start gap-4">
                      <div className="icon-gradient shrink-0">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium mb-1">Email</div>
                        <a href={`mailto:${contactInfo.email}`} className="text-muted-foreground hover:text-primary transition-colors">
                          {contactInfo.email}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Social Links */}
              {contactInfo?.social_links && Object.keys(contactInfo.social_links).some(k => contactInfo.social_links[k]) && (
                <div className="mt-8 pt-6 border-t border-border/30">
                  <div className="font-medium mb-4">Follow Us</div>
                  <div className="flex gap-4">
                    {Object.entries(contactInfo.social_links).map(([platform, url]) => {
                      if (!url) return null;
                      const Icon = socialIcons[platform.toLowerCase()] || Twitter;
                      return (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="icon-gradient hover:scale-110 transition-transform"
                        >
                          <Icon className="w-5 h-5 text-primary" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Form */}
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <form onSubmit={handleSubmit} className="glass-card p-8">
              <h2 className="font-display text-2xl font-bold mb-6 gradient-text">Send a Message</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="input-glass"
                    placeholder="Your name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="input-glass"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={5}
                    className="input-glass resize-none"
                    placeholder="Your message..."
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={sending}
                  className="btn-gradient w-full flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <span>Sending...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
