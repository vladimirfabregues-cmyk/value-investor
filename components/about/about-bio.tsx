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
      "Depuis près de 15 ans, j’évolue au cœur du secteur bancaire et financier, avec une spécialisation en audit interne, gestion des risques et gouvernance. Aujourd’hui Senior Audit Manager à Londres, je dirige des équipes d’audit pluridisciplinaires chargées d’évaluer certains des risques les plus importants auxquels une grande institution financière peut être confrontée.",
    body: [
      "Au fil de ma carrière, j’ai travaillé sur des problématiques allant du risque de crédit et de la gestion du capital à la résilience opérationnelle, la conformité réglementaire et la gouvernance. Cette expérience m’a appris à analyser une organisation au-delà des chiffres : comprendre les risques qu’elle prend, la manière dont elle les mesure et les contrôle, mais aussi identifier les hypothèses, les vulnérabilités et les signaux qui peuvent être facilement négligés.",
      "C’est cette même approche que j’applique à l’investissement. Je m’intéresse autant au potentiel de rendement qu’aux risques nécessaires pour l’obtenir. Comprendre la solidité d’un modèle économique, la qualité de sa gouvernance, sa capacité à générer durablement du capital et les scénarios susceptibles de remettre en cause une thèse d’investissement me paraît tout aussi important que d’estimer son potentiel de croissance.",
      "Je suis également passionné par la technologie, la data et l’intelligence artificielle, et par leur capacité à transformer aussi bien les services financiers que notre façon d’analyser les entreprises et de prendre des décisions.",
      "Ce site est avant tout l’endroit où je partage mes recherches, mes analyses et mes réflexions sur l’investissement. Mon approche repose sur quelques principes simples : comprendre avant d’investir, distinguer les faits des convictions, rester conscient de ce que l’on ne sait pas et toujours considérer le risque avant le rendement.",
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
