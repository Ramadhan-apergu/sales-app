import TabBar from "./TabBar";

export default function Layout({children}) {
    return (
        <div className="mobile-container">
            <div className="h-full flex flex-col">
                <div className="basis-[90%] overflow-auto bg-gray-3" style={{scrollbarWidth: 'none'}}>
                    {children}
                </div>
                <div className="basis-[10%]">
                    <TabBar/>
                </div>
            </div>
        </div>
    )
}