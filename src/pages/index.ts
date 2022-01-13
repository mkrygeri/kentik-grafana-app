import { AppRootProps } from '@grafana/data';
import { A } from './A';

export type PageDefinition = {
  component: React.FC<AppRootProps>;
  icon: string;
  id: string;
  text: string;
};

export const pages: PageDefinition[] = [
  {
    component: A,
    icon: 'file-alt',
    id: 'a',
    text: 'Tab A',
  }
];
