
export const metadata = {
    title: "Contract",
    description: "Contract Page",
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
