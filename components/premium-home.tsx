"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import {
  ArrowRight,
  BellRing,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  FileCheck2,
  LockKeyhole,
  MapPin,
  Scale,
  SearchCheck,
  ShieldCheck,
} from "lucide-react";

const heroWords = ["Vos", "démarches,", "enfin", "claires."];

const phases = [
  {
    name: "Avant",
    tone: "white",
    description: "Préparer sans rien oublier.",
    tasks: ["Vérifier le préavis du logement", "Organiser les contrats d’énergie", "Préparer l’état des lieux", "Planifier le suivi du courrier"],
  },
  {
    name: "Jour J",
    tone: "mint",
    description: "Garder l’essentiel sous la main.",
    tasks: ["Relever les compteurs", "Conserver les justificatifs utiles", "Vérifier les clés et accès", "Noter les contacts prioritaires"],
  },
  {
    name: "Après",
    tone: "sand",
    description: "Mettre à jour les bons organismes.",
    tasks: ["Déclarer la nouvelle adresse", "Actualiser les impôts", "Informer les organismes sociaux", "Modifier la carte grise si nécessaire"],
  },
];

const features = [
  { icon: SearchCheck, title: "Sources visibles", text: "Chaque information importante renvoie vers une page officielle récente et identifiable." },
  { icon: CalendarDays, title: "Le bon moment", text: "Les actions sont ordonnées avant, pendant et après votre déménagement." },
  { icon: BellRing, title: "Rappels exportables", text: "Ajoutez les échéances utiles à votre calendrier, sans ressaisie." },
  { icon: FileCheck2, title: "Courriers à adapter", text: "Préparez des modèles neutres pour vos demandes courantes, sans faux conseil juridique." },
  { icon: LockKeyhole, title: "Données minimales", text: "Aucune pièce d’identité, donnée bancaire ou information médicale n’est demandée." },
  { icon: Scale, title: "Limites assumées", text: "Les sujets sensibles sont signalés et orientés vers une vérification humaine." },
];

const faqs = [
  ["Est-ce un site officiel ?", "Non. Démarches Claires est un service privé et indépendant. Il prépare et explique les démarches, mais ne remplace aucune administration."],
  ["Puis-je commencer sans compte ?", "Oui. La checklist et les principaux parcours restent accessibles sans inscription. Un compte sert uniquement à sauvegarder et retrouver votre travail."],
  ["D’où viennent les informations ?", "Le service privilégie les sources officielles françaises et affiche les pages consultées ainsi que la date de vérification."],
  ["Les réponses sont-elles des conseils juridiques ?", "Non. Elles donnent une information générale. Les situations sensibles ou incertaines doivent être confirmées par l’administration ou un professionnel qualifié."],
  ["Quelles données dois-je fournir ?", "Uniquement les éléments nécessaires au parcours. N’envoyez jamais de pièce d’identité, identifiant administratif, donnée bancaire, fiscale ou médicale."],
];

function PhaseCard({ phase, index }: { phase: typeof phases[number]; index: number }) {
  const [states, setStates] = useState<number[]>(phase.tasks.map((_, taskIndex) => taskIndex === 0 && index === 0 ? 1 : 0));
  function cycle(taskIndex: number) {
    setStates((current) => current.map((value, currentIndex) => currentIndex === taskIndex ? (value + 1) % 3 : value));
  }
  return (
    <div className="phase-wrap" data-reveal>
      <article className={`phase-card phase-${phase.tone}`}>
        <h3>{phase.name}</h3>
        <ul>
          {phase.tasks.map((task, taskIndex) => (
            <li className={states[taskIndex] === 2 ? "is-done" : states[taskIndex] === 1 ? "is-progress" : ""} key={task}>
              <button aria-label={`${task} — changer l’état`} aria-pressed={states[taskIndex] === 2} onClick={() => cycle(taskIndex)} type="button">
                <Check aria-hidden="true" />
              </button>
              <span>{task}</span>
            </li>
          ))}
        </ul>
        <Link href="/demarches/demenagement" prefetch={false}>+ Créer ma checklist</Link>
      </article>
      <p><strong>{phase.name}.</strong> {phase.description}</p>
    </div>
  );
}

