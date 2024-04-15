import Navbar from "@/components/navbar/Navbar";

export const metadata = {
  title: "Dashboard",
  description: "Dorm dashboard page",
};

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen w-full flex-col">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
