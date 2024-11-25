import { Footer } from "@/components/navigation/footer";
import { ArticleLayout } from "@/components/post/article-layout";

const UserPostLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <ArticleLayout>
      {children}
    </ArticleLayout>
  );
};

export default UserPostLayout;
