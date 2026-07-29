"use client";

import { useTranslation } from "@/lib/i18n/locale-context";

/**
 * The personal bio, in the two supported languages. Kept in the component
 * (rather than the shared dictionary) because it is a single block of prose
 * with no interpolation and no reuse elsewhere. `intro` is the lead paragraph
 * beside the portrait; `body` is the longer text below it.
 */
const BIO = {
  en: {
    intro:
      "Senior Audit Manager with 15 years of experience leading Internal Audit, Risk and Governance engagements within global financial institutions — specialising in retail banking, consumer finance and regulatory risk.",
    body: [
      "Throughout my career, I have built and led high-performing audit teams, delivered complex assurance reviews across major banking portfolios, and partnered with senior executives to improve controls, enhance governance and support strategic transformation initiatives. My work spans areas including credit risk, operational resilience, consumer duty, regulatory compliance, capital management and enterprise-wide risk management.",
      "Currently based in London, I work at Santander UK where I lead multidisciplinary audit teams responsible for providing independent assurance over some of the bank’s most significant risks. Alongside delivering assurance, I am passionate about modernising Internal Audit through data analytics, automation and the practical application of Artificial Intelligence.",
      "Beyond technical expertise, I believe successful leaders create environments where people can perform at their best. I enjoy coaching future leaders, building collaborative teams and developing practical solutions that balance regulatory expectations with commercial realities.",
      "Outside of work, I’m a father of two, who enjoys technology and exploring how AI can transform both financial services and everyday business operations.",
      "Whether I’m leading a major audit, advising senior stakeholders or designing innovative solutions, my focus remains the same: building trust, creating value and driving continuous improvement.",
    ],
  },
  fr: {
    intro:
      "Senior Audit Manager fort de 15 ans d’expérience à la tête de missions d’audit interne, de risque et de gouvernance au sein de grandes institutions financières — spécialisé dans la banque de détail, le crédit à la consommation et le risque réglementaire.",
    body: [
      "Tout au long de ma carrière, j’ai constitué et dirigé des équipes d’audit performantes, mené des revues d’assurance complexes sur de grands portefeuilles bancaires et collaboré avec des dirigeants pour renforcer les contrôles, améliorer la gouvernance et soutenir des initiatives de transformation stratégique. Mon travail couvre notamment le risque de crédit, la résilience opérationnelle, le devoir envers le client (consumer duty), la conformité réglementaire, la gestion du capital et la gestion des risques à l’échelle de l’entreprise.",
      "Actuellement basé à Londres, je travaille chez Santander UK, où je dirige des équipes d’audit pluridisciplinaires chargées de fournir une assurance indépendante sur certains des risques les plus importants de la banque. Au-delà de cette mission d’assurance, je suis passionné par la modernisation de l’audit interne grâce à l’analyse de données, à l’automatisation et à l’application concrète de l’intelligence artificielle.",
      "Au-delà de l’expertise technique, je crois que les bons dirigeants créent des environnements où chacun peut donner le meilleur de lui-même. J’aime accompagner les futurs leaders, bâtir des équipes collaboratives et concevoir des solutions concrètes qui concilient exigences réglementaires et réalités commerciales.",
      "En dehors du travail, je suis père de deux enfants, passionné de technologie et par la façon dont l’IA peut transformer aussi bien les services financiers que les opérations quotidiennes des entreprises.",
      "Que je dirige un audit d’envergure, que je conseille des parties prenantes de haut niveau ou que je conçoive des solutions innovantes, mon objectif reste le même : instaurer la confiance, créer de la valeur et favoriser l’amélioration continue.",
    ],
  },
} as const;

export function AboutBio({ part }: { part: "intro" | "body" }) {
  const { locale } = useTranslation();
  const bio = BIO[locale] ?? BIO.en;

  if (part === "intro") {
    return (
      <p className="mt-4 text-lg leading-8 text-foreground/80">{bio.intro}</p>
    );
  }

  return (
    <>
      {bio.body.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </>
  );
}
