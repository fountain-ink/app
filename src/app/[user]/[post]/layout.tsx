import { Footer } from "@/components/navigation/footer";
import { proseClasses } from "@/styles/prose";

const UserPostLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { user: string };
}) => {
  return (
    <div
      className={`text-foreground bg-background max-w-full w-screen h-screen overflow-y-auto ${proseClasses}`}
      id="scroll_container"
    >
        {children}
        <Footer />
    </div>
  );
};

export default UserPostLayout;
