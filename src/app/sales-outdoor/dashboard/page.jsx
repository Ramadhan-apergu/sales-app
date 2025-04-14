import ProfilBar from "@/components/salesOutdoor/dashboard/ProfileBar";
import FixedHeaderBar from "@/components/salesOutdoor/FixedHeaderBar";
import Layout from "@/components/salesOutdoor/Layout";

export default function Dashboard() {
    return (
        <Layout>
            <FixedHeaderBar/>
            <div className="flex flex-col gap-4 bg-gray-3 pb-4 pt-11">
                <ProfilBar data={{
                    name: 'Ramadhan',
                    role: 'Sales Outdoor',
                    url: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                }} />
                <div className="w-full flex flex-col gap-4 px-4">
                    <div className="w-full h-24 bg-blue-6 rounded-xl" />
                    <div className="w-full h-64 bg-white rounded-xl" />
                    <div className="w-full h-56 bg-white rounded-xl" />
                </div>
            </div>
        </Layout>
    );
}
