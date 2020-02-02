import * as React from 'react';
import * as Icons from '@material-ui/icons';

export const icons = [
  {
    name: 'Devices',
    icon: className => {
      return <Icons.ImportantDevices className={className} />;
    },
  },
  {
    name: 'Customers',
    icon: className => {
      return <Icons.TransferWithinAStation className={className} />;
    },
  },
  {
    name: 'Inventory',
    icon: className => {
      return <Icons.PlaylistAddCheck className={className} />;
    },
  },
  {
    name: 'Discounts',
    icon: className => {
      return <Icons.LocalOffer className={className} />;
    },
  },
  {
    name: 'Users',
    icon: className => {
      return <Icons.People className={className} />;
    },
  },
  {
    name: 'Account Settings',
    icon: className => {
      return <Icons.SettingsRounded className={className} />;
    },
  },
  {
    name: 'Suppliers',
    icon: className => <Icons.AssignmentInd className={className} />,
  },
  { name: 'Locations', icon: className => <Icons.Home className={className} /> },
  {
    name: 'Products',
    icon: className => <Icons.ShoppingBasket className={className} />,
  },
  {
    name: 'Documents',
    icon: className => <Icons.FolderOpen className={className} />,
  },
  {
    name: 'Customer Checkin',
    icon: className => <Icons.PersonAdd className={className} />,
  },
  {
    name: 'Customer Queue',
    icon: className => <Icons.PersonAdd className={className} />,
  },
];
