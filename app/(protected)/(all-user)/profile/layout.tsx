
export const metadata = {
    title: "User Profile",
    description: "User Profile Page",
};

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>{children}</>
    );
}
