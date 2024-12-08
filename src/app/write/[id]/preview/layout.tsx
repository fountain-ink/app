import { Footer } from "@/components/navigation/nav-footer";

const WritePreviewLayout = async ({ children }: { children: React.ReactNode; params: { user: string } }) => {
  return (
    <>
      {children}
      <Footer />
    </>
  );
};

export default WritePreviewLayout;
