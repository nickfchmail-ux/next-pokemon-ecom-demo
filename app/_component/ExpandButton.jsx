import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';

export default function ExpandButton({ expand, setExpand }) {
  return (
    <button
      className="bg-amber-50 text-black mr-5 flex self-start mt-1"
      onClick={() => setExpand(!expand)}
    >
      {expand ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
    </button>
  );
}
