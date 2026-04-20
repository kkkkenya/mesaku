import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2,
  RefreshCw,
  ExternalLink,
  Send,
  Save,
  Users,
  CheckCircle2,
  AlertCircle,
  Upload,
  X as XIcon,
  Bold,
  Italic,
  Heading2,
  List,
  Link as LinkIcon,
  History,
  TestTube2,
  Mail,
  TrendingUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Member = { email: string; subscribed_at: string };
type Campaign = {
  id: string;
  webId: number | null;
  subject: string;
  status: string;
  createTime: string;
  sendTime: string;
  emailsSent: number;
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

const inputCls =
  "w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal transition-colors";
const labelCls = "block text-sm font-semibold text-slate-700 mb-1.5";

function SectionHeading({
  children,
  icon,
  action,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 mb-3">
      <h2 className="font-heading text-lg md:text-xl font-bold text-slate-900 inline-flex items-center gap-2.5 pl-3 border-l-4 border-teal">
        {icon}
        {children}
      </h2>
      {action}
    </div>
  );
}

export default function AdminNewsletter() {
  // Subscribers
  const [total, setTotal] = useState<number | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // Campaign history
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [campaignsError, setCampaignsError] = useState<string | null>(null);

  // Compose form
  const [campaignName, setCampaignName] = useState("");
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [body, setBody] = useState("");
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  // Image
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Test send
  const [testEmailAddress, setTestEmailAddress] = useState("gregorykimemiah@gmail.com");
  const [sendingTest, setSendingTest] = useState(false);

  // Send / draft
  const [sending, setSending] = useState<"send" | "draft" | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  // ===== Data fetching =====
  const fetchSubs = async () => {
    setLoadingList(true);
    setListError(null);
    const { data, error } = await supabase.functions.invoke("get-mailchimp-subscribers", {
      method: "GET",
    });
    if (error) {
      setListError(error.message || "Failed to load subscribers.");
      setLoadingList(false);
      return;
    }
    if ((data as { error?: string })?.error) {
      setListError((data as { error: string }).error);
      setLoadingList(false);
      return;
    }
    setTotal((data as { total: number }).total ?? 0);
    setMembers(((data as { members: Member[] }).members ?? []) as Member[]);
    setLoadingList(false);
  };

  const fetchCampaigns = async () => {
    setLoadingCampaigns(true);
    setCampaignsError(null);
    const { data, error } = await supabase.functions.invoke("get-mailchimp-campaigns", {
      method: "GET",
    });
    if (error) {
      setCampaignsError(error.message || "Failed to load campaigns.");
      setLoadingCampaigns(false);
      return;
    }
    if ((data as { error?: string })?.error) {
      setCampaignsError((data as { error: string }).error);
      setLoadingCampaigns(false);
      return;
    }
    setCampaigns(((data as { campaigns: Campaign[] }).campaigns ?? []) as Campaign[]);
    setLoadingCampaigns(false);
  };

  useEffect(() => {
    fetchSubs();
    fetchCampaigns();
  }, []);

  // Trend: count members with subscribed_at within the last 7 days
  const newThisWeek = members.filter((m) => {
    const t = new Date(m.subscribed_at).getTime();
    return !Number.isNaN(t) && Date.now() - t < 7 * 24 * 60 * 60 * 1000;
  }).length;

  // ===== Image upload =====
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError(null);

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setImageError("Only JPG, PNG, GIF, or WEBP images are allowed.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("Image must be 5MB or smaller.");
      e.target.value = "";
      return;
    }

    setUploadingImage(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `campaigns/${crypto.randomUUID()}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from("newsletter-images")
      .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });

    if (uploadErr) {
      console.error("Image upload failed:", uploadErr);
      setImageError(uploadErr.message || "Upload failed.");
      setUploadingImage(false);
      e.target.value = "";
      return;
    }
    const { data } = supabase.storage.from("newsletter-images").getPublicUrl(path);
    setImageUrl(data.publicUrl);
    setUploadingImage(false);
    e.target.value = "";
  };

  const removeImage = () => {
    setImageUrl("");
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ===== Rich text toolbar =====
  const wrapSelection = (before: string, after: string, placeholder = "") => {
    const ta = bodyRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = body.slice(start, end) || placeholder;
    const next = body.slice(0, start) + before + selected + after + body.slice(end);
    setBody(next);
    requestAnimationFrame(() => {
      ta.focus();
      const cursor = start + before.length + selected.length + after.length;
      ta.setSelectionRange(cursor, cursor);
    });
  };

  const insertAtLineStart = (prefix: string) => {
    const ta = bodyRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const lineStart = body.lastIndexOf("\n", start - 1) + 1;
    const next = body.slice(0, lineStart) + prefix + body.slice(lineStart);
    setBody(next);
    requestAnimationFrame(() => {
      ta.focus();
      const cursor = start + prefix.length;
      ta.setSelectionRange(cursor, cursor);
    });
  };

  const handleBold = () => wrapSelection("<strong>", "</strong>", "bold text");
  const handleItalic = () => wrapSelection("<em>", "</em>", "italic text");
  const handleHeading = () => wrapSelection("<h2>", "</h2>", "Heading");
  const handleList = () => insertAtLineStart("• ");
  const handleLink = () => {
    const url = window.prompt("Enter URL (https://…)");
    if (!url) return;
    wrapSelection(`<a href="${url}">`, "</a>", "link text");
  };

  // ===== Validation =====
  const validate = (): string | null => {
    if (!campaignName.trim()) return "Campaign name is required.";
    if (!subject.trim()) return "Subject line is required.";
    if (!body.trim() || body.trim().length < 5) return "Message body is required.";
    return null;
  };

  // ===== Submit handlers =====
  const submit = async (draft: boolean) => {
    setResult(null);
    const v = validate();
    if (v) {
      setResult({ kind: "error", message: v });
      return;
    }
    setSending(draft ? "draft" : "send");
    const { data, error } = await supabase.functions.invoke("send-mailchimp-campaign", {
      body: {
        campaignName: campaignName.trim(),
        subject: subject.trim(),
        previewText: previewText.trim(),
        body,
        draft,
        imageUrl: imageUrl || undefined,
      },
    });
    setSending(null);
    if (error) {
      setResult({ kind: "error", message: error.message || "Request failed." });
      return;
    }
    if ((data as { error?: string })?.error) {
      setResult({ kind: "error", message: (data as { error: string }).error });
      return;
    }
    if ((data as { success?: boolean })?.success) {
      setResult({
        kind: "success",
        message: draft
          ? "Draft saved in Mailchimp. Open Mailchimp to review and send."
          : "Campaign sent successfully! Check Mailchimp for delivery stats.",
      });
      if (!draft) {
        setCampaignName("");
        setSubject("");
        setPreviewText("");
        setBody("");
        removeImage();
      }
      fetchCampaigns();
    }
  };

  const sendTest = async () => {
    setResult(null);
    const v = validate();
    if (v) {
      setResult({ kind: "error", message: v });
      return;
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(testEmailAddress.trim())) {
      setResult({ kind: "error", message: "Enter a valid test email address." });
      return;
    }
    setSendingTest(true);
    const { data, error } = await supabase.functions.invoke("send-mailchimp-campaign", {
      body: {
        campaignName: campaignName.trim(),
        subject: subject.trim(),
        previewText: previewText.trim(),
        body,
        draft: false,
        testEmail: true,
        testEmailAddress: testEmailAddress.trim(),
        imageUrl: imageUrl || undefined,
      },
    });
    setSendingTest(false);
    if (error) {
      setResult({ kind: "error", message: error.message || "Request failed." });
      return;
    }
    if ((data as { error?: string })?.error) {
      setResult({ kind: "error", message: (data as { error: string }).error });
      return;
    }
    if ((data as { success?: boolean })?.success) {
      setResult({
        kind: "success",
        message: `Test email sent to ${testEmailAddress.trim()}!`,
      });
      fetchCampaigns();
    }
  };

  const handleSendClick = () => {
    setResult(null);
    const v = validate();
    if (v) {
      setResult({ kind: "error", message: v });
      return;
    }
    setConfirmOpen(true);
  };

  const confirmSend = async () => {
    setConfirmOpen(false);
    await submit(false);
  };

  // ===== Helpers =====
  const formatDate = (iso: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
  };

  const statusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "sent") return "bg-teal text-teal-foreground";
    if (s === "sending" || s === "schedule" || s === "scheduled")
      return "bg-amber-100 text-amber-800";
    if (s === "draft" || s === "save") return "bg-slate-200 text-slate-700";
    return "bg-blue-100 text-blue-800";
  };

  const mailchimpCampaignUrl = (c: Campaign) =>
    c.webId
      ? `https://admin.mailchimp.com/campaigns/show/?id=${c.webId}`
      : "https://admin.mailchimp.com/campaigns/";

  const refreshBtn = (loading: boolean, onClick: () => void) => (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
      Refresh
    </button>
  );

  return (
    <div>
      <AdminPageHeader
        title="Newsletter"
        breadcrumb="Newsletter"
        subtitle="View subscribers and send email campaigns directly through Mailchimp."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* ===== LEFT: Subscribers + Campaign history ===== */}
        <section className="space-y-6">
          <div>
            <SectionHeading
              icon={<Users className="h-5 w-5 text-teal" />}
              action={refreshBtn(loadingList, fetchSubs)}
            >
              Subscribers
            </SectionHeading>

            {/* Stat card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-teal-soft flex items-center justify-center text-teal shrink-0">
                <Users className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-500">Total Subscribers</p>
                <p className="font-heading text-3xl font-bold text-slate-900 leading-tight">
                  {loadingList && total === null ? "—" : total ?? 0}
                </p>
                {newThisWeek > 0 && (
                  <p className="mt-0.5 text-xs font-semibold text-teal inline-flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />↑ {newThisWeek} new this week
                  </p>
                )}
              </div>
            </div>

            {/* Subscriber list */}
            <div className="mt-4 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                10 most recent
              </div>
              {listError ? (
                <div className="p-4 text-sm text-red-600">{listError}</div>
              ) : loadingList ? (
                <div className="p-6 flex items-center justify-center text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
                </div>
              ) : members.length === 0 ? (
                <div className="p-6 text-sm text-slate-500 text-center">No subscribers yet.</div>
              ) : (
                <ul>
                  {members.map((m, i) => (
                    <li
                      key={`${m.email}-${i}`}
                      className={`flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-teal-soft/40 ${
                        i % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                      }`}
                    >
                      <span className="truncate font-medium text-slate-900">{m.email}</span>
                      <span className="shrink-0 text-xs text-slate-500">
                        {formatDate(m.subscribed_at)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <a
              href="https://mailchimp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center justify-center gap-2 w-full h-11 rounded-lg border-2 border-teal text-teal font-semibold hover:bg-teal hover:text-teal-foreground transition-colors"
            >
              Open Mailchimp Dashboard
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {/* ===== Recent Campaigns ===== */}
          <div>
            <SectionHeading
              icon={<History className="h-5 w-5 text-teal" />}
              action={refreshBtn(loadingCampaigns, fetchCampaigns)}
            >
              Recent Campaigns
            </SectionHeading>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              {campaignsError ? (
                <div className="p-4 text-sm text-red-600">{campaignsError}</div>
              ) : loadingCampaigns ? (
                <div className="p-6 flex items-center justify-center text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
                </div>
              ) : campaigns.length === 0 ? (
                <div className="p-6 text-sm text-slate-500 text-center">No campaigns yet.</div>
              ) : (
                <ul>
                  {campaigns.map((c, i) => {
                    const dateIso = c.sendTime || c.createTime;
                    return (
                      <li
                        key={c.id}
                        className={`px-4 py-3 text-sm transition-colors hover:bg-teal-soft/40 ${
                          i % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-900 truncate">{c.subject}</p>
                            <div className="mt-1 flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${statusBadge(
                                  c.status,
                                )}`}
                              >
                                {c.status.toLowerCase()}
                              </span>
                              <span>{formatDate(dateIso)}</span>
                              {c.emailsSent > 0 && (
                                <span>{c.emailsSent.toLocaleString()} sent</span>
                              )}
                            </div>
                          </div>
                          <a
                            href={mailchimpCampaignUrl(c)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-teal hover:underline"
                          >
                            View in Mailchimp <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* ===== RIGHT: Compose ===== */}
        <section className="space-y-4">
          <SectionHeading icon={<Mail className="h-5 w-5 text-teal" />}>
            Send Newsletter Campaign
          </SectionHeading>

          {result && (
            <div
              className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
                result.kind === "success"
                  ? "bg-teal-soft border-teal/30 text-teal"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {result.kind === "success" ? (
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              )}
              <div>
                <p>{result.message}</p>
                {result.kind === "success" && (
                  <a
                    href="https://mailchimp.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-semibold"
                  >
                    Open Mailchimp →
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
            <div>
              <label className={labelCls}>Campaign Name</label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g. April 2026 Update"
                className={inputCls}
              />
              <p className="text-xs text-slate-500 mt-1">
                Internal name (not shown to subscribers)
              </p>
            </div>

            <div>
              <label className={labelCls}>Email Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What subscribers see in their inbox"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>
                Preview Text <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                placeholder="Inbox preview/subtitle"
                className={inputCls}
              />
            </div>

            {/* Message body with toolbar */}
            <div>
              <label className={labelCls}>Message Body</label>
              <div className="flex flex-wrap items-center gap-1 p-1.5 border border-slate-200 border-b-0 rounded-t-lg bg-slate-50">
                <ToolbarBtn label="Bold" onClick={handleBold}>
                  <Bold className="h-4 w-4" />
                </ToolbarBtn>
                <ToolbarBtn label="Italic" onClick={handleItalic}>
                  <Italic className="h-4 w-4" />
                </ToolbarBtn>
                <ToolbarBtn label="Heading" onClick={handleHeading}>
                  <Heading2 className="h-4 w-4" />
                </ToolbarBtn>
                <ToolbarBtn label="Bullet" onClick={handleList}>
                  <List className="h-4 w-4" />
                </ToolbarBtn>
                <ToolbarBtn label="Link" onClick={handleLink}>
                  <LinkIcon className="h-4 w-4" />
                </ToolbarBtn>
              </div>
              <textarea
                ref={bodyRef}
                rows={10}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your newsletter message here. Line breaks are preserved. Toolbar inserts simple HTML tags."
                className="w-full border border-slate-200 rounded-b-lg p-3 font-sans text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal"
              />
              <p className="text-xs text-slate-500 mt-1">
                Wrapped automatically in a clean MESA-KU email template.
              </p>
            </div>

            {/* Image / poster upload */}
            <div>
              <label className={labelCls}>Attach Image / Poster</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
              {!imageUrl ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="inline-flex items-center gap-2 h-11 px-4 rounded-lg border-2 border-dashed border-teal text-teal text-sm font-semibold hover:bg-teal-soft disabled:opacity-60 transition-colors"
                >
                  {uploadingImage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploadingImage ? "Uploading…" : "Upload Image"}
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="rounded-lg border border-slate-200 p-2 bg-slate-50 flex items-center justify-center">
                    <img
                      src={imageUrl}
                      alt="Newsletter preview"
                      className="max-h-[200px] w-auto object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <XIcon className="h-4 w-4" /> Remove
                  </button>
                </div>
              )}
              <p className="text-xs text-slate-500 mt-1">
                JPG, PNG, GIF, WEBP — max 5MB. Appears below the header in the email.
              </p>
              {imageError && <p className="text-xs text-red-600 mt-1">{imageError}</p>}
            </div>

            <div>
              <label className={labelCls}>Send To</label>
              <select disabled className={`${inputCls} opacity-70`}>
                <option>All Subscribers</option>
              </select>
            </div>

            {/* Test send row */}
            <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/60 space-y-2">
              <label className={labelCls}>Test Email Address</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  placeholder="you@example.com"
                  className={`${inputCls} flex-1`}
                />
                <button
                  type="button"
                  onClick={sendTest}
                  disabled={sendingTest || sending !== null}
                  className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-lg border-2 border-teal text-teal text-sm font-semibold hover:bg-teal hover:text-teal-foreground transition-colors disabled:opacity-60"
                >
                  {sendingTest ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <TestTube2 className="h-4 w-4" />
                  )}
                  {sendingTest ? "Sending…" : "Send Test Email"}
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Sends a preview to this address only — not to all subscribers.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleSendClick}
                disabled={sending !== null || sendingTest}
                className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-lg bg-teal text-teal-foreground font-bold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {sending === "send" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
                {sending === "send" ? "Sending…" : "Send Campaign"}
              </button>

              <button
                type="button"
                onClick={() => submit(true)}
                disabled={sending !== null || sendingTest}
                className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-lg border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors disabled:opacity-60"
              >
                {sending === "draft" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                {sending === "draft" ? "Saving…" : "Save as Draft in Mailchimp"}
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ===== Confirm send modal ===== */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-slate-900">Confirm Campaign Send</DialogTitle>
            <DialogDescription>
              You are about to send <strong>{campaignName || "this campaign"}</strong> to all
              subscribers. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-teal/30 bg-teal-soft p-3 text-sm text-teal">
            <strong>{total ?? 0}</strong> subscriber{(total ?? 0) === 1 ? "" : "s"} will receive
            this email.
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="h-11 px-5 rounded-lg border-2 border-slate-200 font-semibold text-sm text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmSend}
              className="h-11 px-5 rounded-lg bg-teal text-teal-foreground font-bold text-sm hover:opacity-90"
            >
              Yes, Send Now
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ToolbarBtn({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          onClick={onClick}
          className="h-8 w-8 inline-flex items-center justify-center rounded-md text-slate-700 hover:bg-white hover:text-teal transition-colors"
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
