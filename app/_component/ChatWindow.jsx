'use client';
export default function ChatWindow({ header, open, cancelChat }) {
  function handleSubmit(event) {
    event.preventDefault();
    // Handle form submission logic here
  }

  if (!open) return null;

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="grid grid-row grid-rows-[auto_1fr_auto] h-full w-full z-100 text-primary-900"

      >
        <h1 className="h-min inline-block m-1 text-center">{header}</h1>
        <div className="overflow-y-auto border-t border-primary-500 flex-1 p-2">
          <li>hello</li>
          <li>hello</li>
          <li>hello</li>
          <li>hello</li>
          <li>hello</li>
          <li>hello</li>
        </div>
        <div className="flex flex-col mt-auto">
          <input
            type="text"
            placeholder="Type a message..."
            className="w-45 bg-white self-center flex border border-b-amber-300 border-l-amber-200 border-t-amber-100 border-r-amber-50 px-1 py-.5 rounded-[5px] focus:outline-none  transition-all duration-200"
          />
          <div className="flex justify-between px-2 py-1">
            <button
              className="text-[10px] cursor-pointer border border-red-500 rounded-2xl px-2 py-1 bg-red-100 text-red-400 hover:bg-red-200 hover:-translate-y-[2px] active:translate-y-0transition-all duration-150"
              onClick={() => cancelChat(!open)}
            >
              Cancel
            </button>
            <button className="text-[10px] cursor-pointer border border-blue-500 rounded-2xl px-2 py-1 bg-blue-100 text-blue-400 hover:bg-blue-200 hover:-translate-y-[2px] active:translate-y-0transition-all duration-150">
              Send
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
