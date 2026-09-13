import { useMemo, useState } from "react";
import {
  Sparkles,
  CalendarDays,
  ShoppingBag,
  Megaphone,
  Users,
  Mail,
  FolderOpen,
  ShieldCheck,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  Search,
  LifeBuoy,
  ChevronRight,
} from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/* ────────────────────────────────────────────────────────────────
   Content
   ──────────────────────────────────────────────────────────────── */

const inputCls =
  "w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal transition-colors";

const NAV = [
  { id: "getting-started", label: "Getting started", icon: Sparkles },
  { id: "events", label: "Events", icon: CalendarDays },
  { id: "merchandise", label: "Merchandise", icon: ShoppingBag },
  { id: "announcements", label: "Announcements", icon: Megaphone },
  { id: "executives", label: "Executive Board", icon: Users },
  { id: "newsletter", label: "Newsletter", icon: Mail },
  { id: "assets", label: "Assets", icon: FolderOpen },
  { id: "account", label: "Account & Access", icon: ShieldCheck },
  { id: "faq", label: "FAQ", icon: HelpCircle },
  { id: "errors", label: "Error messages", icon: AlertTriangle },
];

interface Faq {
  q: string;
  a: string;
}

const FAQS: Faq[] = [
  {
    q: "I saved a change but the website still shows the old version. What do I do?",
    a: "First, hard-refresh the public page (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac) — browsers cache pages for a short while. Second, check the item's status: events and announcements only appear publicly when they are set to Published, and archived items never appear. Executives and assets appear as soon as they are saved.",
  },
  {
    q: "Why do some executives still show their old photo even after the board changed?",
    a: "When the executive board moved to the database, the photos that were built into the website were kept as a fallback so the page never looked broken. A member keeps that fallback photo until someone uploads a photo for them in Admin → Executives. Once uploaded, the new photo is used everywhere immediately.",
  },
  {
    q: "How do I change the order executives appear in on the homepage?",
    a: "Go to Admin → Executives and use the small up/down arrows on each member's card. The Chairman is traditionally first, so keep the chairman at the top. New members are added to the end of the board — move them up after adding them.",
  },
  {
    q: "What is the difference between Archive and Delete?",
    a: "Archive hides an item from the public website but keeps it in the Archive tab so you can restore it later — use this for things like last year's board or past events. Delete removes the item and its files permanently. If you are not sure, archive first.",
  },
  {
    q: "What image sizes work best?",
    a: "Executive portraits look best at a 3:4 portrait ratio (e.g. 900×1200). Event posters and merch photos can be square or portrait — they are cropped to fit. Logos should be PNG with a transparent background where possible. Anything above roughly 3 MB should be compressed before uploading so pages load fast.",
  },
  {
    q: "My PDF will not upload to Assets. Why?",
    a: "Assets accept images and PDFs up to 10 MB. If a small PDF still fails, the storage bucket may be configured to allow images only. That is a one-time settings fix: Supabase Dashboard → Storage → media → settings → allow 'application/pdf' (or clear the MIME restriction). If you cannot access the Supabase dashboard, ask whoever set up the site to change it.",
  },
  {
    q: "How do I put a logo into a newsletter or a poster I am designing?",
    a: "Admin → Assets → find the logo → 'Copy link' button. Paste that URL into Mailchimp, Canva, or any tool that accepts an image link. Use 'Download' instead when you need the actual file on your device.",
  },
  {
    q: "Someone forgot their admin password. How do we reset it?",
    a: "Passwords are managed by Supabase, not by this admin panel. An existing administrator can reset or create accounts in the Supabase Dashboard (Authentication → Users), or pass the request to whoever maintains the site. There is no self-service reset on the login page by design.",
  },
  {
    q: "The whole Executive Board section disappeared from the homepage. Is the site broken?",
    a: "Most likely every member is archived, or they were all deleted. Go to Admin → Executives → Archive tab and restore the members. If the database itself is unreachable, the homepage automatically falls back to showing the original board, so a missing section almost always means an empty or fully archived board.",
  },
  {
    q: "Can I edit an event after it has already happened?",
    a: "Yes. Past events are labelled automatically and can still be edited or archived. Archiving moves them out of the public listing but keeps the record — useful for the newsletter recap or next year's planning.",
  },
  {
    q: "How often should we send the newsletter?",
    a: "Subscribers signed up for events, announcements, and opportunities only. Roughly twice a month is a healthy rhythm — enough to stay visible without burning goodwill. Always send yourself a test email before broadcasting to the full list.",
  },
  {
    q: "Can more than one person have admin access?",
    a: "Yes. Admin access is tied to the account's role in the database. An existing administrator (or whoever manages the Supabase project) can promote another signed-up account to admin. Avoid sharing one login between several people — separate accounts keep actions accountable.",
  },
];

