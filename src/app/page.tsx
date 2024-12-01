import { GraphicHand, GraphicInk } from "@/components/custom-icons";
import { EmailSubscription } from "@/components/email-subscription";
import { GradientBlur } from "@/components/navigation/gradient-blur";
import { SmoothScroll } from "@/components/smooth-scroll";
import { proseClasses } from "@/styles/prose";

export default function HomePage() {
  return (
    <SmoothScroll>
      <GradientBlur />
      <main className="flex flex-col items-center h-screen overflow-y-auto" id={"scroll_container"}>
        <div className="flex flex-col gap-12 px-4 py-16 mb-20 max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
          <div className={proseClasses}>
            <div className="w-full h-auto">
              <GraphicHand />
            </div>
            <h1>Welcome To Fountain</h1>
            <p>
              In a world dominated by fast-paced social media and endless scrolling, there emerges a sanctuary for
              writers and readers alike. Fountain a serene escape, a return to mindful engagement and authentic
              connection. We offer you an oasis where creativity thrives, unencumbered by the noise of modern digital
              life.
            </p>
            <h3> Rediscover the Joy of Writing </h3>
            <p>
              Fountain is a space where every word you write feels like a brushstroke on canvas. Transform the act of
              writing into a meditative experience. Allow your thoughts to flow freely, unimpeded by intrusive
              notifications or cluttered interfaces.
            </p>
            <h3>A Reading Experience Like No Other</h3>
            <p>
              No overwhelming feeds and aggressive ads that plague traditional media. Here, reading becomes a mindful
              act. Comments from people you follow are seamlessly integrated, adding layers of insight and connection
              without breaking your immersion.
            </p>
            <h3>True Connection in a Digital World</h3>
            <p>
              Fountain redefines social interaction by fostering genuine connections. In a world where engagement often
              feels superficial, Fountain offers a space where every comment, every share, is meaningful. Your readers
              don't just skim; they engage deeply, leaving thoughtful comments that resonate with authenticity.
            </p>
            <p>
              Fountain is a community of creators who uplift and inspire each other. Here, your work is seen,
              appreciated, and celebrated. High-quality content is highlighted, and exceptional contributions are
              recognised and rewarded.
            </p>
            <h3>Embrace the Zen</h3>
            <p>
              Fountain is about finding joy in the act of creation and connection. It's about cultivating a space where
              your ideas can thrive, where your voice can be heard, and where your creativity can shine.
            </p>
            <h3>Join Us</h3>
            <p>
              Join the Fountain waitlist and be part of a community that values quality over quantity, depth over
              breadth, and authenticity over superficiality.
            </p>
            <p className="p-8">Embrace the calm,</p>
            <p className="text-center p-8">Elevate your creativity,</p>
            <p className="text-right p-8">Welcome to Fountain.</p>

            {/* <p className="pl-4">
						{"- "}
						<Link
							className="hover:underline"
							href="https://share.lens.xyz/lens/fountain"
						>
							@fountain
						</Link>{" "}
						team
					</p> */}
            <div className="w-full h-auto -mt-10 mb-36 relative">
              <GraphicInk />
              <div className="sm:-mt-28 md:-mt-36 w-full absolute">
                <EmailSubscription />
              </div>
            </div>
          </div>
        </div>
      </main>
    </SmoothScroll>
  );
}
