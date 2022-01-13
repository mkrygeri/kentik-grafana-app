import { ComponentClass } from 'react';
import { AppPlugin, AppRootProps } from '@grafana/data';
import { ExampleRootPage } from './ExampleRootPage';

import './styles/dark.scss';
import './styles/light.scss';

import { ConfigCtrl } from './config/config';
import { loadPluginCss } from 'grafana/app/plugins/sdk';

loadPluginCss({
  dark: 'plugins/kentik-connect-app/styles/dark.css',
  light: 'plugins/kentik-connect-app/styles/light.css',
});

export { ConfigCtrl };

export const plugin = new AppPlugin<{}>()
  .setRootPage((ExampleRootPage as unknown) as ComponentClass<AppRootProps>)
