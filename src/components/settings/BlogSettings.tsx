import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export function BlogSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Blog Settings</CardTitle>
        <CardDescription>
          Customize your blog preferences.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="blog-title">Blog Title</Label>
          <Input id="blog-title" placeholder="Your blog title" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="blog-description">Blog Description</Label>
          <Textarea
            id="blog-description"
            placeholder="Your blog description"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="blog-background">Blog Background</Label>
          <Input id="blog-background" type="file" accept="image/*" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="default-category">Default Category</Label>
          <Select>
            <SelectTrigger id="default-category">
              <SelectValue placeholder="Select a default category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="science">Science</SelectItem>
              <SelectItem value="health">Health</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="comments" />
          <Label htmlFor="comments">Enable comments on articles</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="auto-publish" />
          <Label htmlFor="auto-publish">
            Auto-publish scheduled articles
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
