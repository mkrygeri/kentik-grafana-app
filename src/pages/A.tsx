import { KentikAPI } from '../datasource/kentik_api';

import { AppRootProps } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import React, { FC, useState, useEffect } from 'react';

export const A: FC<AppRootProps> = (props) => {
  const [devices] = useState();

  useEffect(() => {
    const fetchData = async () => {
      const backendSrv: any = await getBackendSrv();
      console.log('backendSrv', backendSrv, KentikAPI);
      const kentik = new KentikAPI(backendSrv);
      console.log('kentik', kentik);
      let devices = await kentik.getDevices();
      console.log('devices', devices);
      // setDevices(devices);
    }

    fetchData();
  }, []);

  console.log('devices', devices);
  function readProps(): void {
    console.log('props', props);
  }

  return (
    <div>
      <ul>
        <li>
          <a href={props.path + '?x=1'} onClick={readProps}>Change query to 1</a>
        </li>
        <li>
          <a href={props.path + '?x=AAA'}>Change query to AAA</a>
        </li>
        <li>
          <a href={props.path + '?x=1&y=2&y=3'}>Put multiple properties into the query</a>
        </li>
      </ul>
      <br />
      QUERY: <pre>{JSON.stringify(props.query)}</pre>
      <br />
      Stored configuration data:
      <pre>{JSON.stringify(props.meta.jsonData)}</pre>
    </div>
  );
};
