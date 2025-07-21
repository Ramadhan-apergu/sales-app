import TabBar from "./TabBar";

export default function Layout({children}) {
    return (
        <div className="mobile-container">
            <div className="h-full flex flex-col">
                <div className="basis-[90%] overflow-auto bg-gray-3" style={{scrollbarWidth: 'none'}}>
                    {children}
                </div>
                {/* Add no-print class to the tab bar container */}
                <div className="basis-[10%] no-print">
                    <TabBar/>
                </div>
            </div>
        </div>
    )
}
