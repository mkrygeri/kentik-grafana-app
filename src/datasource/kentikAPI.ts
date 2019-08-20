import * as _ from 'lodash';
import angular from 'angular';
import { getRegion } from './regionHelper';
import { showAlert } from '../datasource/alertHelper';

export class KentikAPI {
  baseUrl: string;
  apiReady: boolean;
  region?: string;
  /** @ngInject */
  constructor(public backendSrv: any, public $http: any) {
    this.apiReady = false;
    this.baseUrl = '/api/plugin-proxy/kentik-app';
  }

  private async _getRegionFromDatasource(): Promise<void> {
    const allDatasources = await this.backendSrv.get('/api/datasources');

    this.region = getRegion(allDatasources);
    this.apiReady = true;
  }

  setRegion(region: string) {
    this.region = region;
  }

  async getDevices() {
    const resp = await this._get('/api/v5/devices');

    if (resp.data && resp.data.devices) {
      return resp.data.devices;
    } else {
      return [];
    }
  }

  async getUsers() {
    return this._get('/api/v5/users');
  }

  getFieldValues(field: string) {
    const query = `SELECT DISTINCT ${field} FROM all_devices ORDER BY ${field} ASC`;
    return this.invokeSQLQuery(query);
  }

  async getCustomDimensions() {
    const data = await this._get('/api/v5/customdimensions');
    return data.data.customDimensions;
  }

  async getSavedFilters() {
    const data = await this._get('/api/v5/saved-filters');
    return data.data;
  }

  invokeTopXDataQuery(query: any) {
    const kentikV5Query = {
      queries: [{ query: query, bucketIndex: 0 }],
    };

    return this._post('/api/v5/query/topXdata', kentikV5Query);
  }

  invokeSQLQuery(query: any) {
    const data = {
      query: query,
    };

    return this._post('/api/v5/query/sql', data);
  }

  private async _get(url: string) {
    if (this.region === undefined) {
      await this._getRegionFromDatasource();
    }

    try {
      const resp = await this.$http({
        method: 'GET',
        url: this.baseUrl + '/' + this.region + url,
      });

      return resp;
    } catch (error) {
      showAlert(error);
      if (error.err) {
        throw error.err;
      } else {
        throw error;
      }
    }
  }

  private async _post(url: string, data: any) {
    if (this.region === undefined) {
      await this._getRegionFromDatasource();
    }

    try {
      const resp = await this.$http({
        method: 'POST',
        url: this.baseUrl + '/' + this.region + url,
        data: data,
      });

      if (resp.data) {
        return resp.data;
      } else {
        return [];
      }
    } catch(error) {
      showAlert(error);
      if (error.err) {
        throw error.err;
      } else {
        throw error;
      }
    }
  }
}

angular.module('grafana.services').service('kentikAPISrv', KentikAPI);
