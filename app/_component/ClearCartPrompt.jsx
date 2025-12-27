'use client';
import Button from '@mui/material/Button';
import { useDispatch } from 'react-redux';
import { clearCart } from '../_state/_global/cart/CartSlice';
export default function ClearCartPrompt({ onClose }) {
  const dispatch = useDispatch();
  return (
    <div className={`p-5 bg-amber-100 shadow-xl rounded-2xl`}>
      <h1 className={`mb-3 max-w-[80%] mx-auto text-amber-800`}>
        Do you want to clear all the items in your cart?
      </h1>
      <div className={`flex gap-2 justify-between  max-w-[60%] mx-auto`}>
        <Button onClick={onClose} variant="outlined" color="error">
          No
        </Button>
        <Button
          variant="outlined"
          onClick={(e) => {
            e.preventDefault();
            dispatch(clearCart());
            onClose();
          }}
        >
          Yes
        </Button>
      </div>
    </div>
  );
}
