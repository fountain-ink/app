import { ArticleLayout } from "@/components/navigation/article-layout";
import { Footer } from "@/components/navigation/nav-footer";

const UserPostLayout = async ({ children }: { children: React.ReactNode }) => {
  return <ArticleLayout>{children}</ArticleLayout>;
};

export default UserPostLayout;
