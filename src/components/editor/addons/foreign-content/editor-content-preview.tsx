import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { ChevronDown, X } from "lucide-react";
// import { useEditor } from "novel";
import { useState } from "react";

interface ForeignContent {
  title: string;
  subtitle?: string;
  content: string;
  coverImage?: string;
  createdAt: number;
  preview?: string;
  slug: string;
}

export const ContentPreview = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);
  // const { editor } = useEditor();

  const fetchContent = async (fetchUrl: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/foreignContent?url=${encodeURIComponent(fetchUrl)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch content");
      }
      const _data: ForeignContent = await response.json();
      // const json = generateJSON(data.content, [...editorExtensionsList]); FIXME: Bring back editorExtensionList:
      // const editorExtensionsList = [
      // 	...defaultExtensions,
      // 	slashCommand,
      // 	Collaboration.configure({
      // 		document: document,
      // 	}),
      // 	CollaborationCursor.configure({
      // 		provider,
      // 		user: getInitialUser(),
      // 	}),
      //    ];
      // editor?.commands.setContent(json);
      setUrl(fetchUrl);
    } catch (err) {
      setError("Error fetching content. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exampleLinks = [
    "https://paragraph.xyz/@cstreet/impact-shadows",
    "https://app.t2.world/article/clypwtj202425561ymcn5w742wd",
    "https://app.t2.world/article/cltbrml5c1130221zmc6hqd6uvq",
    "https://foundation.mirror.xyz/mP5oui8vd_n_7_hUk76qPR4gTL7U_Jl-60kKt0qlk9A",
    "https://mirror.xyz/filarm.eth/dLolcroQ98JRhVxNpZHOwI1C1E6ecCqLfFFNJ7UgArE",
  ];

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-10 h-10 rounded-full p-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 ease-in-out ${
          isOpen ? "rotate-180" : ""
        }`}
      >
        {isOpen ? <X size={20} /> : <ChevronDown size={20} />}
      </Button>
      <div
        className={`absolute top-12 right-0 transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <Card className="w-[500px] max-w-full drop-shadow-lg animate-in slide-in-from-top-2 duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Preview Your content on Fountain</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mb-4">
              <Input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter URL"
                className="flex-grow"
              />
              <Button onClick={() => fetchContent(url)} disabled={loading}>
                {loading ? "Loading..." : "Import"}
              </Button>
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <Collapsible open={isCollapsibleOpen} onOpenChange={setIsCollapsibleOpen}>
              <CollapsibleTrigger className="rounded-lg border p-2 flex items-center gap-2 w-full transition-all duration-200 ease-in-out">
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${isCollapsibleOpen ? "rotate-180" : ""}`}
                />
                Example links
              </CollapsibleTrigger>
              <CollapsibleContent className="overflow-hidden transition-all duration-300 ease-in-out">
                <ul className="list-none text-sm text-muted-foreground p-2 space-y-1 animate-in slide-in-from-top-1 duration-300">
                  {exampleLinks.map((link, _index) => (
                    <li key={link}>
                      <Button
                        className="p-0 h-auto text-left truncate text-ellipsis overflow-hidden whitespace-nowrap"
                        onClick={() => {
                          setUrl(link);
                          fetchContent(link);
                        }}
                      >
                        {link}
                      </Button>
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
