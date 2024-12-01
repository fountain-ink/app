import { Footer } from "@/components/navigation/footer";
import { GradientBlur } from "@/components/navigation/gradient-blur";
import { ArticleLayout } from "@/components/post/article-layout";

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
