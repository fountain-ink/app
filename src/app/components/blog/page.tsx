"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { Facebook, Heart, Link, Linkedin, MessageCircle, Share2, ShoppingBag, X } from "lucide-react";
import { Albert_Sans, Alegreya, DM_Sans, Inter, Onest, Plus_Jakarta_Sans } from "next/font/google";
import Image from "next/image";
import { type PropsWithChildren, useEffect, useState } from "react";

const inter = Inter({ weight: ["400", "700"], subsets: ["latin"], display: "swap" });
const albertSans = Albert_Sans({ weight: ["400", "700"], subsets: ["latin"], display: "swap" });
const onest = Onest({ weight: ["400", "700"], subsets: ["latin"], display: "swap" });
const plusJakartaSans = Plus_Jakarta_Sans({ weight: ["400", "700"], subsets: ["latin"], display: "swap" });
const alegreya = Alegreya({ weight: ["400", "700"], subsets: ["latin"], display: "swap" });
const dmSans = DM_Sans({ weight: ["400", "700"], subsets: ["latin"], display: "swap" });

const HighlightedText = ({ children, color = "yellow" }: PropsWithChildren<{ color?: string }>) => (
  <span className={`box-decoration-clone bg-${color}-500 bg-opacity-20 px-1 py-0 rounded-sm`}>{children}</span>
);

// Mock data for comments
const comments = [
  {
    id: 1,
    quote: "The hidden onsen in Kurokawa was a true gem. I felt like I discovered a secret paradise!",
    user: {
      name: "Emma Rodriguez",
      handle: "@emma_travels",
      avatar: "https://xsgames.co/randomusers/avatar.php?g=female",
    },
    comment:
      "This post brought back so many memories! I visited Kurokawa last year and it was magical. The rotenburo overlooking the forest was an experience I'll never forget.",
    likes: 42,
    replies: 7,
  },
  {
    id: 2,
    quote: "I never knew about the artisanal sake breweries in rural Niigata. It's like a hidden world of flavor!",
    user: {
      name: "Olivia Chen",
      handle: "@olivia_foodie",
      avatar: "https://xsgames.co/randomusers/avatar.php?g=female",
    },
    comment:
      "As a sake enthusiast, I'm amazed I didn't know about these small breweries. I'm definitely adding Niigata to my travel list. Any recommendations for specific brands to try?",
    likes: 38,
    replies: 5,
  },
  {
    id: 3,
    quote: "The Kumano Kodo pilgrimage route sounds like a spiritual journey through time. I can't wait to explore it!",
    user: {
      name: "Sophia Kwesi",
      handle: "@sophia_adventures",
      avatar: "https://xsgames.co/randomusers/avatar.php?g=female",
    },
    comment:
      "I've done parts of the Camino de Santiago, but the Kumano Kodo seems like it offers a completely different experience. The idea of walking through ancient cedar forests and discovering hidden shrines is so appealing.",
    likes: 56,
    replies: 9,
  },
];

// Mock data for similar posts
const similarPosts = [
  {
    id: 1,
    title: "Exploring the Ancient Tea Houses of Kyoto's Gion District",
    teaser: "Step back in time and discover the hidden world of geishas and traditional tea ceremonies.",
    author: {
      name: "Alice Johnson",
      avatar: "https://xsgames.co/randomusers/avatar.php?g=female",
    },
    date: "June 2, 2023",
    image:
      "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
  },
  {
    id: 2,
    title: "The Hidden Surf Spots of Shikoku: Japan's Best Kept Secret",
    teaser: "Discover world-class waves and empty lineups on Japan's often overlooked island.",
    author: {
      name: "Mia Thompson",
      avatar: "https://xsgames.co/randomusers/avatar.php?g=female",
    },
    date: "May 28, 2023",
    image:
      "https://images.unsplash.com/photo-1514317915517-800231a6a880?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
  },
  {
    id: 3,
    title: "Foraging for Wild Ingredients in Hokkaido's Untamed Wilderness",
    teaser: "Join local chefs on a culinary adventure through Japan's northern forests and coastlines.",
    author: {
      name: "Elena Rodríguez",
      avatar: "https://xsgames.co/randomusers/avatar.php?g=female",
    },
    date: "May 25, 2023",
    image:
      "https://images.unsplash.com/photo-1542640244-7e672d6cef4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
  },
  {
    id: 4,
    title: "The Forgotten Ryokan: Staying in Japan's Most Remote Mountain Inns",
    teaser: "Experience true Japanese hospitality in these hidden gems far from the tourist trail.",
    author: {
      name: "David Lee",
      avatar: "https://xsgames.co/randomusers/avatar.php?g=male",
    },
    date: "May 22, 2023",
    image:
      "https://images.unsplash.com/photo-1578469645742-46cae010e5d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
  },
];

