
export const metadata = {
    title: "Login",
    description: "Login Page",
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>{children}</>
    );
}
