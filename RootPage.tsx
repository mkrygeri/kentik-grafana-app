import { pages, extendedPages } from './pages';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavModel } from './utils/hooks';
import { KentikAPI } from './datasource/kentik_api';

import { AppRootProps } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';

import * as _ from 'lodash';


export const ExampleRootPage = React.memo(function ExampleRootPage(props: AppRootProps) {
  const {
    path,
    onNavChanged,
    query: { tab },
    meta,
  } = props;

  const [state, setState] = useState({
    devices: null,
    pages: _.clone(pages)
  });

  const backendSrv = getBackendSrv();
  const kentik = new KentikAPI(backendSrv);

  async function fetchDevices(): Promise<void> {
    if(state.devices !== null) {
      return;
    }
    let devices = await kentik.getDevices();

    let pages = state.pages;
    if(devices.length === 0) {
      pages = _.clone(extendedPages);
    }
    setState({
      devices,
      pages
    });
  }
  // Required to support grafana instances that use a custom `root_url`.
  const pathWithoutLeadingSlash = path.replace(/^\//, '');

  // Update the navigation when the tab or path changes
  const navModel = useNavModel(
    useMemo(() => ({ tab, pages: state.pages, path: pathWithoutLeadingSlash, meta }), [meta, pathWithoutLeadingSlash, tab, state.pages])
  );

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    onNavChanged(navModel);
  }, [navModel, onNavChanged, state.pages]);

  const Page = state.pages.find(({ id }) => id === tab)?.component || state.pages[0].component;
  return <Page {...props} path={pathWithoutLeadingSlash} />;
});
