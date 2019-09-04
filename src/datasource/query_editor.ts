import { QueryCtrl } from 'grafana/app/plugins/sdk';


class KentikQueryCtrl extends QueryCtrl {
  static templateUrl: string;
  queryModes: any[];
  metricSegment: any;
  deviceSegment: any;
  unitSegment: any;

  /** @ngInject */
  constructor($scope, $injector, public uiSegmentSrv) {
    super($scope, $injector);

    this.target.mode = this.target.mode || 'graph';

    this.queryModes = [{ value: 'graph', text: 'Graph' }, { value: 'table', text: 'Table' }];

    this.metricSegment = this.uiSegmentSrv.newSegment({ value: 'select metric', fake: true });
    this.deviceSegment = this.uiSegmentSrv.newSegment({ value: 'select device', fake: true });
    this.unitSegment = this.uiSegmentSrv.newSegment({ value: 'select unit', fake: true });
  }

  async getMetrics() {
    const metrics = await this.datasource.metricFindQuery('metrics()');

    return this.uiSegmentSrv.transformToSegments(true)(metrics);
  }

  async getDevices() {
    const devices = await this.datasource.metricFindQuery('devices()');

    return this.uiSegmentSrv.transformToSegments(true)(devices);
  }

  async getUnits() {
    const units = await this.datasource.metricFindQuery('units()');

    return this.uiSegmentSrv.transformToSegments(true)(units);
  }

  async onMetricChange() {
    const isVariable = this.metricSegment.value.indexOf('$') === 0;
    if(isVariable) {
      this.target.metric = this.metricSegment.value;
    } else {
      this.target.metric = await this.datasource.getMetricValueByName(this.metricSegment.value);
    }

    this.panelCtrl.refresh();
  }

  async onDeviceChange() {
    this.target.device = this.deviceSegment.value;

    this.panelCtrl.refresh();
  }

  async onUnitChange() {
    const isVariable = this.unitSegment.value.indexOf('$') === 0;
    if(isVariable) {
      this.target.unit = this.unitSegment.value;
    } else {
      this.target.unit = await this.datasource.getUnitValueByName(this.unitSegment.value);
    }

    this.panelCtrl.refresh();
  }
}

KentikQueryCtrl.templateUrl = 'datasource/query_editor.html';

export { KentikQueryCtrl };
