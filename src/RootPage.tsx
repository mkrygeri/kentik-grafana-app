import { pages } from './pages';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavModel } from './utils/hooks';
import { KentikAPI } from './datasource/kentik_api';

import { AppRootProps } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';

import * as _ from 'lodash';


export const RootPage = React.memo(function RootPage(props: AppRootProps) {
  const {
    path,
    onNavChanged,
    query: { tab },
    meta,
  } = props;

  const [state, setState] = useState({
    devices: null
  });

  const backendSrv = getBackendSrv();
  const kentik = new KentikAPI(backendSrv);

  async function fetchDevices(): Promise<void> {
    if(state.devices !== null) {
      return;
    }
    let devices = await kentik.getDevices();

    setState({
      ...state,
      devices
    });
  }
  // Required to support grafana instances that use a custom `root_url`.
  const pathWithoutLeadingSlash = path.replace(/^\//, '');

  // Update the navigation when the tab or path changes
  const navModel = useNavModel(
    useMemo(() => ({ tab, pages: pages, path: pathWithoutLeadingSlash, meta }), [meta, pathWithoutLeadingSlash, tab, pages])
  );

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    onNavChanged(navModel);
  }, [navModel, onNavChanged, pages]);

  const Page = pages.find(({ id }) => id === tab)?.component || pages[0].component;
  return <Page {...props} path={pathWithoutLeadingSlash} />;
});
