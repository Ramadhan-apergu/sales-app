import { Spin } from "antd";

export default function LoadingSpin({className = 'w-full h-full flex justify-center items-center'}) {
    return (
        <div className={className}>
            <Spin size='large'/>
        </div>
    )
}