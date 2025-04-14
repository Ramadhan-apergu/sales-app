
import { HiCheckCircle, HiClock, HiTruck } from "react-icons/hi";
import { HiInboxStack } from "react-icons/hi2";

function Icon({ title }) {
    let IconComponent = null;
    let style = ''
    switch (title) {
        case 'approved':
        case 'finish':
            IconComponent = HiCheckCircle;
            style = 'text-green-7'
            break;
        case 'pending':
            IconComponent = HiClock;
            style = 'text-orange-5'
            break;
        case 'total':
            IconComponent = HiInboxStack;
            style = 'text-blue-6'
            break;
        case 'in delivery':
            IconComponent = HiTruck;
            style = 'text-orange-5'
            break;
        default:
            IconComponent = null;
    }

    return IconComponent ? <IconComponent className={style} /> : null;
}

export default function Header({ title, description, overview = {} }) {
    const { title: overviewTitle = '', description: overviewDescription = '', items = [] } = overview;
  
    return (
      <div className="h-56 relative bg-gray-3 mt-11">
        <div className="h-40 bg-blue-6 rounded-b-4xl flex items-start justify-between px-4 pt-2">
          <div className="w-full flex flex-col text-white px-4">
            <p className="text-2xl font-semibold tracking-wide">{title || ''}</p>
            <p className="text-sm">{description || ''}</p>
          </div>
        </div>
  
        <div className="w-full h-36 absolute bottom-0 px-4 pb-1">
          <div className="w-full h-full rounded-xl bg-white px-4 pt-3 pb-4 flex flex-col gap-3 shadow">
            <div className="w-full flex flex-col gap-1">
                <p className="text-sm font-semibold leading-none">{overviewTitle}</p>
              <p className="text-xs leading-none opacity-80">{overviewDescription}</p>
            </div>
  
            <div className="w-full flex justify-center items-center gap-2 h-full">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="flex-1 h-full bg-gray-3 rounded-lg border border-gray-5 p-2 flex-col justify-center flex"
                >
                    <div className="flex justify-center items-center gap-1">
                    <Icon title={item.title}/>
                        <p className="text-xs w-full truncate text-gray-12/70 capitalize">{item.title}</p>
                    </div>
                  <p className="text-xl w-full truncate">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  