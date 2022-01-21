// import { KentikAPI } from '../datasource/kentik_api';

import { AppRootProps } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import React, { FC, useState } from 'react';
import _ from 'lodash';


const defaults = {
  device_name: '',
  device_type: 'router',
  device_description: '',
  device_flow_type: 'sflow',
  device_sample_rate: 5,
  sending_ips: '',
  minimize_snmp: false,
  device_bgp_type: 'none',
  device_snmp_ip: '',
  device_snmp_community: '',
};
// TODO: rename to AddDevice
export const A: FC<AppRootProps> = (props) => {
  // TODO: this part is for Device List page
  // const [devices, setDevices] = useState();

  // useEffect(() => {
    // const fetchData = async () => {
  //     console.log('backendSrv', backendSrv, KentikAPI);
  //     const kentik = new KentikAPI(backendSrv);
  //     console.log('kentik', kentik);
  //     let devices = await kentik.getDevices();
  //     // console.log('devices', devices);
  //     setDevices(devices);
    // }

  //   fetchData();
  // }, []);

  // console.log('devices', devices);

  const backendSrv = getBackendSrv();

  const [state, setState] = useState({
    device: _.cloneDeep(defaults),
    sendingIps: [{ ip: '1' }]
  })

  function addIP(): void {
    setState({
      ...state,
      sendingIps: _.concat(state.sendingIps, { ip: '2' })
    });
  }

  function removeIP(index: number): void {
    setState({
      ...state,
      sendingIps: _.filter(state.sendingIps, (el, idx) => idx !== index)
    });
  }

  function handleIpChange(event: React.ChangeEvent<HTMLInputElement>, index: number): void {
    console.log('dev', event);
    let ipsForUpdate = state.sendingIps;
    ipsForUpdate[index] = { ip: event.target.value };
    setState({
      ...state,
      sendingIps: ipsForUpdate
    });
  }

  function onDeviceFieldChange(event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>, field: string): void {
    console.log('state', state.device, field);
    let deviceForUpdate = state.device;
    // @ts-ignore
    deviceForUpdate[field] = event.target.value;
    setState({
      ...state,
      device: deviceForUpdate
    });
  }

  async function addDevice(): Promise<void> {
    const ips: string[] = [];
    _.forEach(state.sendingIps, ip => {
      ips.push(ip.ip);
    });
    state.device.sending_ips = ips.join();
    const resp = await backendSrv.post(`/api/plugin-proxy/kentik-connect-app/api/v5/device`, state.device);
    if ('err' in resp) {
      // this.alertSrv.set('Device Add failed.', resp.err, 'error');
      throw new Error(`Device Add failed: ${resp.err}`);
    } else {
      // this.$location.url('/plugins/kentik-connect-app/page/device-list');
    }
  }

  let typeSelector;
  switch(state.device.device_type) {
    case 'router':
      typeSelector = <div className="gf-form">
        <label className="gf-form-label width-11">Flow Type</label>
        <div className="gf-form-select-wrapper">
          <select
            className="gf-form-input gf-size-auto"
            ng-model="ctrl.device.device_flow_type"
            value={state.device.device_flow_type}
            onChange={(event) => onDeviceFieldChange(event, 'device_flow_type')}
          >
            <option value="sflow">sFlow</option>
            <option value="netflow.v5">NetFlow v5</option>
            <option value="netflow.v9">NetFlow v9</option>
            <option value="ipfix">IPFIX</option>
          </select>
        </div>
      </div>
      break;
    case 'host-nprobe-basic':
      typeSelector = <div className="gf-form">
        <label className="gf-form-label width-11">Flow Type</label>
        <div className="gf-form-select-wrapper">
          <select
            className="gf-form-input gf-size-auto"
            value={state.device.device_flow_type}
            onChange={(event) => onDeviceFieldChange(event, 'device_flow_type')}
          >
            <option value="hiresflow">HiresFlow</option>
          </select>
        </div>
      </div>
      break;
    default:
      typeSelector = <div></div>
  }

  return (
    <form name="addDeviceForm">
      <div className="page-header">
        <h1>Add a New Device</h1>
      </div>
      <div className="row">
        <div className="col-md-10">
          <p>Devices in Kentik are sources of network flow data - commonly a network component such as a switch or router, or
            a flow generation agent on a host/server. Once configured, Kentik will automatically begin tracking and returning
            direct insights from that source viewpoint into exactly which applications and endpoints are actively driving
            network traffic.</p>
        </div>
      </div>
      <div className="gf-form-group">
        <div className="gf-form">
          <label className="gf-form-label width-11">Device Name</label>
          <input className="gf-form-input max-width-21" type="text" ng-model="ctrl.device.device_name" pattern="^[A-Za-z0-9_]{1,15}$"
            required />
        </div>
        <div className="gf-form">
          <label className="gf-form-label width-11">Device Type</label>
          <div className="gf-form-select-wrapper">
            <select className="gf-form-input gf-size-auto" ng-model="ctrl.device.device_type">
              <option value="router">Router</option>
              <option value="host-nprobe-basic">Host</option>
            </select>
          </div>
        </div>
      </div>

      <div className="gf-form-group">
        <div className="gf-form">
          <label className="gf-form-label width-11">Description</label>
          <input className="gf-form-input max-width-21" type="text" ng-model="ctrl.device.device_description" />
        </div>
        {typeSelector}
        <div className="gf-form">
          <label className="gf-form-label width-11">Sample Rate</label>
          <input
            className="gf-form-input max-width-5"
            type="number"
            required
            value={state.device.device_sample_rate}
            onChange={(event) => onDeviceFieldChange(event, 'device_sample_rate')}
          />
        </div>
        {
          state.sendingIps.map((ip, index) => {
            return <div className="gf-form">
              <label className="gf-form-label width-11">Source Address</label>
              <input className="gf-form-input max-width-15" type="text" value={ip.ip} onChange={(event) => handleIpChange(event, index)} required />
              
              {
                index === 0 ?
                <a className="btn btn-inverse btn-small" onClick={addIP}><i className="fa fa-plus"></i></a> :
                <a className="btn btn-inverse btn-small" onClick={() => removeIP(index)}><i className="fa fa-minus"></i></a>
              }
            </div>;
          })
        }
      </div>
      <div className="gf-form-group">
        <div className="gf-form" ng-if="ctrl.device.device_type == 'router'">
          <label className="gf-form-label width-11">SNMP Polling</label>
          <div className="gf-form-select-wrapper">
            <select className="gf-form-input gf-size-auto" ng-model="ctrl.device.minimize_snmp" ng-options="i.v as i.l for i in [{v: true, l: 'Minimum'}, {v: false, l: 'Standard'}]">
            </select>
          </div>
        </div>
        <div className="gf-form" ng-if="ctrl.device.device_type == 'router'">
          <label className="gf-form-label width-11">SNMP Community</label>
          <input className="gf-form-input max-width-15" type="text" ng-model="ctrl.device.device_snmp_community" />
        </div>
        <div className="gf-form" ng-if="ctrl.device.device_type == 'router'">
          <label className="gf-form-label width-11">Device IP</label>
          <input className="gf-form-input max-width-15" type="text" ng-model="ctrl.device.device_snmp_ip" />
        </div>
      </div>
      <div className="gf-form-group">
        <div className="gf-form">
          <label className="gf-form-label width-11">BGP</label>
          <div className="gf-form-select-wrapper">
            <select className="gf-form-input max-width-15" disabled>
              <option>Available with paid acounts</option>
            </select>
          </div>
        </div>
      </div>
      <button type="submit" className="btn btn-success" onClick={addDevice}>Add Device</button>
      <a className="btn btn-link" ng-click="ctrl.cancel();">Cancel</a>
    </form>
  );
};
