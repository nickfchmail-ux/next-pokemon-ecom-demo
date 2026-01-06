"use client";
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  VscAccount,
  VscDesktopDownload,
  VscFilePdf,
  VscSettingsGear,
  VscWatch,
} from 'react-icons/vsc';
import SignOutButton from './SignOutButton';
const SideBar = ({ onClose }) => {
  const pathname = usePathname();
  console.log(pathname);
  const list = (anchor) => {
    const navItems = [
      {
        label: 'Account',
        path: '/account',
        icon: <SwitchAccountIcon />,
      },
      {
        label: 'Profile',
        path: '/account/profile',
        icon: <VscAccount />,
      },
      {
        label: 'Invoice',
        path: '/account/invoice',
        icon: <VscFilePdf />,
      },
      {
        label: 'Delivery',
        path: '/account/delivery',
        icon: <VscDesktopDownload />,
      },

      {
        label: 'Watch',
        path: '/account/watch',
        icon: <VscWatch />,
      },
      {
        label: 'Settings',
        path: '/account/settings',
        icon: <VscSettingsGear />,
      },
    ];

    return (
      <List className="h-full flex flex-col " sx={{ width: 250 }} role="presentation">
        {navItems.map((item) => (
          <ListItem
            key={item.label}
            disablePadding
            className={`${pathname === item.path ? 'bg-amber-300' : ''}`}
          >
            <ListItemButton>
              <Link
                href={item.path}
                className="flex items-center w-full text-inherit "
                onClick={onClose}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </Link>
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem className={`mt-auto `} disablePadding>
          <SignOutButton />
        </ListItem>
      </List>
    );
  };

  return <div className="sidebar">{list('left')}</div>;
};

export default SideBar;
