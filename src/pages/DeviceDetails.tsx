import { KentikAPI } from '../datasource/kentik_api';

import { getBackendSrv } from '@grafana/runtime';
import { AppRootProps } from '@grafana/data';
import React, { FC, useEffect, useState  } from 'react';


export const DeviceDetails: FC<AppRootProps> = ({ query, path, meta }) => {
  const [state, setState] = useState({
    pageReady: false,
    // TODO: Device type
    devices: [] as any[]
  });

  const backendSrv = getBackendSrv();
  const kentik = new KentikAPI(backendSrv);

  useEffect(() => {
    fetchDevices();
  }, []);

  async function fetchDevices(): Promise<void> {
    let devices = await kentik.getDevices();
    setState({
      ...state,
      pageReady: true,
      devices
    });
  }

  return (
    <div></div>
  );
};
