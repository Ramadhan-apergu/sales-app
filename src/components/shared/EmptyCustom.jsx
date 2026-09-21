import { Empty } from "antd"

export default function EmptyCustom({background = 'none'}) {
    return (
        <div className={`w-full h-full flex justify-center items-center bg-${background}`}>
            <Empty/>
        </div>
    )
}