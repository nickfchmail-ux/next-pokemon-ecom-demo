function Overlay({ children, view }) {
  return (
    <div
      className={`${view === 'account' ? ' top-0 left-0 right-0 bottom-30 bg-primary-800' : 'backdrop-blur-[5px] inset-0'} fixed  z-10 grid place-items-center`}
    >
      {children}
    </div>
  );
}

export default Overlay;
