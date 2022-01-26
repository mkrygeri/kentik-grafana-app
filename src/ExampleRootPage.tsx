import { AppRootProps } from '@grafana/data';
import { pages } from './pages';
import React, { useEffect, useMemo, useState, } from 'react';
import { useNavModel } from './utils/hooks';
import { KentikAPI } from './datasource/kentik_api';

import { getBackendSrv } from '@grafana/runtime';

import * as _ from 'lodash';


export const ExampleRootPage = React.memo(function ExampleRootPage(props: AppRootProps) {
  const {
    path,
    onNavChanged,
    query: { tab },
    meta,
  } = props;

  let pagesCopy = _.clone(pages);

  const [state, setState] = useState({
    devices: null
  });

  const backendSrv = getBackendSrv();
  const kentik = new KentikAPI(backendSrv);

  async function fetchDevices(): Promise<void> {
    if(state.devices === null) {
      return;
    }
    let devices = await kentik.getDevices();

    if(devices.length > 0) {
      pagesCopy = pagesCopy.filter(page => page.id !== 'add-device');
      console.log('pagesCopy', pagesCopy)
    }
    setState({
      devices
    });
    console.log(state);
  }
  // Required to support grafana instances that use a custom `root_url`.
  const pathWithoutLeadingSlash = path.replace(/^\//, '');

  // Update the navigation when the tab or path changes
  const navModel = useNavModel(
    useMemo(() => ({ tab, pages: pagesCopy, path: pathWithoutLeadingSlash, meta }), [meta, pathWithoutLeadingSlash, tab, state.devices])
  );
  useEffect(() => {
    fetchDevices();
    onNavChanged(navModel);
  }, [navModel, onNavChanged]);

  const Page = pagesCopy.find(({ id }) => id === tab)?.component || pagesCopy[0].component;
  return <Page {...props} path={pathWithoutLeadingSlash} />;
});
