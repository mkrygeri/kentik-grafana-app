import { AppRootProps } from '@grafana/data';
import { AddDevice } from './AddDevice';

export type PageDefinition = {
  component: React.FC<AppRootProps>;
  icon: string;
  id: string;
  text: string;
};

export const pages: PageDefinition[] = [
  {
    component: AddDevice,
    icon: 'file-alt',
    id: 'add-device',
    text: 'Add Device',
  }
];
