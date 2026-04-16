import mesaLogo from "@/assets/mesa-logo.png";

const CLUB_EMAIL = "mechstudentsassociation.ku@gmail.com";

const Footer = () => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("mailto:")) return;
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const linkCols = [
    { title: "About Us", links: [{ label: "Our Mission", href: "#about" }, { label: "History", href: "#about" }] },
    { title: "Explore", links: [{ label: "Events", href: "#events" }, { label: "Gallery", href: "#gallery" }, { label: "Merch", href: "#merchandise" }] },
    { title: "Support", links: [{ label: "Newsletter", href: "#newsletter" }, { label: "Contact", href: `mailto:${CLUB_EMAIL}` }] },
  ];

  return (
    <footer className="bg-surface pt-16 pb-6">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div className="flex items-start gap-2">
            <img src={mesaLogo} alt="MESA KU" className="h-10 w-auto" />
            <span className="font-heading text-xl font-bold text-navy">MESA</span>
          </div>

          {linkCols.map((col) => (
            <div key={col.title}>
              <h4 className="font-body text-sm font-semibold text-navy mb-4 tracking-wide">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={(e) => handleClick(e, link.href)}
                      className="text-muted-foreground text-base hover:text-primary transition-colors inline-block min-h-[48px] flex items-center"
                    >
                      {link.label}
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
          <a href={`mailto:${CLUB_EMAIL}`} className="hover:text-primary transition-colors min-h-[48px] flex items-center text-sm">
            {CLUB_EMAIL}
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
