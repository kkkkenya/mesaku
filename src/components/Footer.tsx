import { Globe } from "lucide-react";

const Footer = () => {
  const linkCols = [
    { title: "About Us", links: ["Our Mission", "History"] },
    { title: "Explore", links: ["Events", "Gallery", "Blog"] },
    { title: "Support", links: ["Membership", "Volunteer", "Donations"] },
  ];

  return (
    <footer className="bg-surface pt-16 pb-6">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-10 mb-10">
          {/* Logo */}
          <div className="flex items-start gap-2">
            <Globe className="w-8 h-8 text-primary mt-0.5" />
            <span className="font-heading text-xl font-bold text-navy">ISS Club</span>
          </div>

          {linkCols.map((col) => (
            <div key={col.title}>
              <h4 className="font-body text-sm font-semibold text-navy mb-4 tracking-wide">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <div className="flex gap-4">
            {["Instagram", "Youtube", "X", "Tiktok"].map((s) => (
              <a key={s} href="#" className="hover:text-primary transition-colors">{s}</a>
            ))}
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">Privacy & Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
