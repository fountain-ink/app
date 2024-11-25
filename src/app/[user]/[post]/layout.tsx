import { Footer } from "@/components/navigation/footer";

import "@/styles/article.css";

const UserPostLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { user: string };
}) => {
  return (
    <article className="max-w-full w-screen h-screen overflow-y-auto" id="scroll_container">
      {children}
      <Footer />
    </article>
  );
};

export default UserPostLayout;
