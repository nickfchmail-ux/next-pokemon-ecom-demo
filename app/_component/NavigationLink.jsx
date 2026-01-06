"use client";

import MailOutlineIcon from '@mui/icons-material/MailOutline';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { CiShop } from 'react-icons/ci';
import { IoHomeOutline } from 'react-icons/io5';
import { LiaUserCogSolid } from 'react-icons/lia';
import { Modal, Open, Window } from './Modal';
import NavOption from './NavOption';
import SideBar from './SideBar';
function NavigationLink({ view, onClose, user }) {
  const navigation = [
    { path: '/', label: { computer: 'Home', mobile: <IoHomeOutline size="25px" /> } },
    { path: '/about', label: { computer: 'About', mobile: <QuestionMarkIcon /> } },
    { path: '/shop', label: { computer: 'Shop', mobile: <StorefrontIcon /> }, icon: <CiShop /> },
    { path: '/contact', label: { computer: 'Contact', mobile: <MailOutlineIcon /> } },
    { path: '/cart', label: { computer: 'Cart', mobile: <ShoppingCartCheckoutIcon /> } },
    {
      path: '/account',
      label: {
        computer: 'Account',
        mobile: (
          <Modal>
            {user && (
              <Open name={'account'}>
                <button>
                  <LiaUserCogSolid size="22px" />
                </button>
              </Open>
            )}
            <Window name={'account'}>
              <SideBar />
            </Window>
          </Modal>
        ),
      },
    },
  ];
  return (
    <>
      {navigation.map((link, index) => {
        return (
          <NavOption
            key={link.path}
            path={link.path}
            label={link.label}
            index={index}
            totalLenght={navigation.length}
            view={view}
            onClose={onClose}
            user={user}
          />
        );
      })}
    </>
  );
}

export default NavigationLink;
