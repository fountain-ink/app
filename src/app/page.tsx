"use client";

import { useState, useEffect } from "react";
import { ConnectWalletButton } from "@/components/auth/auth-wallet-button";
import { DraftCreateButton } from "@/components/draft/draft-create-button";
import { GraphicHand, GraphicInk } from "@/components/icons/custom-icons";
import { ArticleLayout } from "@/components/navigation/article-layout";
import { GradientBlur } from "@/components/navigation/gradient-blur";
import Link from "next/link";
import { ChevronDownIcon } from "@radix-ui/react-icons";

export default function HomePage() {
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setShowBanner(false);
        window.removeEventListener("scroll", handleScroll);
      }
    };

    if (showBanner) {
      window.addEventListener("scroll", handleScroll);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [showBanner]);

  return (
    <>
      <GradientBlur />
      <main className="flex flex-col items-center max-w-md sm:max-w-lg mx-auto" id={"scroll_container"}>
        <ArticleLayout>
          <div className="-mt-10">
            <header className="text-center title">Writing, redefined</header>
            <header className="text-center subtitle">Welcome to Fountain.</header>

            <GraphicHand />

            <div className="flex justify-center pt-10 pb-10 items-center">
              <ConnectWalletButton text="Join Now" />
            </div>

            <p><b>Own your content and audience.</b> Because of the way Fountain is built, nobody, not even us, can take it away.</p>

            <p><b>Copyrighted automatically.</b> All Fountain posts are timestamped and written into blockchain, with a license of your liking attached.</p>

            <p><b>Earn in new ways.</b> We help you get rewarded directly by the people who enjoy your words.</p>

            <p><b>Human collaboration.</b> Writing with friends is as simple as copy-pasting a link to your browser.</p>

            <p>
              <b>Public goods.</b> Fountain is proudly{" "}
              <Link href="https://github.com/fountain-ink/app" className="underline decoration-offset-4 decoration-2">
                open source
              </Link>{" "}
              under AGPLv3.
            </p>

            <p>
              <b>Decentralized resilience.</b> Built on top of{" "}
              <Link href="https://lens.xyz" className="underline decoration-offset-4 decoration-2">
                Lens
              </Link>
              , Fountain features zero vendor lock in. All of your content is distributed across every Lens app, in the
              present and in the future.
            </p>

            <div className="w-full h-auto relative">
              <GraphicInk />
            </div>

            <h2>Rediscover the Joy of Writing.</h2>
            <p>
              In a world dominated by fast-paced social media and endless scrolling, there emerges a sanctuary for writers
              and readers alike. Fountain is a serene escape, a return to mindful engagement and authentic connection. We
              offer you an oasis where creativity thrives, unencumbered by the noise of modern digital life.
            </p>
            <p>
              Fountain is stripping away everything and helps you focus on what matters, making it beautiful. Without
              attention it's very difficult to produce anything profound, immerse in the flow or enjoy to learn.
            </p>

            <h2>True Connection in a Digital World.</h2>
            <p>
              Fountain redefines social interaction by fostering genuine connections. In a world where engagement often
              feels superficial, Fountain offers a space where every comment, every share, is meaningful. Your readers
              don't just skim; they engage deeply, leaving thoughtful comments that resonate with authenticity.
            </p>
            <p>
              Fountain is a community of creators who uplift and inspire each other. Here, your work is seen, appreciated,
              and celebrated. High-quality content is highlighted, and exceptional contributions are recognized and
              rewarded.
            </p>

            <h2>Join Us.</h2>
            <p>
              We hope you enjoy this release of Fountain, and invite you to become a co-creator on the journey of making
              it a less grueling and more fun experience to write, read and share.
            </p>

            <div className="flex justify-center py-10 pb-20 items-center">
              <DraftCreateButton text="Start Writing" />
            </div>
          </div>

        </ArticleLayout>
      </main>

      <div
        className={`
          fixed bottom-0 left-0 right-0 z-50
          flex justify-center items-center p-4
          bg-gradient-to-t from-background via-background/90 to-transparent
          transition-opacity duration-300 ease-in-out
          ${showBanner ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        aria-hidden={!showBanner}
      >
        <div className="flex flex-col items-center text-sm font-medium">
          Read More
          <ChevronDownIcon className="w-4 h-4" />
        </div>
      </div>
    </>
  );
}
