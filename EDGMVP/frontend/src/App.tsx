import { ArrowUpRight, FileCode2, ShieldCheck, Sparkles } from "lucide-react";
import { Wizard } from "./components/wizard/Wizard";

export default function App() {
  return (
    <div className="min-h-screen bg-cream-50 font-sans text-ink antialiased">
      <Header />
      <main>
        <Hero />
        <FeatureBand />
        <Workflow />
        <Generator />
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-cream-50/85 backdrop-blur">
      <nav className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-3.5 md:px-8">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-ink text-cream-50">
            <span className="font-mono text-[12px] font-bold tracking-tight">HZ</span>
          </div>
          <div className="leading-none">
            <p className="text-[15px] font-bold tracking-tight">Hazard Zero</p>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-600">
              SQF · Edition 10
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-6 md:flex">
          <a
            href="#workflow"
            className="text-[13px] font-medium text-ink-600 transition hover:text-ink"
          >
            Workflow
          </a>
          <a
            href="#generator"
            className="text-[13px] font-medium text-ink-600 transition hover:text-ink"
          >
            Generator
          </a>
          <a
            href="#docs"
            className="text-[13px] font-medium text-ink-600 transition hover:text-ink"
          >
            Docs
          </a>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://edg.hazard-zero.com"
            className="hidden items-center gap-1.5 rounded-md border border-ink/15 px-3 py-1.5 text-[12.5px] font-medium text-ink transition hover:border-ink hover:bg-ink/5 md:inline-flex"
          >
            Console
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
          <a
            href="#generator"
            className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3.5 py-1.5 text-[12.5px] font-semibold text-cream-50 transition hover:bg-ink-800"
          >
            Get started
          </a>
        </div>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-ink/10">
      <div
        aria-hidden
        className="absolute inset-0 bg-grid-faint bg-grid-32 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
      />
      <div className="absolute -top-40 right-[-10%] h-[480px] w-[480px] rounded-full bg-scarlet/10 blur-3xl" />
      <div className="absolute -bottom-40 left-[-10%] h-[420px] w-[420px] rounded-full bg-ink/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-[1240px] gap-14 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white/60 px-3 py-1.5 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-scarlet" />
            <span className="tape text-ink-600">SQF Edition 10 · Audit Ready</span>
          </span>

          <h1 className="mt-6 max-w-[18ch] text-[44px] font-extrabold leading-[1.02] tracking-tightest text-ink md:text-[64px]">
            Food safety documentation, <em className="not-italic text-scarlet">generated</em> with audit-ready structure.
          </h1>

          <p className="mt-6 max-w-xl text-[17px] leading-7 text-ink-600">
            Capture facility, HACCP, and infrastructure inputs, then generate a
            structured SQF manual your team can review section by section —
            built on the open SQF standard.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#generator"
              className="group inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 text-[14px] font-semibold text-cream-50 transition hover:bg-ink-800"
            >
              Start the wizard
              <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <a
              href="#workflow"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-ink/15 bg-white px-5 py-3 text-[14px] font-semibold text-ink transition hover:border-ink hover:bg-ink/5"
            >
              View workflow
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
            <Stat value="3-step" label="Intake" />
            <span className="h-4 w-px bg-ink/15" />
            <Stat value="<60s" label="Generation" />
            <span className="h-4 w-px bg-ink/15" />
            <Stat value="PDF" label="Export" />
          </div>
        </div>

        <PreviewCard />
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-[20px] font-bold tracking-tight text-ink">{value}</div>
      <div className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-600">
        {label}
      </div>
    </div>
  );
}

