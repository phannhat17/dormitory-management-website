export const metadata = {
    title: "Admin Dashboard",
    description: "Admin Dashboard Page",
};

export default function CreateUserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>{children}</>
    );
}
