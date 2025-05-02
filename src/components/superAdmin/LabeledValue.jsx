import { Input } from "antd";

export default function LabeledValue({data =[], height = '100%', isReadOnly = true}) {
    return (
        <div className="w-full flex flex-col gap-4 px-2 overflow-auto" style={{height: height}}>
            {data.length > 0 && data.map((item, i) => (
                        <div key={i} className="flex w-full justify-start items-start flex-col capitalize gap-0.5">
                        <p className="text-sm font-semibold">{item.label}</p>
                        <Input readOnly={isReadOnly} value={item.value} variant="filled"/>
                    </div>
            ))}
        </div>
    )
}