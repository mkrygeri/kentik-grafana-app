/* eslint-disable */
import { KentikAPI } from './kentik_api';

import * as _ from 'lodash';
import * as moment from 'moment';

function getUTCTimestamp() {
  const ts = new Date();
  return ts.getTime() + ts.getTimezoneOffset() * 60 * 1000;
}

// Get hash of Kentik query
function getHash(queryObj: any) {
  const query = _.cloneDeep(queryObj);
  query.starting_time = null;
  query.ending_time = null;
  return JSON.stringify(query);
}

// Prevent too frequent queries
function getMaxRefreshInterval(query: any) {
  const interval: any = Date.parse(query.ending_time) - Date.parse(query.starting_time);
  if (interval > moment.duration(1, 'months')) {
    return 60 * 60 * 1000; // 1 hour
  } else if (interval > moment.duration(1, 'day')) {
    return 15 * 60 * 1000; // 15 min
  } else {
    return 5 * 60 * 1000; // 5 min
  }
}

export class KentikProxy {
  cache: any;
  cacheUpdateInterval: number;
  requestCachingIntervals: { '1d': number };

  constructor(private kentikAPISrv: KentikAPI) {
    this.cache = {};
    this.cacheUpdateInterval = 5 * 60 * 1000; // 5 min by default
    this.requestCachingIntervals = {
      '1d': 0,
    };
  }

  async invokeTopXDataQuery(query: any): Promise<any> {
    query.hostname_lookup = this.hostnameLookupToBoolean(query.hostname_lookup);
    const cachedQuery = _.cloneDeep(query);
    const hash = getHash(cachedQuery);

    if (this.shouldInvoke(query)) {
      // Invoke query
      const result = await this.kentikAPISrv.invokeTopXDataQuery(query);
      const timestamp = getUTCTimestamp();

      if (query.hostname_lookup) {
        const resultData = result.results[0].data;
        resultData.forEach((row: any) => {
          if (row.lookup !== undefined) {
            row.key = row.lookup;
          }
        });
      }

      this.cache[hash] = {
        timestamp: timestamp,
        query: cachedQuery,
        result: result,
      };
      return result;
    } else {
      // Get from cache
      return this.cache[hash].result;
    }
  }

  // Decide, if query should be invoked or get data from cache?
  shouldInvoke(query: any) {
    const kentikQuery = query;
    const hash = getHash(kentikQuery);
    const timestamp = getUTCTimestamp();

    const startingTime = Date.parse(kentikQuery.starting_time);
    const endingTime = Date.parse(kentikQuery.ending_time);
    const queryRange = endingTime - startingTime;

    const cacheStartingTime = this.cache[hash] ? Date.parse(this.cache[hash].query.starting_time) : null;
    const cacheEndingTime = this.cache[hash] ? Date.parse(this.cache[hash].query.ending_time) : null;
    const cachedQueryRange = cacheEndingTime! - cacheStartingTime!;

    const maxRefreshInterval = getMaxRefreshInterval(kentikQuery);

    return (
      !this.cache[hash] ||
      timestamp - endingTime > maxRefreshInterval ||
      (this.cache[hash] &&
        (timestamp - cacheEndingTime! > maxRefreshInterval ||
          startingTime < cacheStartingTime! ||
          Math.abs(queryRange - cachedQueryRange) > 60 * 1000)) // is time range changed?
    );
  }

  async getDevices() {
    if (this.cache.devicesPromise !== undefined) {
      return this.cache.devicesPromise;
    }
    this.cache.devicesPromise = this.kentikAPISrv.getDevices();
    return this.cache.devicesPromise;
  }

  async getSites() {
    if (this.cache.sitesPromise !== undefined) {
      return this.cache.sitesPromise;
    }
    this.cache.sitesPromise = this.kentikAPISrv.getSites();
    return this.cache.sitesPromise;
  }

  async getFieldValues(field: string) {
    let ts = getUTCTimestamp();
    if (this.cache[field] && ts - this.cache[field].ts < this.cacheUpdateInterval) {
      return this.cache[field].value;
    } else {
      const result = await this.kentikAPISrv.getFieldValues(field);
      ts = getUTCTimestamp();
      this.cache[field] = {
        ts: ts,
        value: result,
      };

      return result;
    }
  }

  async getCustomDimensions() {
    if (this.cache.customDimensions === undefined) {
      const customDimensions = await this.kentikAPISrv.getCustomDimensions();
      this.cache.customDimensions = customDimensions.map((dimension: any) => ({
        values: this._getDimensionPopulatorsValues(dimension),
        text: `Custom ${dimension.display_name}`,
        value: dimension.name,
        field: dimension.name,
      }));
    }
    return this.cache.customDimensions;
  }

  async getSavedFilters() {
    if (this.cache.savedFilters === undefined) {
      const savedFilters = await this.kentikAPISrv.getSavedFilters();
      this.cache.savedFilters = _.map(savedFilters, (filter) => ({
        text: `Saved ${filter.filter_name}`,
        field: filter.filter_name,
        id: filter.id,
      }));
    }
    return this.cache.savedFilters;
  }

  private _getDimensionPopulatorsValues(dimension: any) {
    return dimension.populators.reduce((values: any, populator: any) => {
      values.push(populator.value);
      return values;
    }, []);
  }

  private hostnameLookupToBoolean(choice: string): boolean {
    return choice === 'enabled' ? true : false;
  }
}
