import { Spin } from "antd";

export default function LoadingSpinProcessing() {
    return (
        <div className={`absolute z-50 top-0 left-0 w-full h-[100dvh] flex justify-center items-center bg-white/50`}>
            <Spin size="large"/>
        </div>
    )
}