interface ErrorEntry {
  message: string;
  where: string;
  meaning: string;
  fix: string;
}

const ERRORS: ErrorEntry[] = [
  {
    message: "Access Denied",
    where: "Opening any /admin page",
    meaning:
      "You are signed in, but this account's role in the database is not 'admin'. The panel refuses to load for safety.",
    fix: "Sign in with the correct admin account. If this account should be an admin, an existing administrator must promote it in the Supabase Dashboard (Database → profiles → set role to 'admin').",
  },
  {
    message: "Invalid login credentials",
    where: "Login page",
    meaning: "The email or password is wrong for this account.",
    fix: "Check for typos and caps-lock. If the password is genuinely forgotten, an existing admin can reset it in Supabase Dashboard → Authentication → Users.",
  },
  {
    message: "Failed to load … : Could not find the table 'public.…' in the schema cache",
    where: "Opening Executives or Assets",
    meaning:
      "The database table for that section does not exist yet — its setup SQL was never run (or was run on the wrong project).",
    fix: "Run the section's migration SQL in Supabase Dashboard → SQL Editor (the SQL lives in the project's supabase/migrations folder). Then reload the admin page.",
  },
  {
    message: "Failed to save … : new row violates row-level security policy",
    where: "Saving anything",
    meaning:
      "The database rejected the change because your session is not recognised as an admin — usually the login session expired or the account is not an admin.",
    fix: "Sign out and sign in again. If it still happens, the account is not an admin — see the 'Access Denied' entry above.",
  },
  {
    message: "Upload failed — the storage bucket may not accept this file type.",
    where: "Uploading in Assets or a poster/photo upload",
    meaning:
      "Supabase Storage rejected the file because the 'media' bucket's allowed file types do not include it (most commonly PDF).",
    fix: "Supabase Dashboard → Storage → media → settings → allow 'application/pdf' (or clear the MIME restriction). Images always work; this only affects documents.",
  },
  {
    message: "File is larger than 10 MB.",
    where: "Uploading an asset",
    meaning: "The file exceeds the 10 MB limit set to keep the website fast.",
    fix: "Compress it first: images can be resized or exported at 80% quality (TinyPNG, Squoosh); PDFs can be compressed with ilovepdf.com or 'Export as reduced size PDF'. Then upload again.",
  },
  {
    message: "Subscription failed. Please try again. / Network error. Please try again.",
    where: "Newsletter popup or homepage form",
    meaning:
      "The subscribe service (a Supabase Edge Function talking to Mailchimp) did not respond — a temporary network issue, or the Mailchimp connection is down.",
    fix: "Try again in a minute. If it persists for visitors, check the Mailchimp API key in Supabase Dashboard → Edge Functions secrets, and test the function logs.",
  },
  {
    message: "You're already on the list.",
    where: "Newsletter popup",
    meaning:
      "This email is already subscribed. This is shown as a friendly notice, not an error — nothing needs fixing.",
    fix: "Nothing. Close the popup and carry on.",
  },
  {
    message: "Failed to send campaign / Mailchimp errors (API key, audience, limits)",
    where: "Admin → Newsletter → sending",
    meaning:
      "Mailchimp refused the send. Usual causes: an expired or wrong API key, the audience/list was renamed or deleted, or the Mailchimp account hit its sending/contact limit.",
    fix: "Check the API key and audience ID stored in the Supabase Edge Function secrets, confirm the Mailchimp account is active and under its contact limit, then send again. Always send yourself a test first.",
  },
  {
    message: "A photo or poster shows as broken / blank on the public site",
    where: "Public pages",
    meaning:
      "The image URL in the database no longer points at a file — usually the file was deleted from storage directly, or the upload silently failed earlier.",
    fix: "Open the item in the admin panel, re-upload the image, and save. Deleting an item also deletes its file — re-adding the item does not restore the file, so upload a fresh copy.",
  },
];

/* ────────────────────────────────────────────────────────────────
   Small building blocks
   ──────────────────────────────────────────────────────────────── */

