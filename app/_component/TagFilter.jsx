"use client";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IoMdExit } from "react-icons/io";
import { LuFilterX } from "react-icons/lu";
export default function TagFilter({ expand, specialSpecies, view, onClose }) {

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const toggleTag = (tag) => {
    if (params.getAll("tag").includes(tag)) {
      // Remove specific tag
      params.delete("tag"); // Clear all
      params
        .getAll("tag")
        .filter((t) => t !== tag)
        .forEach((t) => params.append("tag", t));
    } else {
      // Add tag
      params.append("tag", tag);
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const currentTags = searchParams.getAll("tag");

  return (
    <div
      className={
        view !== 'mobile'
          ? `hidden  sm:flex  gap-2 flex-wrap items-center justify-center ${
              expand ? '' : 'max-h-7 overflow-hidden'
            }`
          : 'relative flex  gap-2 flex-wrap items-center justify-center bg-gray-800 p-2'
      }
    >
      {[
        'bug',
        'dark',
        'dragon',
        'electric',
        'fairy',
        'fighting',
        'fire',
        'flying',
        'ghost',
        'grass',
        'ground',
        'ice',
        'normal',
        'poison',
        'psychic',
        'rock',
        'steel',
        'water',
      ].map((tag) => {
        return (
          <Image
            key={tag}
            alt={tag}
            width={100}
            height={100}
            src={`/${tag}.png`}
            onClick={() => toggleTag(tag)}
            className={` rounded cursor-pointer z-10000 ${
              currentTags.includes(tag)
                ? ' border-2 border-blue-600 inset-shadow-lg scale-100'
                : 'bg-white border border-gray-300 scale-68'
            } ${
              specialSpecies.includes(tag)
                ? ''
                : 'opacity-30 cursor-not-allowed pointer-events-none'
            }`}
          />
        );
      })}
      {currentTags.length > 0 ? (
        <button
          className="flex gap-[3px] text-red-600 items-center justify-baseline text-center border border-red-600 px-2 py-[1px] rounded hover:bg-red-100 text-[10px]"
          onClick={() => {
            params.delete('tag');
            router.push(`${pathname}?${params.toString()}`);
          }}
        >
          <LuFilterX />
        </button>
      ) : null}

      {view === 'mobile' ? (
        <button className="absolute top-2 right-1 text-white cursor-pointer" onClick={onClose}>
          <IoMdExit className="size-5" />
        </button>
      ) : null}
    </div>
  );
}
