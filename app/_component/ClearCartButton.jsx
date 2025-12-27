import ClearCartPrompt from './ClearCartPrompt';

import Button from '@mui/material/Button';
import { Modal, Open, Window } from './Modal';
export default function CartCartWindow({ onClose }) {
  return (
    <Modal>
      <Open name={'clearCartWindow'}>
        <Button
          variant="outlined"
          type="submit"
          color="error"
          className=" text-lg p-6  transition-colors rounded-md mt-6 h-min w-[10rem]"
        >
          clear
        </Button>
      </Open>
      <Window name={'clearCartWindow'}>
        <ClearCartPrompt />
      </Window>
    </Modal>
  );
}
