import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw, ExternalLink, Send, Save, Users, CheckCircle2, AlertCircle } from "lucide-react";

type Member = { email: string; subscribed_at: string };

export default function AdminNewsletter() {
  const [total, setTotal] = useState<number | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [campaignName, setCampaignName] = useState("");
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState<"send" | "draft" | null>(null);
  const [result, setResult] = useState<{ kind: "success" | "error"; message: string } | null>(null);

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

  useEffect(() => {
    fetchSubs();
  }, []);

  const validate = (): string | null => {
    if (!campaignName.trim()) return "Campaign name is required.";
    if (!subject.trim()) return "Subject line is required.";
    if (!body.trim() || body.trim().length < 5) return "Message body is required.";
    return null;
  };

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
      }
    }
  };

  const formatDate = (iso: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div>
      <h1 className="font-heading text-xl md:text-2xl font-bold text-[#1E3A8A] mb-4 md:mb-6">
        Newsletter
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ===== LEFT: Subscribers ===== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-lg md:text-xl font-bold text-[#1E3A8A]">
              Subscribers
            </h2>
            <button
              onClick={fetchSubs}
              disabled={loadingList}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              {loadingList ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </button>
          </div>

          {/* Stat card */}
          <div
            className="rounded-xl p-5 flex items-center gap-4 border"
            style={{ backgroundColor: "#FFF8E1", borderColor: "#F1D78A" }}
          >
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#D4A017" }}
            >
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#7a5a00]">Total Subscribers</p>
              <p className="font-heading text-3xl font-bold text-[#1E3A8A]">
                {loadingList && total === null ? "—" : total ?? 0}
              </p>
            </div>
          </div>

          {/* List */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              10 most recent
            </div>
            {listError ? (
              <div className="p-4 text-sm text-red-600">{listError}</div>
            ) : loadingList ? (
              <div className="p-6 flex items-center justify-center text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
              </div>
            ) : members.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground text-center">
                No subscribers yet.
              </div>
            ) : (
              <ul className="divide-y">
                {members.map((m, i) => (
                  <li
                    key={`${m.email}-${i}`}
                    className={`flex items-center justify-between gap-3 px-4 py-3 text-sm ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <span className="truncate font-medium text-gray-900">{m.email}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
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
            className="inline-flex items-center justify-center gap-2 w-full h-11 rounded-md font-semibold text-white shadow-sm hover:opacity-90 transition"
            style={{ backgroundColor: "#D4A017" }}
          >
            Open Mailchimp Dashboard
            <ExternalLink className="h-4 w-4" />
          </a>
        </section>

        {/* ===== RIGHT: Compose ===== */}
        <section className="space-y-4">
          <h2 className="font-heading text-lg md:text-xl font-bold text-[#1E3A8A]">
            Send Newsletter Campaign
          </h2>

          {result && (
            <div
              className={`flex items-start gap-2 rounded-md border p-3 text-sm ${
                result.kind === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
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
                    className="underline font-medium"
                  >
                    Open Mailchimp →
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Campaign Name</label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g. April 2026 Update"
                className="w-full border border-input rounded-md h-10 px-3"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Internal name (not shown to subscribers)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What subscribers see in their inbox"
                className="w-full border border-input rounded-md h-10 px-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Preview Text <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                placeholder="Inbox preview/subtitle"
                className="w-full border border-input rounded-md h-10 px-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Message Body</label>
              <textarea
                rows={10}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your newsletter message here. Line breaks are preserved."
                className="w-full border border-input rounded-md p-3 font-sans text-sm leading-relaxed"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Wrapped automatically in a clean MESA KU email template.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Send To</label>
              <select
                disabled
                className="w-full border border-input rounded-md h-10 px-3 bg-background"
              >
                <option>All Subscribers</option>
              </select>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => submit(false)}
                disabled={sending !== null}
                className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-md font-bold text-white shadow-sm hover:opacity-90 transition disabled:opacity-60"
                style={{ backgroundColor: "#D4A017" }}
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
                disabled={sending !== null}
                className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-md font-semibold border-2 border-[#1E3A8A] text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white transition disabled:opacity-60"
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
    </div>
  );
}
