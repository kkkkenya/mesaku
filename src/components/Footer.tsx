import mesaLogo from "@/assets/mesa-logo.png";

const CLUB_EMAIL = "mechstudentsassociation.ku@gmail.com";
const CLUB_INSTAGRAM = "https://www.instagram.com/YOUR_HANDLE_HERE";

const Footer = () => {
  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const linkCols = [
    {
      title: "About Us",
      links: [
        { label: "Our Mission", action: (e: React.MouseEvent<HTMLAnchorElement>) => scrollTo(e, "about") },
        { label: "History", action: (e: React.MouseEvent<HTMLAnchorElement>) => scrollTo(e, "about") },
      ],
    },
    {
      title: "Explore",
      links: [
        { label: "Events", action: (e: React.MouseEvent<HTMLAnchorElement>) => scrollTo(e, "events") },
        { label: "Gallery", action: (e: React.MouseEvent<HTMLAnchorElement>) => scrollTo(e, "gallery") },
        { label: "Projects", action: (e: React.MouseEvent<HTMLAnchorElement>) => scrollTo(e, "gallery") },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Membership", action: () => { window.location.href = `mailto:${CLUB_EMAIL}`; } },
        { label: "Volunteer", action: () => { window.location.href = `mailto:${CLUB_EMAIL}`; } },
        { label: "Sponsorship", action: () => { window.location.href = `mailto:${CLUB_EMAIL}`; } },
      ],
    },
  ];

  const socials = [
    { label: "Instagram", action: () => window.open(CLUB_INSTAGRAM, "_blank") },
    { label: "Youtube", action: () => {} }, // TODO: Add YouTube URL
    { label: "X", action: () => {} }, // TODO: Add X/Twitter URL
    { label: "Tiktok", action: () => {} }, // TODO: Add TikTok URL
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
                      href="#"
                      onClick={(e) => { e.preventDefault(); link.action(e); }}
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
            {socials.map((s) => (
              <a
                key={s.label}
                href="#"
                onClick={(e) => { e.preventDefault(); s.action(); }}
                className="hover:text-primary transition-colors"
              >
                {s.label}
              </a>
            ))}
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            {/* TODO: Add privacy page */}
            <a href="#" onClick={(e) => e.preventDefault()}>Privacy & Policy</a>
            {/* TODO: Add terms page */}
            <a href="#" onClick={(e) => e.preventDefault()}>Terms & Conditions</a>
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