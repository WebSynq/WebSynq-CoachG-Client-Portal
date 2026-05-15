import { MODULES } from "@/content/modules";
import { getAllOverrides } from "@/lib/content";
import LessonOverrideEditor from "@/components/admin/LessonOverrideEditor";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const overrides = await getAllOverrides();

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-danger">Control Room · Content</p>
        <h1 className="mt-2 font-display text-4xl tracking-wide text-white">Content Manager</h1>
        <p className="mt-2 text-sm text-white/60">
          Swap a lesson&apos;s video by pasting a Loom / YouTube / Vimeo / Cloudinary URL,
          or upload a video file directly. Overrides take effect immediately for all clients.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        {MODULES.map((mod, mIdx) => (
          <section key={mod.id} className="rounded-sm border border-white/5 bg-surface overflow-hidden" data-testid={`module-section-${mod.id}`}>
            <div className="flex items-center justify-between gap-4 bg-card px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-4">
                <span className="font-display text-3xl text-gold/30 leading-none">{String(mIdx + 1).padStart(2, "0")}</span>
                <div>
                  <h2 className="font-display text-xl tracking-wide text-white">{mod.title}</h2>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                    {mod.tier} · {mod.lessons.length} plays
                  </p>
                </div>
              </div>
            </div>
            <ul className="divide-y divide-white/5">
              {mod.lessons.map((lesson) => {
                const override = overrides[lesson.id];
                return (
                  <li key={lesson.id} className="p-5">
                    <LessonOverrideEditor
                      lessonId={lesson.id}
                      defaultTitle={lesson.title}
                      defaultDescription={lesson.description}
                      defaultVideoUrl={lesson.loomUrl}
                      overrideTitle={override?.title ?? null}
                      overrideDescription={override?.description ?? null}
                      overrideVideoUrl={override?.video_url ?? null}
                    />
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
