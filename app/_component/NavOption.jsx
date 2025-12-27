'use client';

import Link from 'next/link';

import MailIcon from '@mui/icons-material/Mail';
import Badge from '@mui/material/Badge';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';

import { useSelector } from 'react-redux';

export default function NavOption({ path, label, index, totalLenght, icon, view, onClose }) {
  const cartQuantity = useSelector((state) => state.cart.cart).reduce(
    (sum, item) => sum + item?.quantity,
    0
  );

  const styles = [
    // Left button
    'flex gap-2 relative inline-flex items-center justify-center rounded-l-full bg-white px-8 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-sky-500 ring-offset-4 ring-offset-slate-50 shadow-md transition-all duration-200',

    // Middle button
    'flex gap-2 relative inline-flex items-center justify-center bg-white px-8 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-sky-500 ring-offset-4 ring-offset-slate-50 shadow-md -ml-px transition-all duration-200',

    // Right button
    'flex gap-2 relative inline-flex items-center justify-center rounded-r-full bg-white px-8 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-sky-500 ring-offset-4 ring-offset-slate-50 shadow-md -ml-px transition-all duration-200',
  ];

  if (view !== 'mobile') {
    switch (index) {
      case 0:
        return (
          <Link href={path} className={`${styles[0]} flex gap-2`}>
            {icon}
            {label}

            {label === 'Cart' && cartQuantity > 0 ? (
              <Stack spacing={2} direction="row">
                <Badge badgeContent={cartQuantity} color="primary">
                  <MailIcon color="action" />
                </Badge>
              </Stack>
            ) : null}
          </Link>
        );

      case totalLenght - 1:
        return (
          <Link href={path} className={`${styles[2]} flex gap-2`}>
            {icon}
            {label}
            {label === 'Cart' && cartQuantity > 0 ? (
              <Stack spacing={2} direction="row">
                <Badge badgeContent={cartQuantity} color="primary">
                  <MailIcon color="action" />
                </Badge>
              </Stack>
            ) : null}
          </Link>
        );
      default:
        return (
          <Link href={path} className={`${styles[1]} flex gap-2`}>
            {icon}
            {label}
            {label === 'Cart' && cartQuantity > 0 ? (
              <Stack spacing={2} direction="row">
                <Badge badgeContent={cartQuantity} color="primary">
                  <MailIcon color="action" />
                </Badge>
              </Stack>
            ) : null}
          </Link>
        );
    }
  }



  return (
    <List>
      <ListItem disablePadding>
        <ListItemButton>
          <Link href={path} onClick={onClose}>
            <div className={`flex gap-2`}>
              <ListItemText primary={label} />
              {label === 'Cart' && cartQuantity > 0 ? (
                <Stack spacing={2} direction="row">
                  <Badge badgeContent={cartQuantity} color="primary">
                    <MailIcon color="action" />
                  </Badge>
                </Stack>
              ) : null}
            </div>
          </Link>
        </ListItemButton>
      </ListItem>
    </List>
  );
}
