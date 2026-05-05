import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useKidVolt } from "@/hooks/useKidVolt";
import { useState, useRef } from "react";
import { playSound } from "@/lib/utils";

export const Route = createFileRoute("/kid/tasks")({
  component: TasksPage,
});

function TasksPage() {
  const { state, update } = useKidVolt();
  const nav = useNavigate();

  if (!state.activeChildId) {
    nav({ to: "/kid" });
    return null;
  }

  const child = state.children.find((c) => c.id === state.activeChildId);
  if (!child) return null;

  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submitWithPhoto = (id: string) =>
    update((s) => ({
      ...s,
      children: s.children.map((c) =>
        c.id === child.id
          ? {
              ...c,
              tasks: c.tasks.map((t) =>
                t.id === id
                  ? { ...t, status: "submitted", photoUrl: photoPreview || undefined }
                  : t,
              ),
              activity: [
                {
                  id: crypto.randomUUID(),
                  ts: Date.now(),
                  text: `📸 Uploaded photo proof for task`,
                },
                ...c.activity,
              ].slice(0, 30),
            }
          : c,
      ),
    }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const open = child.tasks.filter((t) => t.status === "open");
  const submitted = child.tasks.filter((t) => t.status === "submitted");
  const done = child.tasks.filter((t) => t.status === "approved");

  return (
    <div className="max-w-md mx-auto px-5 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">✅ Tasks</h1>
        <Link to="/kid" className="text-sm text-muted-foreground">
          ← Home
        </Link>
      </div>
      <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1">
        Earn ₹ AND recharge{" "}
        <img src="/kidvolt-logo.png" alt="Energy" className="w-4 h-4 inline-block" />
      </p>

      <Group title="🎯 To do" empty="No tasks. Ask parent to add some!">
        {open.map((t) => (
          <Card key={t.id} t={t}>
            <button
              onClick={() => setVerifyingTaskId(t.id)}
              className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-bold shadow-soft active:scale-95 transition flex items-center gap-2"
            >
              <span>I did it!</span>
              <span className="text-lg">📸</span>
            </button>
          </Card>
        ))}
      </Group>

      {submitted.length > 0 && (
        <Group title="⏳ Waiting for parent">
          {submitted.map((t) => (
            <Card key={t.id} t={t}>
              <span className="text-xs text-warning-foreground bg-warning/30 px-3 py-1.5 rounded-full font-bold">
                Pending
              </span>
            </Card>
          ))}
        </Group>
      )}

      {done.length > 0 && (
        <Group title="🏆 Completed">
          {done.map((t) => (
            <Card key={t.id} t={t} dim>
              <span className="text-xs text-success font-bold">✓ Done</span>
            </Card>
          ))}
        </Group>
      )}

      {verifyingTaskId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-5 animate-in fade-in">
          <div className="bg-card w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-bold text-xl">Photo Proof</h3>
                <p className="text-sm text-muted-foreground">Snap a pic to prove you finished!</p>
              </div>
              <button
                onClick={() => {
                  setVerifyingTaskId(null);
                  setPhotoPreview(null);
                }}
                className="w-8 h-8 bg-muted rounded-full flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />

            {photoPreview ? (
              <div className="mb-6 rounded-2xl overflow-hidden relative">
                <img src={photoPreview} alt="Proof" className="w-full aspect-square object-cover" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-4 right-4 bg-black/50 backdrop-blur text-white px-3 py-1.5 rounded-full text-xs font-bold"
                >
                  Retake
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-square border-4 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 mb-6 bg-muted/30 hover:bg-muted/50 transition text-muted-foreground"
              >
                <div className="text-6xl">📸</div>
                <div className="font-bold text-lg">Tap to open Camera</div>
              </button>
            )}

            <button
              disabled={!photoPreview}
              onClick={() => {
                submitWithPhoto(verifyingTaskId);
                playSound("pop");
                setVerifyingTaskId(null);
                setPhotoPreview(null);
              }}
              className="w-full bg-primary text-primary-foreground font-bold text-lg py-4 rounded-2xl disabled:opacity-50 active:scale-95 transition-transform"
            >
              Send to Parent 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Group({
  title,
  empty,
  children,
}: {
  title: string;
  empty?: string;
  children: React.ReactNode;
}) {
  const arr = Array.isArray(children) ? children : [children];
  const hasItems = arr.filter(Boolean).length > 0;
  return (
    <section className="mt-6">
      <h2 className="font-bold mb-2">{title}</h2>
      {hasItems ? (
        <ul className="space-y-2">{children}</ul>
      ) : (
        <p className="text-sm text-muted-foreground">{empty}</p>
      )}
    </section>
  );
}

function Card({ t, children, dim }: { t: any; children: React.ReactNode; dim?: boolean }) {
  return (
    <li
      className={`flex items-center gap-3 bg-card border rounded-2xl p-3 shadow-soft ${dim ? "opacity-60" : ""}`}
    >
      <div className="text-3xl">{t.emoji}</div>
      <div className="flex-1">
        <div className="font-bold">{t.title}</div>
        <div className="text-xs text-muted-foreground">
          +₹{t.reward} · +{t.xp}⚡
        </div>
      </div>
      {children}
    </li>
  );
}
