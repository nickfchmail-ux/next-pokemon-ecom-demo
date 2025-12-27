"use client";

import { CiShop } from "react-icons/ci";
import NavOption from "./NavOption";
const navigation = [
  { path: "/about", label: "About", icon: null },
  { path: "/shop", label: "Shop", icon: <CiShop /> },
  { path: "/contact", label: "Contact" },
  { path: "/cart", label: "Cart" },
  { path: "/account", label: "Account" },
];

function NavigationLink({ view, onClose }) {

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
          />
        );
      })}
    </>
  );
}

export default NavigationLink;
