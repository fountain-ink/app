import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const DetailsTab = () => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" placeholder="Enter article title" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input id="subtitle" placeholder="Enter article subtitle" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cover">Cover Image URL</Label>
        <Input id="cover" placeholder="Enter cover image URL" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <Input id="tags" placeholder="Enter tags separated by commas" />
      </div>
    </div>
  );
};