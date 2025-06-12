import Layout from "@/components/superAdmin/Layout";
import SearchStatus from "@/components/superAdmin/SearchStatus";

export default function Page() {
  return (
    <Layout>
      <div className="w-full grid grid-cols-12 gap-4">
        <div className="w-full h-96 md:col-span-8 lg:col-span-9 col-span-12  flex flex-col gap-4">
          <div className="w-full flex flex-col lg:flex-row justify-between items-end">
            <p className="w-full lg:w-1/2 text-xl lg:text-2xl font-semibold text-blue-6">
              Dashboard
            </p>
            <div className="w-full lg:w-1/2">
              <SearchStatus />
            </div>
          </div>

          <div className="w-full grid grid-cols-4 gap-4 min-h-28">
            <div className="w-full h-full rounded-lg bg-white col-span-1"></div>
            <div className="w-full h-full rounded-lg bg-white col-span-1"></div>
            <div className="w-full h-full rounded-lg bg-white col-span-1"></div>
            <div className="w-full h-full rounded-lg bg-white col-span-1"></div>
          </div>
        </div>
        <div className="w-full min-h-96 md:col-span-4 lg:col-span-3 col-span-12 flex flex-col gap-4">
          <div className="w-full h-96 bg-white rounded-lg"></div>
          <div className="w-full h-96 bg-white rounded-lg"></div>
        </div>
      </div>
    </Layout>
  );
}
