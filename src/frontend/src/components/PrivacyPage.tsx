import { motion } from "motion/react";

export function PrivacyPage() {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="px-5 md:px-10 pt-8 pb-20 max-w-3xl"
    >
      <p className="section-label mb-5">Editorial Statement</p>

      <h1
        className="font-editorial font-black text-white leading-tight mb-8"
        style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)" }}
      >
        The Privacy Manifesto
      </h1>

      <div className="border-t border-white mb-10" />

      <div
        className="font-sans text-white/85 leading-relaxed space-y-6"
        style={{ fontSize: "clamp(16px, 2.2vw, 18px)", lineHeight: 1.75 }}
      >
        <p>
          We publish on the Internet Computer not as a technical novelty, but as
          a deliberate act of sovereignty. Every article stored here is written
          into an immutable, decentralized substrate — beyond the reach of
          servers that can be seized, platforms that can be deplatformed, and
          clouds that can be shuttered overnight. Words published here are not
          rented from a corporation. They exist.
        </p>

        <p>
          The legacy web has normalized surveillance as the price of publishing.
          Readers are tracked, profiled, and sold. Writers surrender their data
          to intermediaries in exchange for distribution. TIMES² refuses this
          arrangement entirely. There are no analytics, no cookies, no
          fingerprinting, no advertising networks observing you as you read
          these words. Your attention is not the product.
        </p>

        <p>
          Privacy is not a feature we added. It is the architecture. On-chain
          publishing means there is no central operator capable of disclosing
          your reading habits to a third party — because no such record is kept.
          The boundary between reader and text is yours alone. What you think
          about what you read belongs to you.
        </p>

        <p>
          We believe the press is only free when it cannot be switched off. When
          a story is published here, it enters the permanent record of an open
          blockchain — verifiable, tamper-evident, and hosted across a
          distributed network with no single point of failure. This is not a
          promise. It is a property of the system. Editorial independence and
          digital sovereignty are, at last, the same thing.
        </p>
      </div>
    </motion.article>
  );
}
