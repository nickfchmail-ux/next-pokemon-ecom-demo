import SideBar from '../_component/SideBar';

export default function AccountLayout({ children }) {
  return (
    <div className="grid grid-cols-1  md:grid-cols-[max-content_4fr] h-[80vh] overflow-hidden">
      <div className={`h-[80vh] hidden sm:hidden md:grid bg-amber-400 overflow-hidden`}>
        <SideBar />
      </div>

      <div className={`bg-gray-50 overflow-y-scroll bg-amber-200 w-full h-full`}>{children}</div>
    </div>
  );
}
