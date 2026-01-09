'use client';

import { useDispatch, useSelector } from 'react-redux';

export default function PurchaseQuanity({ id, view }) {
  const cart = useSelector((state) => state.cart.cart);
  const purchaseQuantity = cart.filter((item) => item.id === id)?.at(0)?.quantity;

  const dispatch = useDispatch();

  if (!purchaseQuantity) return null;

  return (
    <span
      className={`w-max ${view?.toLowerCase() !== 'cart' ? 'absolute top-2 left-2' : ''} text-primary-800`}
    >
      Qty.
      <span className={`text-blue-500`}> {purchaseQuantity}</span>
    </span>
  );
}
