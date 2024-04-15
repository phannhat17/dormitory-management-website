import {auth} from "@/auth";

const AdminPage = async () => {
    const session = await auth();

    return (
        <div>
            {JSON.stringify(session)}
        </div>
    )
}

export default AdminPage;