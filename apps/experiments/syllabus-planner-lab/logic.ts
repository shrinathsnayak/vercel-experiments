export const MAX_SYLLABUS_CHARS = 14_000;
export const MAX_WEEKS = 16;

export type StudyWeek = {
  week: number;
  focus: string;
  topics: string[];
  tasks: string[];
  estimatedHours: number;
};

export type StudyPlan = {
  courseTitle: string;
  weeks: StudyWeek[];
  tips: string[];
};

export function truncateText(text: string, max = MAX_SYLLABUS_CHARS): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function clampPlan(plan: StudyPlan): StudyPlan {
  return {
    courseTitle: plan.courseTitle.trim() || 'Course',
    tips: plan.tips.map((t) => t.trim()).filter(Boolean).slice(0, 8),
    weeks: plan.weeks.slice(0, MAX_WEEKS).map((w, i) => ({
      week: Number.isFinite(w.week) ? w.week : i + 1,
      focus: w.focus.trim(),
      topics: w.topics.map((t) => t.trim()).filter(Boolean).slice(0, 8),
      tasks: w.tasks.map((t) => t.trim()).filter(Boolean).slice(0, 8),
      estimatedHours: Math.max(0, Math.min(40, w.estimatedHours)),
    })),
  };
}

export function downloadJson(filename: string, data: unknown) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const SAMPLE_SYLLABUS = `CS 240 - Web Platforms (8 weeks)
Week 1–2: HTTP, caching, CDN basics. Quiz 1.
Week 3–4: Serverless functions, Route Handlers, env vars. Project 1 due week 4.
Week 5–6: Databases (Postgres), migrations, connection pooling. Midterm week 6.
Week 7: Auth patterns, rate limiting, security headers.
Week 8: Capstone: deploy a full-stack demo; final presentation.
Readings: MDN HTTP, Vercel docs (ISR, Edge), Postgres tutorial.`;
