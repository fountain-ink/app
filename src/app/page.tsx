import { EmailSubscription } from "@/components/EmailSubscription";
import { GraphicHand, GraphicInk } from "@/components/Icons";
import Link from "next/link";

export default function HomePage() {
	return (
		<main className="flex flex-col items-center justify-center bg-background text-foreground">
			<div className="flex flex-col gap-12 px-4 py-16 max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
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
						scrolling, there emerges a sanctuary for writers and readers alike—
						Fountain. This isn’t just another platform; it’s a serene escape, a
						return to mindful engagement and authentic connection. Fountain
						offers an oasis where creativity thrives, unencumbered by the noise
						of modern digital life.
					</p>
					<h2> Rediscover the Joy of Writing </h2>
					<p>
						Imagine a space where every word you write feels like a brushstroke
						on a canvas. Fountain transforms the act of writing into a
						meditative experience. Here, distractions are banished, and your
						thoughts flow freely, unimpeded by intrusive notifications or
						cluttered interfaces.
					</p>
					<p>
						Writing on Fountain isn’t just about putting words on a page; it’s
						about immersing yourself in a state of flow. The platform’s
						minimalist design, adorned with soothing pastel colours and elegant
						single-line illustrations, creates a calming backdrop for your
						creative process. This is where your ideas can breathe, where your
						creativity can unfold naturally and beautifully.
					</p>
					<h2>A Reading Experience Like No Other</h2>
					<p>
						For readers, Fountain is a revelation. Gone are the overwhelming
						feeds and aggressive ads that plague traditional social media.
						Instead, you’re greeted with a tranquil interface that invites you
						to lose yourself in the words on the screen. The gentle gradient
						blurs at the top and bottom guide your focus, allowing you to savour
						each sentence without distraction.
					</p>
					<p>
						Here, reading becomes a mindful act. The AI-generated excerpts in
						your feed offer a taste of the content, sparking your curiosity and
						drawing you deeper into the narrative. Comments from people you
						follow are seamlessly integrated, adding layers of insight and
						connection without breaking your immersion.
					</p>
					<h2>True Connection in a Digital World</h2>
					<p>
						Fountain redefines social interaction by fostering genuine
						connections. In a world where engagement often feels superficial,
						Fountain offers a space where every comment, every share, is
						meaningful. Imagine sharing a beautifully crafted excerpt of your
						latest piece, enhanced by a dynamically generated image that
						captures the essence of your words. Your readers don’t just skim;
						they engage deeply, leaving thoughtful comments and voice messages
						that resonate with authenticity.
					</p>
					<p>
						The platform encourages instant feedback, creating a vibrant
						community of creators who uplift and inspire each other. Here, your
						work is seen, appreciated, and celebrated. High-quality content is
						highlighted, not buried under an avalanche of noise, and exceptional
						contributions are recognised and rewarded.
					</p>
					<h2>Embrace the Zen</h2>
					<p>
						Fountain is more than a platform; it’s a movement. It’s a rejection
						of the frenetic pace of traditional social media and an embrace of
						something deeper, more meaningful. It’s about finding joy in the act
						of creation and connection. It’s about cultivating a space where
						your ideas can thrive, where your voice can be heard, and where your
						creativity can shine.
					</p>
					<p>
						In Fountain, you find a balance between solitude and community. The
						minimalist design, the mindful features, and the genuine
						interactions all come together to create a space where you can truly
						focus, engage, and grow.
					</p>
					<h2>Join the Movement</h2>
					<p>
						Step into the calm. Experience the beauty of mindful creativity.
						Whether you’re a writer seeking a tranquil space to craft your next
						masterpiece or a reader looking for a sanctuary from the chaos,
						Fountain welcomes you. This is where creativity blossoms, where
						connections are genuine, and where every moment is savoured.
					</p>
					<p>
						Join Fountain today and be part of a community that values quality
						over quantity, depth over breadth, and authenticity over
						superficiality.
					</p>
					<p>Embrace the calm.</p>
					<p>Elevate your creativity.</p>
					<p>Welcome to Fountain.</p>

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
					<div className="w-full h-auto -mt-20 relative">
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
