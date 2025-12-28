'use client';
import { useSelector } from 'react-redux';
import CartList from './CartList';
import CartSummary from './CartSummary';
export default function CartView({ children }) {
  const hasCartItem = useSelector((state) => state.cart.cart).length > 0;
  const { cartFromDatabase, user } = children;

  return (
    <div
      className={`bg-yellow-200 flex flex-col ${hasCartItem ? 'md:grid md:grid-cols-[2fr_1fr] h-[80vh]  flex overflow-hidden' : ''} h-[86vh]`}
    >
      <CartList cartData={cartFromDatabase} />

      <CartSummary user={user} />
    </div>
  );
}
