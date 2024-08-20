import { EmailSubscription } from "@/components/EmailSubscription";
import { GraphicHand, GraphicInk } from "@/components/Icons";

export default function HomePage() {
	return (
		<main className="flex flex-col items-center justify-center bg-background text-foreground">
			<div className="flex flex-col gap-12 px-4 py-16 mb-20 max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
				<div
					className={
						"prose prose-sm sm:prose-base prose-img:rounded-xl prose-h1:text-foreground prose-h2:text-foreground prose-h1:font-martina \
							prose-h1:my-8 prose-h1:text-6xl lg:prose-lg focus:outline-none rounded-lg \
							prose-p:text-xl prose-h2:font-martina prose-p:font-martina"
					}
				>
					<div className="w-full h-auto">
						<GraphicHand />
					</div>
					<h1>Welcome To Fountain</h1>
					<p>
						In a world dominated by fast-paced social media and endless
						scrolling, there emerges a sanctuary for writers and readers alike.
						Fountain a serene escape, a return to mindful engagement and
						authentic connection. We offer you an oasis where creativity
						thrives, unencumbered by the noise of modern digital life.
					</p>
					<h2> Rediscover the Joy of Writing </h2>
					<p>
						Fountain a space where every word you write feels like a brushstroke
						on canvas. Transform the act of writing into a meditative
						experience. Allow your thoughts to flow freely, unimpeded by
						intrusive notifications or cluttered interfaces.
					</p>
					<p>
						Immersing yourself in a state of flow. Fountain creates a calming
						backdrop for your creative process. This is where your ideas can
						breathe, where your creativity can unfold naturally and beautifully.
					</p>
					<h2>A Reading Experience Like No Other</h2>
					<p>
						No overwhelming feeds and aggressive ads that plague traditional
						media. Here, reading becomes a mindful act. Comments from people you
						follow are seamlessly integrated, adding layers of insight and
						connection without breaking your immersion.
					</p>
					<h2>True Connection in a Digital World</h2>
					<p>
						Fountain redefines social interaction by fostering genuine
						connections. In a world where engagement often feels superficial,
						Fountain offers a space where every comment, every share, is
						meaningful. Your readers don't just skim; they engage deeply,
						leaving thoughtful comments that resonate with authenticity.
					</p>
					<p>
						Fountain is a community of creators who uplift and inspire each
						other. Here, your work is seen, appreciated, and celebrated.
						High-quality content is highlighted, and exceptional contributions
						are recognised and rewarded.
					</p>
					<h2>Embrace the Zen</h2>
					<p>
						Fountain is about finding joy in the act of creation and connection.
						It's about cultivating a space where your ideas can thrive, where
						your voice can be heard, and where your creativity can shine.
					</p>
					<h2>Join Us</h2>
					<p>
						Join Waitlist and be part of a community that values quality over
						quantity, depth over breadth, and authenticity over superficiality.
					</p>
					<p className="p-8">Embrace the calm,</p>
					<p className="text-center p-8">Elevate your creativity,</p>
					<p className="text-right p-8">Welcome to Fountain.</p>

					{/* <p className="pl-4">
						{"- "}
						<Link
							className="hover:underline"
							href="https://share.lens.xyz/u/lens/fountain"
						>
							@fountain
						</Link>{" "}
						team
					</p> */}
					<div className="w-full h-auto -mt-10 relative">
						<GraphicInk />
						<div className="-mt-28 md:-mt-36 pl-0 md:pl-10 absolute">
							<EmailSubscription />
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
