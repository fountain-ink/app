import { Footer } from "@/components/navigation/footer";
import { ArticleLayout } from "@/components/post/article-layout";

const UserPostLayout = async ({ children }: { children: React.ReactNode; params: { user: string } }) => {
  return (
    <ArticleLayout>
      {children}
      <Footer />
    </ArticleLayout>
  );
};

export default UserPostLayout;
