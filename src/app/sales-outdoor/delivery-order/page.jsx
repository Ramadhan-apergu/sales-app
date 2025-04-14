import FixedHeaderBar from "@/components/salesOutdoor/FixedHeaderBar";
import { HiOutlineFilter } from "react-icons/hi";
import Layout from "@/components/salesOutdoor/Layout";
import { Input } from 'antd';
import Header from "@/components/salesOutdoor/Header";
import CardList from "@/components/salesOutdoor/deliveryOrder/CardList";

export default function DeliveryOrder() {
    return (
        <Layout>
            <FixedHeaderBar bgColor="bg-blue-6"/>
            <Header
            title={'Delivery Order'}
            description={'Delivery Order Description'}
            overview={{title: 'Total Delivery Order', description: 'Period 1 Jan 2024 - 30 dec 2024', items: [{title: 'total', value: 70}, {title: 'in delivery', value: 20}, {title: 'finish', value: 50}]}}/>
            <div className="w-full">
                <div className="w-full py-4 flex justify-center items-center gap-1 sticky top-11 px-4 bg-gray-3">
                    <div className="w-full flex justify-center items-center h-9 rounded-full bg-white p-0.5 shadow">
                        <Input placeholder="Search" variant="borderless"/>
                    </div>
                    <div className="h-9 aspect-square flex justify-center items-center text-xl bg-white rounded-full text-blue-6 shadow">
                        <HiOutlineFilter/>
                    </div>
                </div>
                <CardList data={{id: 'DO-12345', customerName: 'Ramadhan', date: '30 September 2024', status: 'in delivery', courier: 'internal'}}/>
                <CardList data={{id: 'DO-12346', customerName: 'Kafa', date: '18 September 2024', status: 'finish', courier: 'JNE'}}/>
                <CardList data={{id: 'DO-12347', customerName: 'Rizky', date: '11 September 2024', status: 'in delivery', courier: 'JNT'}}/>
                <CardList data={{id: 'DO-12345', customerName: 'Ramadhan', date: '30 September 2024', status: 'finish', courier: 'internal'}}/>
                <CardList data={{id: 'DO-12346', customerName: 'Kafa', date: '18 September 2024', status: 'in delivery', courier: 'JNE'}}/>
                <CardList data={{id: 'DO-12347', customerName: 'Rizky', date: '11 September 2024', status: 'finish', courier: 'JNT'}}/>
            </div>
        </Layout>
    )
}