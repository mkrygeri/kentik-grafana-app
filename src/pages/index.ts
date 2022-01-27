import { AddDevice } from './AddDevice';
import { DeviceList } from './DeviceList';

import { AppRootProps } from '@grafana/data';

export type PageDefinition = {
  component: React.FC<AppRootProps>;
  icon: string;
  id: string;
  text: string;
};

export const pages: PageDefinition[] = [
  {
    component: DeviceList,
    icon: 'file-alt',
    id: 'device-list',
    text: 'Device List',
  },
];

export const extendedPages: PageDefinition[] = [
  ...pages,
  {
    component: AddDevice,
    icon: 'file-alt',
    id: 'add-device',
    text: 'Add Device',
  },
]
