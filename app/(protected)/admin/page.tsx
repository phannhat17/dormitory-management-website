import { auth } from "@/auth"
import Navbar from "@/components/navbar/Navbar"

const AdminPage = async () => {
    const session = await auth();

    return (
        <>
            <Navbar />
            <h1>Admin Page</h1>
            <div>{JSON.stringify(session)}</div>
        </>
    )
}

export default AdminPage;