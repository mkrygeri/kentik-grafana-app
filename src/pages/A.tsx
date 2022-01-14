import { AppRootProps } from '@grafana/data';
import React, { FC } from 'react';

export const A: FC<AppRootProps> = (props) => {
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
