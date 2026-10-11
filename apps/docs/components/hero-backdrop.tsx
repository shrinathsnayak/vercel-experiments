/** Soft brand ambient field behind the homepage hero. */
export function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgb(0_112_243_/_0.16),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgb(0_112_243_/_0.08),transparent_55%)]" />

      <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(to_right,rgb(0_112_243_/_0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgb(0_112_243_/_0.1)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgb(0_112_243_/_0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgb(0_112_243_/_0.06)_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_65%)]" />

      <div className="absolute inset-x-0 top-[72%] h-px bg-gradient-to-r from-transparent via-[rgb(0_112_243_/_0.4)] to-transparent opacity-70" />
      <div className="absolute inset-x-[18%] top-[72%] h-24 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgb(0_112_243_/_0.14),transparent_70%)] blur-md" />

      <div className="absolute -left-24 top-[-10%] size-[28rem] animate-[hero-orb_18s_linear_infinite] rounded-full bg-[radial-gradient(circle,rgb(0_112_243_/_0.22),transparent_65%)] blur-2xl motion-reduce:animate-none" />
      <div className="absolute -right-16 top-1/4 size-[22rem] animate-[hero-orb_22s_linear_infinite_reverse] rounded-full bg-[radial-gradient(circle,rgb(0_112_243_/_0.16),transparent_65%)] blur-2xl motion-reduce:animate-none" />
      <div className="absolute bottom-[-20%] left-1/3 size-[20rem] animate-[hero-orb_14s_linear_infinite] rounded-full bg-[radial-gradient(circle,rgb(0_112_243_/_0.12),transparent_70%)] blur-xl motion-reduce:animate-none" />

      <div className="absolute left-1/2 top-[38%] size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgb(0_112_243_/_0.14)] opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
      <div className="absolute left-1/2 top-[38%] size-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[rgb(0_112_243_/_0.12)] opacity-35 [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />

      <span className="absolute top-[28%] left-[12%] size-1.5 animate-[hero-spark_4.2s_ease-in-out_infinite] rounded-full bg-brand shadow-[0_0_8px_rgb(0_112_243_/_0.55)] motion-reduce:animate-none" />
      <span className="absolute top-[62%] left-[22%] size-1 animate-[hero-spark_5.1s_ease-in-out_0.8s_infinite] rounded-full bg-brand shadow-[0_0_8px_rgb(0_112_243_/_0.55)] motion-reduce:animate-none" />
      <span className="absolute top-[18%] left-[38%] size-1.5 animate-[hero-spark_3.8s_ease-in-out_1.4s_infinite] rounded-full bg-brand shadow-[0_0_8px_rgb(0_112_243_/_0.55)] motion-reduce:animate-none" />
      <span className="absolute top-[34%] left-[58%] size-1 animate-[hero-spark_4.6s_ease-in-out_0.3s_infinite] rounded-full bg-brand shadow-[0_0_8px_rgb(0_112_243_/_0.55)] motion-reduce:animate-none" />
      <span className="absolute top-[22%] left-[72%] size-1.5 animate-[hero-spark_5.4s_ease-in-out_1.1s_infinite] rounded-full bg-brand shadow-[0_0_8px_rgb(0_112_243_/_0.55)] motion-reduce:animate-none" />
      <span className="absolute top-[48%] left-[84%] size-1 animate-[hero-spark_3.6s_ease-in-out_1.8s_infinite] rounded-full bg-brand shadow-[0_0_8px_rgb(0_112_243_/_0.55)] motion-reduce:animate-none" />
    </div>
  );
}
