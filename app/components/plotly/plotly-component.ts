'use strict'

import * as angular from 'angular'
import * as Plotly from 'plotly.js'

export interface IPlotlyComponentBindingChanges {
  data?: angular.IChangesObject<Partial<Plotly.Data>[]>
}

export class PlotlyComponentController implements angular.IComponentController {
  public data: Partial<Plotly.Data>[] = []
  public layout: Partial<Plotly.Layout>
  public config: Partial<Plotly.Config>
  /* @ngInject */
  constructor(private $element: angular.IAugmentedJQuery) {
  }
  public $onChanges(changes: IPlotlyComponentBindingChanges): void {
    if (changes.data && changes.data.currentValue) {
      Plotly.newPlot(this.$element[0], this.data, this.layout, this.config)
//      Plotly.redraw(this.$element[0])
    }
  }
}

export class PlotlyComponent implements angular.IComponentOptions {
  public bindings: {[id: string]: string} = {
    data: '<',
    layout: '<',
    config: '<',
    events: '&'
  }
  public controller: (new (...args: any[]) => angular.IController) = PlotlyComponentController
}

angular.module('app.components.plotly', [])
  .component('plotly', new PlotlyComponent())
