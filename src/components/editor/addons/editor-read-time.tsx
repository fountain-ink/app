interface EditorReadTimeProps {
  content: string;
}

export const EditorReadTime = ({ content }: EditorReadTimeProps) => {
  const calculateReadTime = (jsonContent: string) => {
    try {
      const blocks = JSON.parse(jsonContent);

      // Extract text from each block's children
      const textContent = blocks.reduce((acc: string, block: any) => {
        if (block.children) {
          const blockText = block.children.map((child: any) => child.text || "").join(" ");
          return `${acc} ${blockText}`;
        }
        return acc;
      }, "");

      const words = textContent.trim().split(/\s+/).length;

      const minutes = Math.ceil(words / 200);

      return Math.max(1, minutes);
    } catch (e) {
      return 1;
    }
  };

  const readTime = calculateReadTime(content);

  return (
    <div className="py-2 tracking-[0.1em] text-xs uppercase text-center font-geist-sans font-bold">
      {readTime} minute read
    </div>
  );
};
