import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { TypeIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ThemeButtons } from "./theme-buttons";

export const ThemeSidebar = () => {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Theme Editor</CardTitle>
        <CardDescription>Choose a preset or make your own theme.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="presets">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>
          <TabsContent value="presets">
            <ThemeButtons />
          </TabsContent>
          <TabsContent value="custom">
            <ThemeEditor />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export const ThemeEditor = () => {
  return (
    <>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="color" className="text-right">
            Leading Color
          </Label>
          <Input id="color" value="#e2f3ab" className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="background" className="text-right">
            Background Color
          </Label>
          <Input id="background" value="#bbccaa" className="col-span-3" />
        </div>
      </div>

      <CardFooter>
        <Button type="submit">Save changes</Button>
      </CardFooter>
    </>
  );
};
