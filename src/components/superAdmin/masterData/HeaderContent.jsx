export default function HeaderContent({justify = 'start', children}) {
    return (
        <div className={`w-full h-1/12 flex justify-${justify} items-center lg:items-start gap-2`}>
            {children}
        </div>  
    )
}