const UserTooltip = ({ user }: { user: any }) => (
  <Card className="w-[320px] p-4">
    <CardContent className="p-0">
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.role}</p>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{user.bio}</p>
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{user.articles}</span> articles
          <span className="mx-2">•</span>
          <span className="font-semibold text-foreground">{user.followers}</span> followers
        </div>
        <Button size="sm">Follow</Button>
      </div>
    </CardContent>
  </Card>
);

export default function BlogPost() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isThemeEditorOpen, setIsThemeEditorOpen] = useState(false);
  const [likes, setLikes] = useState(875);
  const [theme, setTheme] = useState({
    headlineFont: "Inter",
    paragraphFont: "Inter",
    headlineFontWeight: "font-bold",
    letterSpacing: "tight",
    showAuthor: true,
    background: "#ffffff",
    foreground: "#000000",
  });

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleThemeEditor = () => setIsThemeEditorOpen(!isThemeEditorOpen);

  useEffect(() => {
    document.documentElement.style.setProperty("--headline-font", getFontFamily(theme.headlineFont));
    document.documentElement.style.setProperty("--paragraph-font", getFontFamily(theme.paragraphFont));
    document.documentElement.style.setProperty("--headline-font-weight", theme.headlineFontWeight);
    document.documentElement.style.setProperty(
      "--letter-spacing",
      theme.letterSpacing === "tight" ? "tracking-tight" : "tracking-normal",
    );
    document.documentElement.style.setProperty("--blog-background", theme.background);
    document.documentElement.style.setProperty("--blog-foreground", theme.foreground);
  }, [theme]);

  const getFontFamily = (fontName: any) => {
    switch (fontName) {
      case "Inter":
        return inter.style.fontFamily;
      case "Albert Sans":
        return albertSans.style.fontFamily;
      case "Onest":
        return onest.style.fontFamily;
      case "Plus Jakarta Sans":
        return plusJakartaSans.style.fontFamily;
      case "Alegreya":
        return alegreya.style.fontFamily;
      case "DM Sans":
        return dmSans.style.fontFamily;
      default:
        return inter.style.fontFamily;
    }
  };

  const fontOptions = [
    { name: "Inter", font: inter },
    { name: "Albert Sans", font: albertSans },
    { name: "Onest", font: onest },
    { name: "Plus Jakarta Sans", font: plusJakartaSans },
    { name: "Alegreya", font: alegreya },
    { name: "DM Sans", font: dmSans },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Sticky Nav */}
      <nav className="sticky top-0 z-40 bg-background border-b border-border px-4 py-2 flex justify-between items-center">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fountain-mark-black-f1ickow4mrlHi88jBD4Nnm8ROeigMl.svg"
          alt="Fountain Logo"
          width={24}
          height={24}
        />
        <div className="text-sm font-medium">Hidden Gems of Japan</div>
        <div className="space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Subscribe
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">What's your email?</DialogTitle>
                <DialogDescription>Subscribe to never miss a post.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-left">
                    Email
                  </Label>
                  <Input id="email" type="email" placeholder="your@email.com" className="col-span-3" />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Subscribe
              </Button>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" onClick={toggleThemeEditor}>
            Edit theme
          </Button>
        </div>
      </nav>

      <div className="flex flex-1">
        <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? "w-[calc(100%-24rem)]" : "w-full"}`}>
          <div
            id="blog-content"
            className="w-full"
            style={{ backgroundColor: "var(--blog-background)", color: "var(--blog-foreground)" }}
          >
            <div className="max-w-3xl px-4 pt-16 lg:pt-20 pb-12 sm:px-6 lg:px-8 mx-auto">
              <div className="max-w-2xl">
                <AnimatePresence>
                  {theme.showAuthor && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex w-full sm:items-center gap-x-5 sm:gap-x-3">
                          <TooltipProvider>
                            <Tooltip delayDuration={300}>
                              <TooltipTrigger asChild>
                                <Avatar className="w-12 h-12">
                                  <AvatarImage
                                    src="https://xsgames.co/randomusers/avatar.php?g=female"
                                    alt="Yuki Tanaka"
                                  />
                                  <AvatarFallback>YT</AvatarFallback>
                                </Avatar>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <UserTooltip
                                  user={{
                                    name: "Yuki Tanaka",
                                    role: "Travel Writer & Photographer",
                                    avatar: "https://xsgames.co/randomusers/avatar.php?g=female",
                                    bio: "Yuki is a passionate explorer of Japan's hidden treasures, always seeking the road less traveled.",
                                    articles: 47,
                                    followers: "12k+",
                                  }}
                                />
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <div className="grow">
                            <div className="flex justify-between items-center gap-x-2">
                              <div>
                                <span className="text-lg font-semibold">Yuki Tanaka</span>
                                <p className="text-sm text-muted-foreground">July 15 • 8 min read</p>
                              </div>
                              <Button variant="outline" size="sm">
                                <ShoppingBag className="w-4 h-4 mr-2" />
                                Collect
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <article
                  className={`prose max-w-none ${theme.letterSpacing === "tight" ? "tracking-tight" : "tracking-normal"}`}
                >
                  <h1 style={{ fontFamily: "var(--headline-font)", fontWeight: "var(--headline-font-weight)" }}>
                    Unveiling Japan's Hidden Treasures: A Journey Off the Beaten Path
                  </h1>

                  {/* Hero Image */}
                  <div className="aspect-w-16 aspect-h-9 mb-6">
                    <Image
                      src="https://images.unsplash.com/photo-1480796927426-f609979314bd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&h=1080&q=80"
                      alt="Panoramic view of Mount Fuji with cherry blossoms"
                      width={1920}
                      height={1080}
                      className="rounded-lg object-cover"
                    />
                  </div>

                  <p style={{ fontFamily: "var(--paragraph-font)" }}>
                    Japan, a land where ancient traditions seamlessly blend with cutting-edge modernity, is a country
                    that never ceases to amaze. While Tokyo's neon-lit streets and Kyoto's historic temples are
                    undoubtedly captivating, the true magic of Japan often lies in its lesser-known corners. Join me as
                    we embark on a journey to discover the hidden gems that make Japan a treasure trove for the intrepid
                    traveler.
                  </p>
                  <h2 style={{ fontFamily: "var(--headline-font)", fontWeight: "var(--headline-font-weight)" }}>
                    Kurokawa Onsen: A Timeless Hot Spring Haven
                  </h2>
                  <p style={{ fontFamily: "var(--paragraph-font)" }}>
                    Nestled in the heart of Kyushu's mountains, Kurokawa Onsen is a picturesque hot spring town that
                    seems frozen in time. Unlike its more famous counterparts, Kurokawa has managed to preserve its
                    traditional charm, with narrow streets lined with ryokan (traditional inns) and outdoor baths
                    overlooking lush forests.
                  </p>
                  <div className="aspect-w-4 aspect-h-3 my-2">
                    <Image
                      src="https://images.unsplash.com/photo-1578469645742-46cae010e5d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&h=1553&q=80"
                      alt="Kurokawa Onsen, a traditional Japanese hot spring town"
                      width={2070}
                      height={1553}
                      className="rounded-lg"
                    />
                  </div>
                  <figcaption className="text-center text-sm mt-1 mb-4">
                    The serene beauty of Kurokawa Onsen, where time seems to stand still.
                  </figcaption>
                  <p style={{ fontFamily: "var(--paragraph-font)" }}>
                    What sets Kurokawa apart is its unique "rotemburo meguri" (bath-hopping) experience. For a small
                    fee, visitors can purchase a pass that allows access to three different outdoor baths, each offering
                    a distinct atmosphere and healing properties.
                  </p>
                  <blockquote className="border-l-4 border-gray-200 dark:border-gray-700 pl-4 italic">
                    "Soaking in a rotenburo under the stars, surrounded by the sounds of nature, is a transcendent
                    experience that connects you to the very essence of Japan."
                    <footer className="mt-2">Hiroshi Yamamoto, local ryokan owner</footer>
                  </blockquote>
                  <h2 style={{ fontFamily: "var(--headline-font)", fontWeight: "var(--headline-font-weight)" }}>
                    Niigata's Hidden Sake Breweries
                  </h2>
                  <p style={{ fontFamily: "var(--paragraph-font)" }}>
                    While Niigata is renowned for its high-quality rice, few travelers venture into its rural heartland
                    to discover the artisanal sake breweries that dot the landscape. These small, family-run operations
                    have been perfecting their craft for generations, producing some of Japan's finest sake.
                  </p>
                  <ul style={{ fontFamily: "var(--paragraph-font)" }}>
                    <li>
                      Visit the historic Imayo Tsukasa Brewery, where you can witness the traditional brewing process
                      and sample rare, seasonal sakes.
                    </li>
                    <li>
                      Explore the Ponshukan Sake Museum in Echigo-Yuzawa Station, featuring a unique sake-tasting system
                      with over 100 local varieties.
                    </li>
                    <li>
                      Take a guided tour of the Hakkaisan Brewery, nestled at the foot of Mount Hakkai, and learn about
                      their snow-aging technique.
                    </li>
                  </ul>
                  <h2 style={{ fontFamily: "var(--headline-font)", fontWeight: "var(--headline-font-weight)" }}>
                    The Kumano Kodo: Ancient Pilgrimage Routes
                  </h2>
                  <p style={{ fontFamily: "var(--paragraph-font)" }}>
                    For those seeking a spiritual journey through Japan's pristine nature, the Kumano Kodo pilgrimage
                    routes offer an unparalleled experience. These ancient trails, located in the Kii Peninsula, have
                    been walked by emperors, samurai, and pilgrims for over a thousand years.
                  </p>
                  <div className="aspect-w-3 aspect-h-2 my-2">
                    <Image
                      src="https://images.unsplash.com/photo-1545569341-9eb8b30979d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&h=1380&q=80"
                      alt="A serene path along the Kumano Kodo pilgrimage route"
                      width={2070}
                      height={1380}
                      className="rounded-lg"
                    />
                  </div>
                  <figcaption className="text-center text-sm mt-1 mb-4">
                    The mystical beauty of the Kumano Kodo, where nature and spirituality intertwine.
                  </figcaption>
                  <p style={{ fontFamily: "var(--paragraph-font)" }}>
                    As you trek through dense cedar forests, past hidden shrines and thundering waterfalls, you'll feel
                    a deep connection to Japan's spiritual roots. The Kumano Kodo is not just a hike; it's a journey
                    through time and tradition.
                  </p>
                  <blockquote className="border-l-4 border-gray-200 dark:border-gray-700 pl-4 italic">
                    "Walking the Kumano Kodo is like stepping into a living, breathing history book. Each stone, each
                    tree has a story to tell."
                    <footer className="mt-2">Akiko Sato, Kumano Kodo guide</footer>
                  </blockquote>
                  <h2 style={{ fontFamily: "var(--headline-font)", fontWeight: "var(--headline-font-weight)" }}>
                    Embracing the Unknown
                  </h2>
                  <p style={{ fontFamily: "var(--paragraph-font)" }}>
                    These hidden gems are just a glimpse of what awaits those willing to venture off Japan's
                    well-trodden tourist path. By exploring these lesser-known destinations, you'll not only discover
                    the heart and soul of Japan but also contribute to the sustainability of rural communities that are
                    working hard to preserve their unique cultural heritage.
                  </p>
                  <p style={{ fontFamily: "var(--paragraph-font)" }}>
                    So, on your next trip to Japan, dare to explore the unknown. You might just find that the most
                    memorable experiences are waiting in the places you least expect.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-6">
                    {["Off the Beaten Path", "Cultural Immersion", "Nature", "Traditional Japan"].map((tag) => (
                      <Badge key={tag} variant="outline" className="hover:bg-secondary transition-colors">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </article>

                <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <h2
                    className="text-2xl font-bold mb-6"
                    style={{ fontFamily: "var(--headline-font)", fontWeight: "var(--headline-font-weight)" }}
                  >
                    More posts
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {similarPosts.map((post) => (
                      <Card
                        key={post.id}
                        className="overflow-hidden group hover:shadow-lg transition-shadow duration-300"
                      >
                        {/* biome-ignore lint/a11y/useValidAnchor: <explanation> */}
                        <a href="#" className="block h-full">
                          <div className="relative overflow-hidden">
                            <img
                              src={post.image}
                              alt={post.title}
                              className="w-full h-48 object-cover transition-transform duration-300 ease-in-out transform group-hover:scale-110"
                            />
                          </div>
                          <CardContent className="p-4 flex flex-col h-[calc(100%-12rem)]">
                            <h3
                              className="text-lg font-semibold mb-2"
                              style={{ fontFamily: "var(--headline-font)", fontWeight: "var(--headline-font-weight)" }}
                            >
                              {post.title}
                            </h3>
                            <p
                              className="text-sm text-muted-foreground mb-4 flex-grow"
                              style={{ fontFamily: "var(--paragraph-font)" }}
                            >
                              {post.teaser}
                            </p>
                            <div className="flex items-center mb-4">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Avatar className="w-8 h-8 mr-2">
                                      <AvatarImage src={post.author.avatar} alt={post.author.name} />
                                      <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                                    </Avatar>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom">
                                    <UserTooltip
                                      user={{
                                        name: post.author.name,
                                        role: "Travel Writer",
                                        avatar: post.author.avatar,
                                        bio: `${post.author.name} is a passionate explorer and writer for Hidden Gems of Japan.`,
                                        articles: 15,
                                        followers: "3k+",
                                      }}
                                    />
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <div>
                                <p className="text-sm font-semibold">{post.author.name}</p>
                                <p className="text-xs text-muted-foreground">{post.date}</p>
                              </div>
                            </div>
                            <Button variant="link" className="p-0 mt-auto self-start">
                              Read more
                            </Button>
                          </CardContent>
                        </a>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="fixed bottom-6 inset-x-0 text-center z-40">
            <Card className="inline-flex shadow-lg bg-background rounded-full">
              <CardContent className="flex items-center gap-2 py-2 px-4">
                <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setLikes(likes + 1)}>
                  <Heart className="w-4 h-4 mr-1" />
                  {likes}
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full" onClick={toggleSidebar}>
                  <MessageCircle className="w-4 h-4 mr-1" />
                  16
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="rounded-full">
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Link className="w-4 h-4 mr-2" />
                      Copy link
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Facebook className="w-4 h-4 mr-2" />
                      Share on Facebook
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Linkedin className="w-4 h-4 mr-2" />
                      Share on LinkedIn
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Comment Sidebar */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: isSidebarOpen ? "0%" : "100%" }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 right-0 h-full w-96 bg-background border-l border-border overflow-hidden z-50"
        >
          <div className="flex justify-between items-center p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Comments</h2>
            <Button variant="ghost" size="sm" onClick={toggleSidebar}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-64px)] p-4">
            {comments.map((comment) => (
              <div key={comment.id} className="mb-6 last:mb-0">
                <Card className="mb-2 shadow-sm">
                  <CardContent className="p-3">
                    <p className="text-sm" style={{ fontFamily: "var(--paragraph-font)" }}>
                      <HighlightedText color="green">{comment.quote}</HighlightedText>
                    </p>
                  </CardContent>
                </Card>
                <div className="flex items-start gap-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                          <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <UserTooltip
                          user={{
                            name: comment.user.name,
                            role: "Travel Enthusiast",
                            avatar: comment.user.avatar,
                            bio: `${comment.user.name} is a passionate traveler and regular reader of Hidden Gems of Japan.`,
                            articles: 0,
                            followers: "100+",
                          }}
                        />
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{comment.user.name}</span>
                      <span className="text-muted-foreground text-xs">{comment.user.handle}</span>
                    </div>
                    <p className="text-sm mt-1">{comment.comment}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="h-auto px-3 py-1.5 hover:bg-muted">
                          <Heart className="w-4 h-4 mr-1" />
                          <span className="text-xs">{comment.likes}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-auto px-3 py-1.5 hover:bg-muted">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          <span className="text-xs">{comment.replies}</span>
                        </Button>
                      </div>
                      <Button variant="ghost" size="sm" className="h-auto px-3 py-1.5 hover:bg-muted">
                        <span className="text-xs">Reply</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
        </motion.div>

        {/* Theme Editor Sidebar */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: isThemeEditorOpen ? "0%" : "100%" }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 right-0 h-full w-96 bg-background border-l border-border overflow-hidden z-50"
        >
          <div className="flex justify-between items-center p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Theme Editor</h2>
            <Button variant="ghost" size="sm" onClick={toggleThemeEditor}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-64px)]">
            <div className="p-6 space-y-6" data-radix-scroll-area-viewport>
              {/* Fonts Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Fonts</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="headlineFont">Headline Font</Label>
                    <Select
                      value={theme.headlineFont}
                      onValueChange={(value) => setTheme({ ...theme, headlineFont: value })}
                    >
                      <SelectTrigger id="headlineFont">
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                      <SelectContent>
                        {fontOptions.map((font) => (
                          <SelectItem key={font.name} value={font.name}>
                            <span style={{ fontFamily: font.font.style.fontFamily }}>{font.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="paragraphFont">Paragraph Font</Label>
                    <Select
                      value={theme.paragraphFont}
                      onValueChange={(value) => setTheme({ ...theme, paragraphFont: value })}
                    >
                      <SelectTrigger id="paragraphFont">
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                      <SelectContent>
                        {fontOptions.map((font) => (
                          <SelectItem key={font.name} value={font.name}>
                            <span style={{ fontFamily: font.font.style.fontFamily }}>{font.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="headlineFontWeight">Headline Font Weight</Label>
                    <Select
                      value={theme.headlineFontWeight}
                      onValueChange={(value) => setTheme({ ...theme, headlineFontWeight: value })}
                    >
                      <SelectTrigger id="headlineFontWeight">
                        <SelectValue placeholder="Select font weight" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="300">
                          <span style={{ fontFamily: "var(--headline-font)", fontWeight: "normal" }}>Normal</span>
                        </SelectItem>
                        <SelectItem value="700">
                          <span style={{ fontFamily: "var(--headline-font)", fontWeight: "bold" }}>Bold</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="letterSpacing">Letter Spacing</Label>
                    <Select
                      value={theme.letterSpacing}
                      onValueChange={(value) => setTheme({ ...theme, letterSpacing: value })}
                    >
                      <SelectTrigger id="letterSpacing">
                        <SelectValue placeholder="Select letter spacing" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="tight">Tight</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Colors Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Colors</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="background">Background Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="background"
                        type="color"
                        value={theme.background}
                        onChange={(e) => setTheme({ ...theme, background: e.target.value })}
                        className="w-12 h-12 p-1 rounded-md"
                      />
                      <Input
                        type="text"
                        value={theme.background}
                        onChange={(e) => setTheme({ ...theme, background: e.target.value })}
                        className="flex-grow"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="foreground">Text Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="foreground"
                        type="color"
                        value={theme.foreground}
                        onChange={(e) => setTheme({ ...theme, foreground: e.target.value })}
                        className="w-12 h-12 p-1 rounded-md"
                      />
                      <Input
                        type="text"
                        value={theme.foreground}
                        onChange={(e) => setTheme({ ...theme, foreground: e.target.value })}
                        className="flex-grow"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Other Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Other</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-author"
                      checked={theme.showAuthor}
                      onCheckedChange={(checked) => setTheme({ ...theme, showAuthor: checked })}
                    />
                    <Label htmlFor="show-author">Show Author</Label>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </motion.div>
      </div>
    </div>
  );
}
