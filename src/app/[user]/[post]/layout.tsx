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
      <div
        className={
          "overflow-visible min-h-screen w-full max-w-full sm:max-w-3xl md:max-w-4xl p-10 sm:px-30 md:px-40 mx-auto relative"
        }
      >
        {children}
        <Footer />
      </div>
    </div>
  );
};

export default UserPostLayout;
