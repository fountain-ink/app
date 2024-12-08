import { ArticleLayout } from "@/components/navigation/article-layout";
import { GradientBlur } from "@/components/navigation/gradient-blur";
import { Footer } from "@/components/navigation/nav-footer";

const UserPostLayout = async ({ children }: { children: React.ReactNode; params: { user: string } }) => {
  return (
    <ArticleLayout>
      <GradientBlur />
      {children}
      <Footer />
    </ArticleLayout>
  );
};

export default UserPostLayout;