function PreviewCard() {
  const items = [
    { num: "01", title: "Facility profile", body: "Name, address, SQF category, contacts." },
    { num: "02", title: "HACCP & products", body: "Process flow, hazards, product types." },
    { num: "03", title: "Infrastructure", body: "Sanitation, allergens, building controls." }
  ];

  return (
    <div className="relative">
      <div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-scarlet/10 via-transparent to-ink/5 blur-2xl" />
      <div className="relative rounded-xl border border-ink/10 bg-white shadow-card">
        <div className="flex items-center gap-2 border-b border-ink/10 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-scarlet/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
          <span className="ml-3 font-mono text-[11px] tracking-tight text-ink-600">
            manual-builder.tsx
          </span>
          <span className="ml-auto font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-600">
            Live
          </span>
        </div>
        <div className="grid gap-2 p-4">
          {items.map((item) => (
            <div
              key={item.num}
              className="lift-on-hover group flex items-center gap-4 rounded-lg border border-ink/10 bg-cream-50 p-4 hover:border-ink/30"
            >
              <span className="font-mono text-[11px] font-medium tracking-[0.18em] text-ink-600">
                {item.num}
              </span>
              <div className="flex-1">
                <div className="text-[14px] font-semibold tracking-tight text-ink">
                  {item.title}
                </div>
                <div className="mt-0.5 text-[12.5px] text-ink-600">{item.body}</div>
              </div>
              <span className="text-[16px] text-ink-600 transition group-hover:text-ink group-hover:translate-x-0.5">
                →
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-ink/10 bg-cream-100 px-4 py-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-600">
            Output
          </span>
          <span className="rounded-md border border-ink/15 bg-white px-2 py-0.5 font-mono text-[11px] tracking-tight text-ink">
            sqf-manual.pdf
          </span>
        </div>
      </div>
    </div>
  );
}

function FeatureBand() {
  const features = [
    {
      icon: <Sparkles className="h-4 w-4" />,
      label: "Generated",
      title: "Structured manuals",
      body: "AI-assisted output that follows SQF Edition 10 conventions."
    },
    {
      icon: <ShieldCheck className="h-4 w-4" />,
      label: "Compliant",
      title: "Audit-ready",
      body: "Section-by-section organization built for inspector review."
    },
    {
      icon: <FileCode2 className="h-4 w-4" />,
      label: "Open",
      title: "Markdown + PDF",
      body: "Inspect raw markdown or download a fully formatted PDF."
    }
  ];

  return (
    <section className="border-b border-ink/10 bg-cream-100/60">
      <div className="mx-auto grid max-w-[1240px] gap-px overflow-hidden border-x border-ink/10 bg-ink/10 md:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="flex flex-col gap-3 bg-cream-50 p-8 transition hover:bg-white"
          >
            <div className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-600">
              <span className="grid h-6 w-6 place-items-center rounded-md border border-ink/15 bg-white text-ink">
                {f.icon}
              </span>
              {f.label}
            </div>
            <div className="text-[20px] font-semibold tracking-tight text-ink">
              {f.title}
            </div>
            <p className="text-[14px] leading-6 text-ink-600">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Workflow() {
  const steps: Array<{ kicker: string; title: string; body: string }> = [
    {
      kicker: "01 · Capture",
      title: "Tell us about the facility.",
      body: "Provide facility, HACCP, and infrastructure context that shapes every section of your SQF manual."
    },
    {
      kicker: "02 · Generate",
      title: "We assemble the manual.",
      body: "Structured context is sent to the generation service, producing complete Markdown documentation."
    },
    {
      kicker: "03 · Review",
      title: "Read, refine, export.",
      body: "Step through generated sections, jump between headings, and download the finished document as PDF."
    }
  ];

  return (
    <section id="workflow" className="relative bg-cream-50">
      <div className="mx-auto max-w-[1240px] px-5 py-24 md:px-8 md:py-28">
        <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-end">
          <div>
            <span className="tape text-ink-600">/ Workflow</span>
            <h2 className="mt-3 max-w-md text-[36px] font-extrabold leading-[1.05] tracking-tightest md:text-[44px]">
              From questionnaire to a reviewable manual.
            </h2>
          </div>
          <p className="max-w-xl text-[16px] leading-7 text-ink-600">
            The generator follows the same practical philosophy as Hazard Zero —
            clear inputs, visible progress, and a digestible final document
            built around the way real food safety teams work.
          </p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="lift-on-hover relative flex flex-col gap-4 rounded-xl border border-ink/10 bg-white p-7 shadow-card hover:border-ink/30 hover:shadow-cardHover"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-scarlet">
                  {s.kicker}
                </span>
                <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-600">
                  Step
                </span>
              </div>
              <div className="hairline" />
              <h3 className="text-[22px] font-semibold leading-snug tracking-tight text-ink">
                {s.title}
              </h3>
              <p className="text-[14px] leading-6 text-ink-600">{s.body}</p>
              <div className="mt-auto pt-4 font-mono text-[42px] font-bold leading-none tracking-tightest text-ink/10">
                0{i + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Generator() {
  return (
    <section
      id="generator"
      className="relative overflow-hidden border-y border-ink/10 bg-ink text-cream-50"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-grid-dark bg-grid-32 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]"
      />
      <div className="absolute -top-40 left-1/2 h-[420px] w-[640px] -translate-x-1/2 rounded-full bg-scarlet/15 blur-3xl" />

      <div className="relative mx-auto max-w-[1100px] px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <span className="tape text-cream-50/60">/ Generator</span>
          <h2 className="mt-3 text-[36px] font-extrabold leading-[1.05] tracking-tightest md:text-[44px]">
            Build your SQF manual.
          </h2>
          <p className="mt-4 text-[16px] leading-7 text-cream-50/70">
            Move through three focused steps. The more specific your answers,
            the more useful the generated manual will be.
          </p>
        </div>

        <div className="mt-12">
          <Wizard />
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="docs" className="bg-cream-50">
      <div className="mx-auto max-w-[1240px] px-5 py-14 md:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <div className="flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-md bg-ink text-cream-50">
                <span className="font-mono text-[12px] font-bold tracking-tight">
                  HZ
                </span>
              </div>
              <p className="text-[15px] font-bold tracking-tight">Hazard Zero</p>
            </div>
            <p className="mt-4 text-[14px] leading-6 text-ink-600">
              Making food safety compliance simple and effective for food
              businesses of all sizes — from a single facility to a global
              operation.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <FooterColumn
              title="Product"
              links={[
                { href: "#generator", label: "Generator" },
                { href: "#workflow", label: "Workflow" },
                { href: "https://edg.hazard-zero.com", label: "Console" }
              ]}
            />
            <FooterColumn
              title="Resources"
              links={[
                { href: "#docs", label: "Docs" },
                { href: "#workflow", label: "Standards" },
                { href: "#generator", label: "Examples" }
              ]}
            />
            <FooterColumn
              title="Company"
              links={[
                { href: "#docs", label: "About" },
                { href: "#docs", label: "Contact" },
                { href: "#docs", label: "Privacy" }
              ]}
            />
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-ink/10 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-600">
            © {new Date().getFullYear()} Hazard-Zero LLC · All rights reserved
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-600">
            Built on the SQF standard
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-600">
        {title}
      </p>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="text-[14px] font-medium text-ink transition hover:text-scarlet"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
