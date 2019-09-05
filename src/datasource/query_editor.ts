import { QueryCtrl } from 'grafana/app/plugins/sdk';
import { UiSegmentSrv, MetricSegment } from 'grafana/app/core/services/segment_srv';

class KentikQueryCtrl extends QueryCtrl {
  static templateUrl: string;
  queryModes: Array<{ value: string; text: string }>;
  metricSegment: MetricSegment;
  deviceSegment: MetricSegment;
  unitSegment: MetricSegment;

  /** @ngInject */
  constructor($scope, $injector, public uiSegmentSrv: UiSegmentSrv) {
    super($scope, $injector);

    this.target.mode = this.target.mode || 'graph';

    this.queryModes = [{ value: 'graph', text: 'Graph' }, { value: 'table', text: 'Table' }];

    if (this.target.metric === undefined) {
      this.metricSegment = this.uiSegmentSrv.newSegment({ value: 'select metric', fake: true });
    } else {
      const metric = this.datasource.findMetric({ value: this.target.metric });
      if (metric !== null) {
        this.metricSegment = this.uiSegmentSrv.newSegment({ value: metric.text });
      } else {
        this.metricSegment = this.uiSegmentSrv.newSegment({ value: this.target.metric });
      }
    }

    if (this.target.device === undefined) {
      this.deviceSegment = this.uiSegmentSrv.newSegment({ value: 'select device', fake: true });
    } else {
      this.deviceSegment = this.uiSegmentSrv.newSegment({ value: this.target.device });
    }

    if (this.target.unit === undefined) {
      this.unitSegment = this.uiSegmentSrv.newSegment({ value: 'select unit', fake: true });
    } else {
      const unit = this.datasource.findUnit({ value: this.target.unit });
      if (unit !== null) {
        this.unitSegment = this.uiSegmentSrv.newSegment({ value: unit.text });
      } else {
        this.unitSegment = this.uiSegmentSrv.newSegment({ value: this.target.unit });
      }
    }
  }

  async getMetrics(): Promise<MetricSegment[]> {
    const metrics = await this.datasource.metricFindQuery('metrics()');

    return this.uiSegmentSrv.transformToSegments(true)(metrics);
  }

  async getDevices(): Promise<MetricSegment[]> {
    const devices = await this.datasource.metricFindQuery('devices()');

    return this.uiSegmentSrv.transformToSegments(true)(devices);
  }

  async getUnits(): Promise<MetricSegment[]> {
    const units = await this.datasource.metricFindQuery('units()');

    return this.uiSegmentSrv.transformToSegments(true)(units);
  }

  async onMetricChange(): Promise<void> {
    const metric = await this.datasource.findMetric({ text: this.metricSegment.value });
    if (metric !== null) {
      this.target.metric = metric.value;
    } else {
      this.target.metric = this.metricSegment.value;
    }

    this.panelCtrl.refresh();
  }

  async onDeviceChange(): Promise<void> {
    this.target.device = this.deviceSegment.value;

    this.panelCtrl.refresh();
  }

  async onUnitChange(): Promise<void> {
    const unit = await this.datasource.findUnit({ text: this.unitSegment.value });
    if (unit !== null) {
      this.target.unit = unit.value;
    } else {
      this.target.unit = this.unitSegment.value;
    }

    this.panelCtrl.refresh();
  }
}

KentikQueryCtrl.templateUrl = 'datasource/query_editor.html';

export { KentikQueryCtrl };
