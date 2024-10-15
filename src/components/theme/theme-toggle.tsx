import { useStorage } from "@/hooks/use-storage";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useTheme } from "./theme-context";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const { setTheme: setLocalTheme } = useStorage();

  const toggleTheme = () => {
    // const newTheme = theme === "editorial" ? "editorial-dark" : "editorial";
    // setTheme(newTheme);
    // setLocalTheme(newTheme);
  };

  return (
    <Button
      variant="ghost"
      className="flex items-center justify-center hover:bg-transparent w-10 h-10 p-0"
      onClick={toggleTheme}
    >
      {theme === "editorial" ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
    </Button>
  );
};
