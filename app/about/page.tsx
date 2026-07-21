export const dynamic = "force-dynamic";

import { Building2, MapPin, Sparkles, Users } from "lucide-react";

import { AppShell } from "@/components/shell/app-shell";
import { getHistorySummaries } from "@/lib/db/queries";

const EXPERTISE = [
  "Credit risk",
  "Operational resilience",
  "Consumer duty",
  "Regulatory compliance",
  "Capital management",
  "Enterprise-wide risk management",
];

const FACTS = [
  { icon: Building2, label: "Currently", value: "Santander UK" },
  { icon: MapPin, label: "Based in", value: "London" },
  { icon: Users, label: "Experience", value: "15 years" },
  { icon: Sparkles, label: "Focus", value: "Audit × AI" },
];

export default async function AboutPage() {
  const history = await getHistorySummaries();

  return (
    <AppShell history={history}>
      <div className="mx-auto max-w-4xl space-y-10">
        {/* ── Header ── */}
        <header>
          <div className="text-[11px] uppercase tracking-[0.24em] text-primary/90">About</div>
          <h1 className="mt-2 font-display text-5xl leading-[1.05] text-foreground sm:text-6xl">
            Vladimir Fabregues
          </h1>
          <p className="mt-4 text-lg leading-8 text-foreground/80">
            Senior Audit Manager with 15 years of experience leading Internal Audit, Risk and
            Governance engagements within global financial institutions — specialising in retail
            banking, consumer finance and regulatory risk.
          </p>
        </header>

        {/* ── Key facts ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {FACTS.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 shadow-panel"
            >
              <Icon className="h-4 w-4 text-primary/80" />
              <div className="mt-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {label}
              </div>
              <div className="mt-1 font-display text-lg leading-tight text-foreground">{value}</div>
            </div>
          ))}
        </div>

        {/* ── Narrative ── */}
        <section className="space-y-6 text-[15px] leading-8 text-muted-foreground">
          <p>
            Throughout my career, I have built and led high-performing audit teams, delivered complex
            assurance reviews across major banking portfolios, and partnered with senior executives to
            improve controls, enhance governance and support strategic transformation initiatives.
          </p>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 shadow-panel">
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Areas of expertise
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {EXPERTISE.map((area) => (
                <span
                  key={area}
                  className="rounded-full border border-primary/25 bg-primary/[0.08] px-3 py-1 text-xs font-medium text-primary/90"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>

          <p>
            Currently based in London, I work at Santander UK where I lead multidisciplinary audit
            teams responsible for providing independent assurance over some of the bank&apos;s most
            significant risks. Alongside delivering assurance, I am passionate about modernising
            Internal Audit through data analytics, automation and the practical application of
            Artificial Intelligence.
          </p>

          <p>
            Beyond technical expertise, I believe successful leaders create environments where people
            can perform at their best. I enjoy coaching future leaders, building collaborative teams
            and developing practical solutions that balance regulatory expectations with commercial
            realities.
          </p>

          <p>
            Outside of work, I&apos;m a father of two, who enjoys technology and exploring how AI can
            transform both financial services and everyday business operations.
          </p>
        </section>

        {/* ── Closing statement ── */}
        <blockquote className="border-l-2 border-primary/50 pl-6">
          <p className="font-display text-xl leading-9 text-foreground/90 sm:text-2xl">
            Whether I&apos;m leading a major audit, advising senior stakeholders or designing
            innovative solutions, my focus remains the same: building trust, creating value and
            driving continuous improvement.
          </p>
        </blockquote>
      </div>
    </AppShell>
  );
}
