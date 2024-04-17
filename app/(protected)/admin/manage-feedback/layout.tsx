import { Toaster } from 'sonner'

export const metadata = {
    title: "View Feedbacks",
    description: "View Feedbacks Page",
};

export default function CreateUserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
            <Toaster richColors  />
        </>
    );
}