export function PremiumHome() {
  const root = useRef<HTMLElement>(null);
  const [openFaq, setOpenFaq] = useState(0);

  useLayoutEffect(() => {
    if (!root.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let revert: () => void = () => {};
    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([gsapModule, triggerModule]) => {
      const gsap = gsapModule.gsap;
      const ScrollTrigger = triggerModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      const context = gsap.context(() => {
        gsap.fromTo(".hero-word", { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.07, ease: "power4.out" });
        gsap.fromTo(".hero-intro", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.75, delay: 0.42, stagger: 0.08, ease: "power3.out" });
        gsap.fromTo(".hero-product", { y: 40, opacity: 0, scale: 0.98 }, { y: 0, opacity: 1, scale: 1, duration: 1.15, delay: 0.5, ease: "power3.out" });
        gsap.to(".hero-product", { yPercent: -8, scale: 0.975, ease: "none", scrollTrigger: { trigger: ".premium-hero", start: "top top", end: "bottom top", scrub: 1 } });
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
          gsap.fromTo(element, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.75, ease: "power3.out", scrollTrigger: { trigger: element, start: "top 88%", once: true } });
        });
        gsap.fromTo(".problem-word", { color: "#b6bab8" }, { color: "#111616", stagger: 0.035, scrollTrigger: { trigger: ".problem-statement", start: "top 78%", end: "bottom 42%", scrub: true } });
      }, root);
      revert = () => context.revert();
    });
    return () => revert();
  }, []);

  function glow(event: PointerEvent<HTMLElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${((event.clientX - bounds.left) / bounds.width) * 100}%`);
    event.currentTarget.style.setProperty("--my", `${((event.clientY - bounds.top) / bounds.height) * 100}%`);
  }

  const statement = "Les démarches administratives ne devraient pas vous obliger à ouvrir quinze onglets, comparer des réponses contradictoires et craindre d’oublier l’essentiel. Démarches Claires rassemble le bon ordre, les bons liens et les bonnes limites.";

  return (
    <main ref={root}>
      <section className="premium-hero" aria-labelledby="hero-title">
        <div className="premium-wrap hero-copy">
          <p className="hero-kicker hero-intro"><span /> Service privé et indépendant</p>
          <h1 id="hero-title">{heroWords.map((word) => <span className="hero-word-clip" key={word}><span className="hero-word">{word}</span></span>)}</h1>
          <p className="hero-lede hero-intro">Comprenez quoi faire, dans quel ordre et auprès de qui — avec une checklist personnalisée et des sources officielles toujours visibles.</p>
          <div className="hero-actions hero-intro">
            <Link className="premium-button" href="/demarches/demenagement" prefetch={false}>Préparer mon déménagement <ArrowRight aria-hidden="true" /></Link>
            <Link className="premium-link" href="/assistant" prefetch={false}>Poser une question</Link>
          </div>
          <p className="hero-note hero-intro">Gratuit pour commencer · Sans compte · Aucun document sensible</p>
        </div>
        <div className="premium-wrap hero-product" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/demarches-claires-devices.jpg" width="1680" height="945" alt="" fetchPriority="high" decoding="async" />
        </div>
      </section>

      <section className="problem-section" aria-labelledby="problem-label">
        <div className="premium-wrap narrow-copy">
          <p className="premium-eyebrow" id="problem-label">Le problème avec les démarches</p>
          <p className="problem-statement">{statement.split(" ").map((word, index) => <span className="problem-word" key={`${word}-${index}`}>{word}{" "}</span>)}</p>
        </div>
      </section>

      <section className="system-section" id="fonctionnement" aria-labelledby="system-title">
        <div className="premium-wrap">
          <div className="section-heading" data-reveal>
            <h2 id="system-title">Avant. Jour J. Après.</h2>
            <p>Votre déménagement remis dans le bon ordre — essayez, cochez une action.</p>
          </div>
          <div className="phase-grid">{phases.map((phase, index) => <PhaseCard index={index} key={phase.name} phase={phase} />)}</div>
          <div className="system-closing" data-reveal>
            <p>Vous gardez la décision.</p>
            <span>Nous rendons le chemin lisible.</span>
          </div>
        </div>
      </section>

      <section className="premium-section features-section" id="garanties" aria-labelledby="features-title">
        <div className="premium-wrap">
          <div className="section-heading" data-reveal><h2 id="features-title">Conçu pour avancer sans douter de chaque étape.</h2></div>
          <div className="feature-grid">
            {features.map(({ icon: Icon, title, text }) => (
              <article className="premium-feature" data-reveal key={title} onPointerMove={glow}>
                <span className="premium-feature-icon"><Icon aria-hidden="true" /></span>
                <h3>{title}</h3><p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="proof-section" aria-labelledby="proof-title">
        <div className="premium-wrap">
          <div className="section-heading" data-reveal><h2 id="proof-title">La confiance ne se décrète pas. Elle se vérifie.</h2></div>
          <div className="proof-grid">
            <article data-reveal><ShieldCheck aria-hidden="true" /><strong>Sources officielles</strong><p>Service Public, Légifrance, impots.gouv.fr et organismes compétents.</p></article>
            <article data-reveal><CheckCircle2 aria-hidden="true" /><strong>Date de vérification</strong><p>Chaque réponse sourcée indique quand l’information a été contrôlée.</p></article>
            <article data-reveal><Building2 aria-hidden="true" /><strong>Indépendance claire</strong><p>Aucune affiliation avec l’État ou une administration française.</p></article>
          </div>
        </div>
      </section>

      <section className="premium-section pricing-section" id="offres" aria-labelledby="pricing-title">
        <div className="premium-wrap">
          <div className="section-heading" data-reveal><h2 id="pricing-title">Commencez gratuitement. Complétez seulement si c’est utile.</h2></div>
          <div className="home-pricing" data-reveal>
            <article><p>ESSENTIEL</p><h3>Gratuit</h3><ul><li><Check />Checklist personnalisée</li><li><Check />Liens officiels</li><li><Check />Modèle de courrier</li></ul></article>
            <article className="featured"><p>DOSSIER COMPLET</p><h3>Paiement unique</h3><ul><li><Check />Export du dossier</li><li><Check />Calendrier de rappels</li><li><Check />Historique sauvegardé</li></ul></article>
            <article><p>PREMIUM</p><h3>Mensuel, facultatif</h3><ul><li><Check />Dossiers complets</li><li><Check />Assistant étendu</li><li><Check />Annulation en ligne</li></ul></article>
          </div>
          <div className="pricing-action" data-reveal><Link className="premium-button" href="/tarifs" prefetch={false}>Voir les tarifs <ArrowRight /></Link><p>Le paiement est toujours confirmé côté serveur.</p></div>
        </div>
      </section>

      <section className="premium-section faq-section" id="questions" aria-labelledby="faq-title">
        <div className="premium-wrap faq-wrap">
          <div className="section-heading" data-reveal><h2 id="faq-title">Vos questions, clairement.</h2></div>
          <div className="premium-faq" data-reveal>
            {faqs.map(([question, answer], index) => (
              <div className={openFaq === index ? "open" : ""} key={question}>
                <h3><button aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? -1 : index)} type="button">{question}<span><ChevronDown aria-hidden="true" /></span></button></h3>
                <div className="faq-panel" aria-hidden={openFaq !== index}><p>{answer}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="final-section" aria-labelledby="final-title">
        <div className="premium-wrap" data-reveal>
          <span className="final-pin"><MapPin aria-hidden="true" /></span>
          <h2 id="final-title">Moins chercher.<br />Mieux avancer.</h2>
          <Link className="premium-button" href="/demarches/demenagement" prefetch={false}>Créer ma checklist <ArrowRight /></Link>
          <p>3 minutes · Sans compte · Sources officielles</p>
        </div>
      </section>
    </main>
  );
}
