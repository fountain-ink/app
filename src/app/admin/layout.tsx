import AdminAuthCheck from "@/components/admin/admin-auth-check";
import AdminNavigation from "@/components/admin/admin-navigation";

export const metadata = {
  title: "Admin Portal | Fountain",
  description: "Administration portal for Fountain",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthCheck>
      <div className="container-fluid p-4 sm:px-6">
        <h1 className="text-3xl font-bold ml-4 mb-10">Admin Portal</h1>
        <div className="flex flex-row sm:gap-2 lg:gap-4">
          <AdminNavigation />
          <div className="w-full">{children}</div>
        </div>
      </div>
    </AdminAuthCheck>
  );
}
