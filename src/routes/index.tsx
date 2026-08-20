import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Activity, ArrowUp, Info, Lock, Mail, ShieldCheck, User } from "lucide-react";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Health Acknowledge — Calm medical AI guidance" },
      {
        name: "description",
        content:
          "Health Acknowledge pairs a secure patient sign-in with an empathetic medical AI chat board for symptom guidance.",
      },
      { property: "og:title", content: "Health Acknowledge — Calm medical AI guidance" },
      {
        property: "og:description",
        content:
          "Sign in and describe your symptoms. Health Acknowledge responds with clear, calm, disclaimer-backed guidance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Message = { role: "user" | "assistant"; content: string };

const INITIAL: Message[] = [
  {
    role: "assistant",
    content:
      "Hello, I'm Health Acknowledge. Tell me what you're feeling today and I'll help you understand it.",
  },
  {
    role: "user",
    content: "I've had a fever of 38.6°C since last night, with chills and a mild headache.",
  },
  {
    role: "assistant",
    content:
      "Thank you for sharing that. A 38.6°C fever with chills often points to a viral infection your body is already fighting.\n\n• Rest and drink fluids steadily\n• Track your temperature every 4 hours\n• Seek urgent care if it passes 39.4°C, lasts over 3 days, or comes with a stiff neck, rash, or breathing trouble\n\nAre you noticing a cough or sore throat alongside it?",
  },
];

function Disclaimer() {
  return (
    <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-note px-3 py-2 text-[11px] leading-relaxed text-amber-note-foreground">
      <Info className="mt-px size-3.5 shrink-0" />
      <span>
        AI guidance only — not a medical diagnosis. Consult a licensed clinician for care decisions.
      </span>
    </div>
  );
}

function Index() {
  const [signedIn, setSignedIn] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [messages, setMessages] = useState<Message[]>(INITIAL);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(
          res.status === 429
            ? "Too many requests right now — please try again in a moment."
            : res.status === 402
              ? "AI credits are exhausted for this workspace."
              : body || "The assistant is unavailable.",
        );
      }
      const data = (await res.json()) as { reply?: string };
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.reply || "I couldn't form a response. Please rephrase." },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-soft-gradient">
      <div className="mx-auto grid min-h-screen max-w-[1500px] gap-8 p-5 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:p-10">
        {/* Left: auth panel */}
        <section className="flex flex-col justify-between rounded-4xl bg-card p-8 shadow-soft lg:p-10">
          <div>
            <div className="flex items-center gap-3">
              <img src={logo} alt="Health Acknowledge" width={40} height={40} className="size-10" />
              <span className="text-lg font-extrabold tracking-tight">Health Acknowledge</span>
            </div>

            <h1 className="mt-12 text-4xl leading-[1.1] font-extrabold tracking-tight text-balance">
              Calm answers for the symptoms you're worried about.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Sign in to start a private conversation with our clinical AI companion. Every response
              is reviewed against safety guidelines and carries a medical disclaimer.
            </p>

            <form
              className="mt-10 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setSignedIn(true);
              }}
            >
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">Full name</span>
                <div className="mt-2 flex items-center gap-3 rounded-2xl bg-input/60 px-4 py-3.5 transition-colors focus-within:bg-card focus-within:ring-2 focus-within:ring-ring/60">
                  <User className="size-4 text-muted-foreground" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Amara Whitfield"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">Email address</span>
                <div className="mt-2 flex items-center gap-3 rounded-2xl bg-input/60 px-4 py-3.5 transition-colors focus-within:bg-card focus-within:ring-2 focus-within:ring-ring/60">
                  <Mail className="size-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
                  />
                </div>
              </label>

              <button
                type="submit"
                className="w-full rounded-2xl bg-hero-gradient px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
              >
                {signedIn ? "Signed in — continue" : "Sign in / Create account"}
              </button>
              <p className="text-center text-xs text-muted-foreground">
                {signedIn
                  ? `Welcome${name ? `, ${name.split(" ")[0]}` : ""} — your session is live.`
                  : "No password needed for this concept preview."}
              </p>
            </form>
          </div>

          <div className="mt-10 flex items-center gap-2 rounded-2xl bg-mint px-4 py-3 text-xs text-mint-foreground">
            <ShieldCheck className="size-4 shrink-0" />
            End-to-end encrypted · HIPAA-aligned handling
          </div>
        </section>

        {/* Right: chat board */}
        <section className="flex min-h-[70vh] flex-col overflow-hidden rounded-4xl bg-card shadow-soft">
          <header className="flex items-center justify-between gap-4 border-b border-border bg-hero-gradient px-7 py-5 text-primary-foreground">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-primary-foreground/15">
                <Activity className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold">AI Chat Board</p>
                <p className="text-xs opacity-80">Symptom triage · online now</p>
              </div>
            </div>
            <span className="hidden items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1.5 text-xs font-medium sm:flex">
              <Lock className="size-3.5" /> Private session
            </span>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-5 py-7 sm:px-8">
            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[78%] rounded-3xl rounded-br-lg bg-teal px-5 py-3.5 text-sm leading-relaxed whitespace-pre-line text-teal-foreground">
                    {m.content}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex justify-start">
                  <div className="max-w-[82%]">
                    <div className="rounded-3xl rounded-bl-lg bg-mint px-5 py-4 text-sm leading-relaxed whitespace-pre-line text-mint-foreground">
                      {m.content}
                    </div>
                    <Disclaimer />
                  </div>
                </div>
              ),
            )}

            {loading && (
              <div className="flex items-center gap-1.5 rounded-3xl rounded-bl-lg bg-mint px-5 py-4 text-mint-foreground w-fit">
                {[0, 150, 300].map((d) => (
                  <span
                    key={d}
                    className="size-2 animate-bounce rounded-full bg-primary/60"
                    style={{ animationDelay: `${d}ms` }}
                  />
                ))}
              </div>
            )}

            {error && (
              <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-xs text-destructive">
                {error}
              </p>
            )}
          </div>

          <form onSubmit={send} className="border-t border-border px-5 py-5 sm:px-8">
            <div className="flex items-end gap-3 rounded-3xl bg-input/60 p-2 pl-5 transition-colors focus-within:bg-secondary">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) send(e as unknown as React.FormEvent);
                }}
                placeholder="Describe your symptoms…"
                className="max-h-32 min-h-10 w-full resize-none bg-transparent py-2.5 text-sm outline-none placeholder:text-muted-foreground/70"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Send message"
                className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-hero-gradient text-primary-foreground transition-opacity disabled:opacity-40"
              >
                <ArrowUp className="size-5" />
              </button>
            </div>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              In an emergency, call your local emergency number instead of using this chat.
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
