export const dynamic = "force-dynamic";

import Image from "next/image";

import { AppShell } from "@/components/shell/app-shell";
import { getHistorySummaries } from "@/lib/db/queries";

export default async function AboutPage() {
  const history = await getHistorySummaries();

  return (
    <AppShell history={history}>
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10">
          {/* Portrait sits above the text on mobile, beside the name on wider screens */}
          <Image
            src="/vladimir.jpg"
            alt="Vladimir Fabregues"
            width={320}
            height={290}
            priority
            className="order-1 h-36 w-36 shrink-0 rounded-2xl border border-white/10 object-cover shadow-panel sm:order-2 sm:h-40 sm:w-40"
          />

          <div className="order-2 min-w-0 flex-1 sm:order-1">
            <div className="text-[11px] uppercase tracking-[0.24em] text-primary/90">About</div>
            <h1 className="mt-2 font-display text-4xl leading-[1.05] text-foreground sm:text-5xl">
              Vladimir Fabregues
            </h1>
            <p className="mt-4 text-lg leading-8 text-foreground/80">
              Senior Audit Manager with 15 years of experience leading Internal Audit, Risk and
              Governance engagements within global financial institutions — specialising in retail
              banking, consumer finance and regulatory risk.
            </p>
          </div>
        </header>

        <section className="space-y-6 text-[15px] leading-8 text-muted-foreground">
          <p>
            Throughout my career, I have built and led high-performing audit teams, delivered complex
            assurance reviews across major banking portfolios, and partnered with senior executives to
            improve controls, enhance governance and support strategic transformation initiatives. My
            work spans areas including credit risk, operational resilience, consumer duty, regulatory
            compliance, capital management and enterprise-wide risk management.
          </p>

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

          <p>
            Whether I&apos;m leading a major audit, advising senior stakeholders or designing
            innovative solutions, my focus remains the same: building trust, creating value and
            driving continuous improvement.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
