import { proseClasses } from "@/styles/prose";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Fountain",
  description: "Fountain is a serene escape for writers and readers, a return to mindful engagement and authentic connection.",
};


export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl mx-auto">
      <div className={proseClasses}>
        <header className="title">About Fountain</header>

        <div className="prose dark:prose-invert max-w-none">
          <p className="text-lg mb-6">
            In a world dominated by fast-paced social media and endless scrolling, there emerges a sanctuary for writers and readers alike.
            Fountain is a serene escape, a return to mindful engagement and authentic connection. We offer you an oasis where creativity thrives, unencumbered by the noise of modern digital life.
          </p>
          <p>
            Fountain is stripping away everything and helps you focus on what matters, making it beautiful. Without attention it's very difficult to produce anything profound, immerse in the flow or enjoy to learn.
          </p>

          <h3 className="text-2xl font-semibold mt-8 mb-4">Rediscover the Joy of Writing</h3>
          <p>
            Fountain is a space where every word you write feels like a brushstroke on canvas. Transform the act of writing into a meditative experience. Allow your thoughts to flow freely, unimpeded by intrusive notifications or cluttered interfaces.
          </p>

          <h3 className="text-2xl font-semibold mt-8 mb-4">A Reading Experience Like No Other</h3>
          <p>
            No overwhelming feeds and aggressive ads that plague traditional media. Here, reading becomes a mindful act. Comments from people you follow are seamlessly integrated, adding layers of insight and connection without breaking your immersion.
          </p>

          <h3 className="text-2xl font-semibold mt-8 mb-4">True Connection in a Digital World</h3>
          <p>
            Fountain redefines social interaction by fostering genuine connections. In a world where engagement often feels superficial, Fountain offers a space where every comment, every share, is meaningful. Your readers don't just skim; they engage deeply, leaving thoughtful comments that resonate with authenticity.
          </p>
          <p>
            Fountain is a community of creators who uplift and inspire each other. Here, your work is seen, appreciated, and celebrated. High-quality content is highlighted, and exceptional contributions are recognised and rewarded.
          </p>

          <h3 className="text-2xl font-semibold mt-8 mb-4">What We Believe In</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Creator ownership:</strong> We help you <strong>own your content</strong>. We help you get rewarded directly by the people who enjoy it.
            </li>
            <li>
              <strong>Human collaboration:</strong> Writing with friends is as simple as copy-pasting the link to your editor.
            </li>
            <li>
              <strong>Public goods:</strong> Fountain is proudly <a href="https://github.com/fountain-ink" target="_blank" rel="noopener noreferrer">open source</a> under AGPLv3.
            </li>
            <li>
              <strong>Decentralized resilience:</strong> Built on top of <a href="https://lens.xyz" target="_blank" rel="noopener noreferrer">Lens</a>, Fountain features <strong>zero vendor lock in</strong>. All of your content is distributed across every Lens app, in the present and in the future.
            </li>
          </ul>

          <h3 className="text-2xl font-semibold mt-8 mb-4">Join Us</h3>
          <p>
            We hope you enjoy this release of Fountain, and invite you to become a co-creator on the journey of making it a less grueling and more fun experience to write, read and share.
          </p>
        </div>
      </div>
    </div>
  );
} 