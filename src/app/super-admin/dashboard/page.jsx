import Layout from "@/components/superAdmin/Layout"
import EmptyCustom from "@/components/superAdmin/masterData/EmptyCustom"

export default function Dashboard() {
    return (
        <Layout pageTitle={'Dashboard'}>
            <div className="w-full h-full rounded-xl bg-white shadow">
                <EmptyCustom/>
            </div>
        </Layout>
    )
}