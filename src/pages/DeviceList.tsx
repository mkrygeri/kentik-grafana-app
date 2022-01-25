import { KentikAPI } from '../datasource/kentik_api';

import { getBackendSrv } from '@grafana/runtime';
import { AppRootProps } from '@grafana/data';
import React, { FC, useEffect, useState  } from 'react';


export const DeviceList: FC<AppRootProps> = ({ query, path, meta }) => {
  const [state, setState] = useState({
    pageReady: false,
    devices: []
  });

  const backendSrv = getBackendSrv();
  const kentik = new KentikAPI(backendSrv);

  useEffect(() => {
    fetchDevices();
  }, []);

  async function fetchDevices(): Promise<void> {
    let devices = await kentik.getDevices();
    setState({
      pageReady: true,
      devices
    });

    console.log(state);
  }

  // function gotoDashboard(device: any): void {
  //   console.log('gotoDashboard', device);
  //   // window.location.path('/dashboard/db/kentik-top-talkers').search({ 'var-device': device.device_name });
  // }

  // function gotoDeviceDetail(device: any): void {
  //   console.log('gotoDeviceDetail', device);
  //   // window.location.url('/plugins/kentik-connect-app/page/device-details?device=' + device.id);
  // }


  return (
    <div>
      <div className="page-header">
        <h1 className="rt-h1">Kentik Connect: Devices</h1>
      </div>

      <div ng-if="!ctrl.pageReady" className="kentik-loading-message-container">
        <div className="kentik-loading-message-inside">
          {/* inline styles */}
          <img className="kentik-loading-pulse" src="public/plugins/kentik-connect-app/img/loading-pulse.svg"></img>
          <p className="kentik-loading-msg-1">To infinity...and beyond.</p>
          <p className="kentik-loading-msg-2">This is taking longer than expected.</p>
          <p className="kentik-loading-msg-3">We apologize, something may be up. Please try refreshing first, and contact us if
            this continues to happen.</p>
        </div>
      </div>

      <div ng-if="ctrl.pageReady">
        <div ng-if="ctrl.devices.length === 0" className="kentik-empty-device-list">
          {/* inline styles */}
          <div>
            <i ng-className="icon" className="icon-gf icon-gf-endpoint no-endpoints"></i>
            <p>Looks like you don’t have any devices yet.<br />
              <a className="highlight-word" href="plugins/kentik-connect-app/pages/add-device">Add a new device</a>
            </p>
          </div>
          <a href="#" ng-click="ctrl.showDeviceDesc = !ctrl.showDeviceDesc">
            <span ng-hide="ctrl.showDeviceDesc">What's a device?</span>
            <span><i className="fa fa-caret-right rt-box-accordian-control" ng-hide="ctrl.showDeviceDesc"></i></span>
            <span ng-show="ctrl.showDeviceDesc">What's a device?</span>
            <span><i className="fa fa-caret-down" ng-show="ctrl.showDeviceDesc"></i></span>
          </a>
          <div className="kentik-connect-app-devicedesc-box" ng-className="{ 'kentik-connect-app-devicedesc-open': ctrl.showDeviceDesc }">
            <div className="kentik-collapse-blurb-box">
              <p className="kentik-helper-blurb">Devices in Kentik are sources of network flow data - commonly a network
                component such as a switch or router, or a flow generation agent on a host/server. </p>
              <p className="kentik-helper-blurb">Once configured, Kentik will automatically begin tracking and returning direct
                insights from that source viewpoint into exactly which applications and endpoints are actively driving
                network traffic.</p>
            </div>
          </div>
        </div>
      </div>

      <section ng-if="ctrl.devices.length > 0" className="card-section card-list-layout-list" layout-mode>
        <ol className="card-list">
          <li className="card-item-wrapper card-item-wrapper--clickable" ng-repeat="device in ctrl.devices | orderBy:'device_name'">
            <div className="card-item pointer" ng-click="ctrl.gotoDashboard(device)">
              <div className="card-item-header card-item-header--kentik-icons card-item-header-action">
                <a ng-click="$event.stopPropagation();" href="dashboard/db/kentik-top-talkers?var-device={{device.device_name}}">
                  <i ng-className="icon" className="icon-gf icon-gf-dashboard" bs-tooltip="'Go to Top Talkers</br>dashboard for {{device.device_name}}'"></i>
                </a>
                <a ng-click="$event.stopPropagation();" href="plugins/kentik-connect-app/page/device-details?device={{device.id}}">
                  <i ng-className="icon" className="icon-gf icon-gf-settings" bs-tooltip="'Configure {{device.device_name}}'"></i>
                </a>
              </div>
              <div className="card-item-body">
                <div className="card-item-details">
                  <a ng-click="$event.stopPropagation();" href="dashboard/db/kentik-top-talkers?var-device={{device.device_name}}">
                    <div className="card-item-name">
                      {/* {{ device.device_name }} */}
                    </div>
                    <div className="card-item-sub-name">
                      {/* <span className="card-item-sub-name--header">{{ device.device_type }}: </span> {{ device.device_description }} */}
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </li>
        </ol>
      </section>
    </div>
  );
};
