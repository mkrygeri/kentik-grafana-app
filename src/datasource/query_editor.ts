import { QueryCtrl } from 'grafana/app/plugins/sdk';


class KentikQueryCtrl extends QueryCtrl {
  static templateUrl: string;
  queryModes: any[];
  metricSegment: any;

  /** @ngInject */
  constructor($scope, $injector, public uiSegmentSrv) {
    super($scope, $injector);

    this.target.mode = this.target.mode || 'graph';

    this.queryModes = [{ value: 'graph', text: 'Graph' }, { value: 'table', text: 'Table' }];

    this.metricSegment = this.uiSegmentSrv.newSegment({ value: 'select metric', fake: true });
  }

  async getMetrics() {
    const metrics = await this.datasource.metricFindQuery('metrics()');

    return this.uiSegmentSrv.transformToSegments(true)(metrics);
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
}

KentikQueryCtrl.templateUrl = 'datasource/query_editor.html';

export { KentikQueryCtrl };
