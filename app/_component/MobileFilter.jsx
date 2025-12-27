import { LuFilter } from 'react-icons/lu';
import { Modal, Open, Window } from './Modal';
import TagFilter from './TagFilter';

export default function MobileFilter({ expand, specialSpecies, view }) {
  return (
    <Modal>
      <Open name={'mobileFilter'}>
        <button className="bg-white h-[min-content] w-[min-content] m-2 p-2 rounded flex items-center gap-2 hover:bg-gray-200">
          <LuFilter />
        </button>
      </Open>
      <Window name={'mobileFilter'}>
        <TagFilter expand={expand} specialSpecies={specialSpecies} view={view} />
      </Window>
    </Modal>
  );
}
