type SkillGroup = { skills: string[]; keywords: string[][] };

const SKILL_MAP: Record<string, SkillGroup> = {
  Core: {
    skills: ["TypeScript", "Next.js", "React", "Node.js"],
    keywords: [
      ["typescript", "ts "],
      ["next.js", "nextjs", "next js"],
      ["react", "reactjs", "react.js"],
      ["node.js", "nodejs", "node js"],
    ],
  },
  "Backend / DB": {
    skills: ["PostgreSQL", "Prisma", "REST API", "Supabase", "Django", "BigQuery"],
    keywords: [
      ["postgresql", "postgres"],
      ["prisma"],
      ["rest", "rest api", "api rest", "restful"],
      ["supabase"],
      ["django"],
      ["bigquery", "big query"],
    ],
  },
  Frontend: {
    skills: ["Tailwind CSS", "shadcn/ui", "Zustand", "Zod"],
    keywords: [
      ["tailwind"],
      ["shadcn"],
      ["zustand"],
      ["zod"],
    ],
  },
  "Infra / DevOps": {
    skills: ["Docker", "Docker Compose", "Vercel", "Cloudflare"],
    keywords: [
      ["docker"],
      ["docker-compose", "docker compose"],
      ["vercel"],
      ["cloudflare"],
    ],
  },
  Automatización: {
    skills: ["Playwright", "Web Scraping", "Google Apps Script"],
    keywords: [
      ["playwright", "puppeteer", "selenium"],
      ["scraping", "web scraping", "crawler"],
      ["apps script", "google apps script"],
    ],
  },
  Otros: {
    skills: ["Python", "Java", "C/C++", "Git", "Stripe"],
    keywords: [
      ["python"],
      ["java"],
      ["c++", "c/c++"],
      ["git", "github", "gitlab"],
      ["stripe"],
    ],
  },
};

export function matchSkills(jobText: string): Set<string> {
  const text = jobText.toLowerCase();
  const matched = new Set<string>();

  for (const group of Object.values(SKILL_MAP)) {
    for (let i = 0; i < group.skills.length; i++) {
      if (group.keywords[i].some((kw) => text.includes(kw))) {
        matched.add(group.skills[i]);
      }
    }
  }
  return matched;
}

function inferTitle(titulo: string): string {
  const t = titulo.toLowerCase();
  if (t.includes("fullstack") || t.includes("full stack") || t.includes("full-stack"))
    return "Fullstack Developer · Next.js · TypeScript";
  if (t.includes("frontend") || t.includes("front-end") || t.includes("front end"))
    return "Frontend Developer · React · Next.js";
  if (t.includes("backend") || t.includes("back-end") || t.includes("back end"))
    return "Backend Developer · Node.js · TypeScript";
  if (t.includes("data") && t.includes("engineer"))
    return "Data Engineer · BigQuery · Python";
  if (t.includes("devops") || t.includes("sre") || t.includes("infraestructura"))
    return "DevOps Engineer · Docker · Cloudflare";
  if (t.includes("intern") || t.includes("becario") || t.includes("practicante"))
    return `Intern Software Engineer · ${titulo.slice(0, 40)}`;
  return titulo.slice(0, 70);
}

export function generateCV(
  templateHtml: string,
  job: { titulo: string; descripcion: string }
): string {
  const jobText = `${job.titulo} ${job.descripcion}`;
  const matched = matchSkills(jobText);

  let html = templateHtml;

  // Actualizar título del CV según el rol
  html = html.replace(
    /<div class="title-tag">[\s\S]*?<\/div>/,
    `<div class="title-tag">${inferTitle(job.titulo)}</div>`
  );

  // Marcar skills que hacen match como "hot" (negra), el resto normal
  html = html.replace(
    /<span class="tag(?: hot)?">([\s\S]*?)<\/span>/g,
    (_match, skillText: string) => {
      const skill = skillText.trim();
      const isHot = matched.has(skill);
      return `<span class="tag${isHot ? " hot" : ""}">${skill}</span>`;
    }
  );

  return html;
}
