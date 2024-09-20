import { GeneralSettings } from "@/components/settings/settings-general";
import { ProfileSettings } from "@/components/settings/settings-profile";
import { ThemeSettings } from "@/components/settings/settings-theme";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAuthorizedClients } from "@/lib/get-auth-clients";
import { DollarSign, FileText, LayoutGrid, Mail, Megaphone, Palette, Settings, Users } from "lucide-react";

export async function generateMetadata() {
  const title = "Settings";
  return {
    title,
  };
}

const tabData = [
  { id: "app", label: "Application", icon: Settings, enabled: true },
  { id: "themes", label: "Themes", icon: Palette, enabled: true },
  { id: "profile", label: "Profile", icon: FileText, enabled: true },
  {
    id: "subscriptions",
    label: "Subscriptions",
    icon: DollarSign,
    enabled: false,
  },
  {
    id: "advertising",
    label: "Advertising",
    icon: Megaphone,
    enabled: false,
  },
  { id: "newsletter", label: "Newsletter", icon: Mail, enabled: false },
  { id: "team", label: "Team", icon: Users, enabled: false },
  { id: "layouts", label: "Layouts", icon: LayoutGrid, enabled: false },
];
export default async function settings() {
  const { profile } = await getAuthorizedClients();

  return (
    <div className="container mx-auto p-6 py-10 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <Tabs defaultValue="app">
        <TabsList className="flex flex-wrap justify-start gap-2 bg-transparent">
          {tabData.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              disabled={!tab.enabled}
              className={`px-4 py-2 flex items-center space-x-2 rounded-lg text-sm font-medium transition-colors
                ${
                  tab.enabled
                    ? "bg-background hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    : "opacity-50 cursor-not-allowed"
                }`}
            >
              {tab.icon && <tab.icon className="w-4 h-4" />}
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="app">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="themes">
          <ThemeSettings />
        </TabsContent>

        <TabsContent value="profile">
          <ProfileSettings profile={profile} />
        </TabsContent>
        <TabsContent value="blog">
          <ProfileSettings profile={profile} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
