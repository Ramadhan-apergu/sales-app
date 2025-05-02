export default function BodyContent({children}) {
    return (
        <div className="w-full h-11/12 bg-white shadow rounded-xl p-4">
            <div
                className={`w-full h-full justify-between flex flex-col overflow-auto`}
                style={{scrollbarWidth: 'thin', scrollbarGutter: 'stable'}}
            >
                {children}
            </div>
        </div>
    )
}