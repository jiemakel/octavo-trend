'use strict'

import * as angular from 'angular'
import * as Plotly from 'plotly.js'

export interface IPlotlyComponentBindingChanges {
  data?: angular.IChangesObject<Partial<Plotly.Data>[]>
}

export interface IPlotlyPoints {
  curveNumber: number,
  pointNumber: number,
  data: Plotly.ScatterData
}

export interface IPlotlyEvent {
  event: MouseEvent
  points?: IPlotlyPoints[]
}

export class PlotlyComponentController implements angular.IComponentController {
  public data: Partial<Plotly.Data>[] = []
  public layout: Partial<Plotly.Layout>
  public config: Partial<Plotly.Config>

  private onClick: ({data: IPlotlyEvent}) => void
  private onHover: ({data: IPlotlyEvent}) => void
  private onUnhover: ({data: IPlotlyEvent}) => void
  private onSelecting: ({data: IPlotlyEvent}) => void
  private onSelected: ({data: IPlotlyEvent}) => void
  private onDoubleClick: ({data: IPlotlyEvent}) => void
  /* @ngInject */
  constructor(private $element: angular.IAugmentedJQuery) {
  }
  public $onChanges(changes: IPlotlyComponentBindingChanges): void {
    if (changes.data && changes.data.currentValue) {
      Plotly.newPlot(this.$element[0], this.data, this.layout, this.config)
      if (this.onClick) this.$element[0]['on']('plotly_click', (eventData: any) => this.onClick({data: eventData}))
      if (this.onHover) this.$element[0]['on']('plotly_hover', (eventData: any) => this.onHover({data: eventData}))
      if (this.onUnhover) this.$element[0]['on']('plotly_unhover', (eventData: any) => this.onUnhover({data: eventData}))
      if (this.onSelecting) this.$element[0]['on']('plotly_selecting', (eventData: any) => this.onSelecting({data: eventData}))
      if (this.onSelected) this.$element[0]['on']('plotly_selected', (eventData: any) => this.onSelected({data: eventData}))
      if (this.onDoubleClick) this.$element[0]['on']('plotly_doubleclick', (eventData: any) => this.onDoubleClick({data: eventData}))
//      Plotly.redraw(this.$element[0])
    }
  }
}

export class PlotlyComponent implements angular.IComponentOptions {
  public bindings: {[id: string]: string} = {
    data: '<',
    layout: '<',
    config: '<',
    onClick: '&',
    onHover: '&',
    onUnhover: '&',
    onSelecting: '&',
    onSelected: '&',
    onDoubleClick: '&'
  }
  public controller: (new (...args: any[]) => angular.IController) = PlotlyComponentController
}

angular.module('app.components.plotly', [])
  .component('plotly', new PlotlyComponent())
