import { HiOutlinePlus } from "react-icons/hi";

export default function FloatingButton() {

  return (
    <div
    className={`
        sticky bottom-0 flex justify-end transition-transform duration-150 pr-2 pb-2
      `}
    >
        <button className='w-10 flex aspect-square bg-blue-6 rounded-full justify-center items-center text-white text-xl'>
        <HiOutlinePlus/>
        </button>
    </div>
  )
}