function Section({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string;
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="h-8 w-8 rounded-lg bg-teal/10 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-teal" />
        </div>
        <h2 className="font-heading text-xl font-bold text-slate-900">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Steps({ items }: { items: string[] }) {
  return (
    <ol className="space-y-2">
      {items.map((s, i) => (
        <li key={i} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
          <span className="shrink-0 h-5 w-5 mt-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold inline-flex items-center justify-center">
            {i + 1}
          </span>
          <span>{s}</span>
        </li>
      ))}
    </ol>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-slate-600 leading-relaxed">{children}</p>;
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 bg-amber-50 border border-amber-100 rounded-lg px-3.5 py-3">
      <Lightbulb className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
      <p className="text-[13px] text-amber-900 leading-relaxed">{children}</p>
    </div>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code className="text-[12px] font-mono bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-slate-800 break-all">
      {children}
    </code>
  );
}

/* ────────────────────────────────────────────────────────────────
   Page
   ──────────────────────────────────────────────────────────────── */

export default function AdminHelp() {
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filteredFaqs = useMemo(
    () =>
      !q
        ? FAQS
        : FAQS.filter(
            (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q),
          ),
    [q],
  );
  const filteredErrors = useMemo(
    () =>
      !q
        ? ERRORS
        : ERRORS.filter(
            (e) =>
              e.message.toLowerCase().includes(q) ||
              e.where.toLowerCase().includes(q) ||
              e.meaning.toLowerCase().includes(q) ||
              e.fix.toLowerCase().includes(q),
          ),
    [q],
  );
  const searching = q.length > 0;
  const totalHits = filteredFaqs.length + filteredErrors.length;

  const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="max-w-5xl">
      <AdminPageHeader
        title="Guide & FAQ"
        breadcrumb="Help"
        subtitle="How to use every section of this panel, answers to common questions, and fixes for the errors you might meet."
      />

      <div className="lg:flex gap-8 items-start">
        {/* ── In-page navigation ── */}
        <nav className="lg:sticky lg:top-8 lg:w-56 shrink-0 mb-6 lg:mb-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2 px-1">
            On this page
          </p>
          <div className="flex lg:flex-col flex-wrap gap-1">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => jump(n.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm transition-colors text-left"
              >
                <n.icon className="h-3.5 w-3.5 text-slate-400" />
                {n.label}
              </button>
            ))}
          </div>
        </nav>

        {/* ── Content ── */}
        <div className="flex-1 min-w-0 space-y-10">
          {/* Search */}
          <div>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the FAQ and error messages — try 'PDF', 'photo', 'Access Denied'…"
                className={`${inputCls} pl-10`}
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-700"
                >
                  Clear
                </button>
              )}
            </div>
            {searching && (
              <p className="mt-2 text-xs text-slate-500">
                {totalHits === 0
                  ? "No matches in the FAQ or error list — try a shorter word, or read the sections for your task."
                  : `${totalHits} match${totalHits === 1 ? "" : "es"}: ${filteredFaqs.length} in FAQ, ${filteredErrors.length} in error messages.`}
              </p>
            )}
          </div>

          {/* Getting started */}
          <Section id="getting-started" icon={Sparkles} title="Getting started">
            <Paragraph>
              Everything on the public website — the homepage sections, events,
              announcements, the leadership board, and the newsletter — is managed
              from this panel. Changes go live the moment you save; there is no
              separate "deploy" step and nothing needs to be re-uploaded.
            </Paragraph>
            <Paragraph>
              Each item can be in one of three states:{" "}
              <strong>Draft</strong> (only you can see it), <strong>Published</strong>{" "}
              (visible on the public site), and <strong>Archived</strong> (hidden
              from the public site but kept for the record). Use draft while you
              are still working, publish when it is ready, archive when it is no
              longer current.
            </Paragraph>
            <Steps
              items={[
                "Sign in at /login with your admin email and password.",
                "Use the sidebar to move between sections — each one manages one part of the site.",
                "Edit an existing item with the pencil icon, create new ones with the teal 'New / Add / Upload' button.",
                "If you get lost, 'Restart Tour' at the bottom of the sidebar walks you through every section once.",
              ]}
            />
            <Tip>
              Deleting is permanent and also deletes the item's photo or file from
              storage. When in doubt, use Archive — you can restore from the
              Archive tab at any time.
            </Tip>
          </Section>

          {/* Events */}
          <Section id="events" icon={CalendarDays} title="Events">
            <Paragraph>
              Events appear on the Events page, and upcoming published events also
              appear in the homepage events section. The public site automatically
              builds an 'Add to Google Calendar' link from the date and time you
              enter, so getting those right matters.
            </Paragraph>
            <Steps
              items={[
                "Click 'New Event'. Fill in the title and description first.",
                "Add the venue and the date with time — this drives the calendar link and the past/upcoming sorting.",
                "If registration happens somewhere else (Google Form, WhatsApp), paste that link into RSVP URL.",
                "Upload a poster or cover image — portrait or square works best.",
                "Leave the status as Draft until everything is checked, then switch it to Published and save.",
              ]}
            />
            <Tip>
              After an event has happened, archive it rather than deleting — the
              Archive tab keeps the record for recaps and next year's planning.
            </Tip>
          </Section>

          {/* Merchandise */}
          <Section id="merchandise" icon={ShoppingBag} title="Merchandise">
            <Paragraph>
              Products shown on the Merch page. Customers order through WhatsApp —
              the site opens a chat with the product name already typed in — or
              through your own link if you fill in Order URL (a Google Form, for
              example).
            </Paragraph>
            <Steps
              items={[
                "Click 'New Item' and enter the name and price in KSh (numbers only).",
                "Describe the item — material, fit, collection point. Buyers read this before ordering.",
                "Set Stock Status so the page can show what is actually available.",
                "Upload a real product photo on a clean background; switch Featured on for the item you want to highlight.",
                "Publish when the item is ready for orders. Out-of-stock items can stay published — the page communicates the status.",
              ]}
            />
          </Section>

          {/* Announcements */}
          <Section id="announcements" icon={Megaphone} title="Announcements">
            <Paragraph>
              Short notices for members: meeting changes, results, deadlines. The
              homepage shows the three most recent published announcements; the
              full Announcements page lists everything published.
            </Paragraph>
            <Steps
              items={[
                "Click 'New Announcement'. The date defaults to today — it is the date shown to readers, not a schedule.",
                "Pick a tag: Announcement, Event, News, or Update. It becomes the colour label on the card.",
                "Keep the description short and concrete — what changed, for whom, and what to do next.",
                "Toggle Published on when it should go live. Unpublish instead of deleting if a notice becomes wrong or outdated.",
              ]}
            />
          </Section>

          {/* Executives */}
          <Section id="executives" icon={Users} title="Executive Board">
            <Paragraph>
              The leadership team shown in the homepage 'Executive Board' section.
              Every member has a name, a position, and a photo — all editable.
            </Paragraph>
            <Steps
              items={[
                "To update someone (new photo, new position, corrected name): find their card, click the pencil, edit, save.",
                "To add a new member: click 'Add Executive', fill in the details, and upload a photo — portraits at a 3:4 ratio look best.",
                "To control the order: use the up/down arrows on each card. The Chairman is traditionally first.",
                "When the board changes yearly: archive the outgoing members (they stay in the Archive tab) and add the new ones. Restore an archived member any time.",
                "To remove someone entirely, use Delete — this also removes their photo file from storage.",
              ]}
            />
            <Tip>
              A member keeps the site's original bundled photo until someone
              uploads a photo for them — so the page never looks broken while you
              collect photos from the new board.
            </Tip>
          </Section>

          {/* Newsletter */}
          <Section id="newsletter" icon={Mail} title="Newsletter">
            <Paragraph>
              This section lists everyone who subscribed through the website and
              lets you send campaigns through the connected Mailchimp account.
              Subscribers signed up for events, announcements, and opportunities —
              keep the content relevant to that.
            </Paragraph>
            <Steps
              items={[
                "Draft the campaign: a clear subject line, a short preview text, and the body. Use Assets → 'Copy link' for images you want to embed.",
                "Always send a test email to yourself first and open it on your phone before broadcasting.",
                "Send to the full list only when the test looks right.",
                "Keep the rhythm at roughly two emails a month; subscribers can mark you as spam if you over-send, which hurts deliverability for everyone.",
              ]}
            />
            <Tip>
              Campaign sending depends on the Mailchimp connection staying valid.
              If a send fails, check the error reference below before re-sending.
            </Tip>
          </Section>

          {/* Assets */}
          <Section id="assets" icon={FolderOpen} title="Assets">
            <Paragraph>
              The shared library of logos, photos, and documents (PDF) — the
              constitution, handbook, brand logos, poster templates. It exists so
              nobody has to dig through old chats for the MESA logo again.
            </Paragraph>
            <Steps
              items={[
                "Click 'Upload Asset', choose a file (image or PDF, up to 10 MB) and a category: Logo, Document, Photo, or Other.",
                "Give it a clear name — 'MESA Logo (white on dark)' beats 'logo-final-v2'.",
                "Use 'Download' when you need the file itself; use 'Copy link' when a tool (Mailchimp, Canva) accepts an image URL.",
                "Use the filter tabs (All / Logos / Documents / Photos / Other) to find things fast.",
                "Edit re-names or re-categorises an asset, or replaces the file. Delete removes it — and its file — permanently.",
              ]}
            />
            <Tip>
              If a PDF refuses to upload, it is almost always the storage bucket's
              file-type settings, not your file — see the error reference below.
            </Tip>
          </Section>

          {/* Account */}
          <Section id="account" icon={ShieldCheck} title="Account & Access">
            <Paragraph>
              Admin access is tied to your account's role in the database, not to
              a shared password. That keeps actions attributable — please do not
              share logins.
            </Paragraph>
            <Paragraph>
              <strong>Signing in:</strong> go to <Mono>/login</Mono> and use your
              admin email and password. The panel opens automatically on success.
            </Paragraph>
            <Paragraph>
              <strong>Access Denied:</strong> means the account is signed in but
              is not marked as an admin. An existing administrator promotes
              accounts in the Supabase Dashboard (Database → profiles → role).
            </Paragraph>
            <Paragraph>
              <strong>Forgot password / new accounts:</strong> there is no
              self-service reset by design. An existing admin handles resets in
              Supabase Dashboard → Authentication → Users.
            </Paragraph>
            <Paragraph>
              <strong>Sign Out</strong> (bottom of the sidebar) ends your session
              on that device. Do this on shared computers, every time.
            </Paragraph>
          </Section>

          {/* FAQ */}
          <Section id="faq" icon={HelpCircle} title="Frequently asked questions">
            {searching && filteredFaqs.length === 0 ? (
              <Paragraph>No FAQ matches your search.</Paragraph>
            ) : (
              <Accordion type="single" collapsible className="space-y-2">
                {filteredFaqs.map((f, i) => (
                  <AccordionItem
                    key={f.q}
                    value={`faq-${i}`}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 border-b"
                  >
                    <AccordionTrigger className="text-sm font-semibold text-slate-800 hover:no-underline text-left">
                      {f.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-slate-600 leading-relaxed">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </Section>

          {/* Errors */}
          <Section id="errors" icon={AlertTriangle} title="Error messages explained">
            <Paragraph>
              Every error the panel shows says what went wrong in plain words.
              Below are the messages you are most likely to meet, what each one
              actually means, and the way out. Use the search box at the top to
              find your exact message.
            </Paragraph>
            {searching && filteredErrors.length === 0 ? (
              <Paragraph>No error message matches your search.</Paragraph>
            ) : (
              <div className="space-y-3">
                {filteredErrors.map((e) => (
                  <div
                    key={e.message}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5"
                  >
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 break-words">
                          {e.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{e.where}</p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2 text-sm leading-relaxed">
                      <p className="text-slate-600">
                        <span className="font-semibold text-slate-700">What it means: </span>
                        {e.meaning}
                      </p>
                      <p className="text-slate-600">
                        <span className="font-semibold text-slate-700">How to fix it: </span>
                        {e.fix}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Before reporting */}
            <div className="mt-6 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <LifeBuoy className="h-4 w-4 text-teal" />
                <h3 className="font-semibold text-slate-900 text-sm">
                  Still stuck? Before you report it
                </h3>
              </div>
              <Steps
                items={[
                  "Hard-refresh the page (Ctrl+Shift+R / Cmd+Shift+R) and try the action once more.",
                  "Sign out and sign in again — a surprising number of 'failed to save' errors are just an expired session.",
                  "Note the exact error text (or screenshot it), what you clicked, and the section you were in.",
                  "Send all of that to the site administrator — the more precise the report, the faster the fix.",
                ]}
              />
              <p className="mt-4 text-sm text-slate-600">
                Reach the team at{" "}
                <a
                  href="mailto:mechstudentsassociation.ku@gmail.com"
                  className="font-semibold text-[#1E3A8A] hover:text-[#D4A017] transition-colors inline-flex items-center gap-0.5"
                >
                  mechstudentsassociation.ku@gmail.com
                  <ChevronRight className="h-3.5 w-3.5" />
                </a>
                .
              </p>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
