import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useInView } from "@/hooks/useInView";

const StayInTheLoopSection = () => {
  const { ref, inView } = useInView();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const { data, error } = await supabase.functions.invoke("subscribe-mailchimp", {
        body: { email },
      });

      if (error) {
        // Try to extract server-provided message
        const ctx: any = (error as any).context;
        let serverMsg = "";
        try {
          const json = await ctx?.json?.();
          serverMsg = json?.error || "";
        } catch {
          // ignore
        }
        setStatus("error");
        setMessage(serverMsg || error.message || "Subscription failed. Please try again.");
        return;
      }

      if ((data as any)?.success) {
        setStatus("success");
        setMessage("You're subscribed! Check your inbox soon. 🎉");
        setEmail("");
      } else {
        setStatus("error");
        setMessage((data as any)?.error || "Subscription failed. Please try again.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <section
      id="stay-in-the-loop"
      ref={ref}
      className="relative py-20 md:py-28 bg-accent overflow-hidden"
    >
      {/* Decorative gold accent */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

      <div
        className={`relative z-10 max-w-3xl mx-auto px-4 md:px-8 text-center ${
          inView ? "animate-fade-in-up" : "opacity-0"
        }`}
      >
        <p className="uppercase tracking-[4px] text-primary text-xs font-semibold mb-4">
          Newsletter
        </p>
        <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
          Stay in the Loop
        </h2>
        <p className="text-primary-foreground/80 text-base md:text-lg max-w-xl mx-auto mb-10">
          Get MESA KU updates, events and news delivered to your inbox.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
        >
          <label htmlFor="loop-email" className="sr-only">
            Email address
          </label>
          <input
            id="loop-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status !== "loading") {
                setStatus("idle");
                setMessage("");
              }
            }}
            disabled={status === "loading"}
            className="flex-1 px-4 h-12 rounded-md bg-primary-foreground/10 border border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/40 transition-all text-base disabled:opacity-60"
            required
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 h-12 rounded-md font-semibold text-base hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Subscribing…
              </>
            ) : (
              "Subscribe"
            )}
          </button>
        </form>

        {/* Status messages */}
        <div className="mt-4 min-h-[24px]" aria-live="polite">
          {status === "success" && (
            <p className="inline-flex items-center gap-2 text-primary text-sm font-medium">
              <CheckCircle2 size={16} />
              {message}
            </p>
          )}
          {status === "error" && (
            <p className="inline-flex items-center gap-2 text-destructive-foreground bg-destructive/80 px-3 py-1 rounded-md text-sm font-medium">
              <AlertCircle size={16} />
              {message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default StayInTheLoopSection;
