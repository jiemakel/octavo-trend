'use strict'

import * as angular from 'angular'
import * as Plotly from 'plotly.js'

interface IMainViewParams {
  endpoint: string
  attr: string
  attrLength: number
}

interface IStats {
  docFreq: number
  totalTermFreq: number
}

interface IResults {
  results: {
    general: IStats
    grouped: Array<{
      attr: string | Date
      stats: IStats
    }>
  }
}

export class MainViewComponentController implements angular.IComponentController {
  public endpoint: string
  public isEndpointValid: boolean
  public attrs: string[]
  public attr: string
  public attrLength: number
  public query: string
  public comparisonQuery: string
  private error: string
  public queryRunning: boolean = false
  private data: Partial<Plotly.Data>[]
  private layout: any // Partial<Plotly.Layout>
  public plotTermFreq: boolean = false
  public plotAbsolute: boolean = false
  public sampleAttrs: (string|Date)[]
  public uiOnParamsChanged(params: IMainViewParams): void {
    if (params.endpoint && this.endpoint !== params.endpoint) {
      this.endpoint=params.endpoint
      this.endpointChanged()
    }
  }
  public endpointChanged(): void {
    this.$http.get(this.endpoint + 'indexInfo').then(
      (response) => {
        this.attrs = response.data['sortedDocValuesFields'].concat(response.data['storedSingularFields'])
        this.isEndpointValid = true
        this.$state.go('main', this)
      },
      () => this.isEndpointValid = false
    )
  }
  public runQuery(): void {
    this.$state.go('main', this)
    this.error = undefined
    this.queryRunning = true
    let q1 = this.$http.post(this.endpoint + 'termStats', this.$httpParamSerializer({
      attr:this.attr,
      attrLength:this.attrLength !== -1 ? this.attrLength : undefined,
      query:this.query
    }),{
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }) as angular.IHttpPromise<IResults>
    let q2 = !this.plotAbsolute ? this.$http.post(this.endpoint + 'termStats', this.$httpParamSerializer({
      attr:this.attr,
      attrLength:this.attrLength !== -1 ? this.attrLength : undefined,
      query:this.comparisonQuery
    }),{
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }) as angular.IHttpPromise<IResults> : this.$q.resolve(null)
    this.$q.all([q1,q2]).then(
      (responses: angular.IHttpPromiseCallbackArg<IResults>[]) => {
        this.queryRunning = false
        let data: Partial<Plotly.ScatterData> = {
          x: [],
          y: [],
          mode: 'lines+markers'
        }
        this.sampleAttrs = responses[0].data.results.grouped.slice(0,5).map(g => g.attr)
        let cmap: {[id: string]: IStats} = {}
        if (!this.plotAbsolute)
          for (let group of responses[1].data.results.grouped) cmap[group.attr as string] = group.stats
        for (let group of responses[0].data.results.grouped) {
          if (!this.plotAbsolute) {
            group.stats.docFreq = 1000000 * group.stats.docFreq / cmap[group.attr as string].docFreq
            group.stats.totalTermFreq = 1000000 * group.stats.totalTermFreq / cmap[group.attr as string].totalTermFreq
          }
          let ts = Date.parse(group.attr as string)
          if (!isNaN(ts)) group.attr=new Date(ts)
        }
        responses[0].data.results.grouped.sort((a,b) => { if (a.attr < b.attr) return -1; if (a.attr > b.attr) return 1; return 0; })
        for (let group of responses[0].data.results.grouped) {
          data.x.push(group.attr)
          data.y.push(!this.plotTermFreq ? group.stats.docFreq : group.stats.totalTermFreq)
        }
        this.layout = {
          title: !this.plotTermFreq ? (!this.plotAbsolute ? 'Document frequency per million documents' : 'Absolute document frequency') : (!this.plotAbsolute ? 'Term frequency per million words' : 'Absolute term frequency')
        }
        this.data = [ data ]
      },
      error => {
        this.queryRunning = false
        this.error = error
      }
    )
  }
  /* @ngInject */
  constructor(private $q: angular.IQService, private $http: angular.IHttpService, private $httpParamSerializer: angular.IHttpParamSerializer, private $stateParams: angular.ui.IStateParamsService, private $state: angular.ui.IStateService) {
    Object.assign(this, $stateParams)
    this.endpointChanged()
    if (this.attr && this.query) this.runQuery()
  }
}

export class MainViewComponent implements angular.IComponentOptions {
    public controller: (new (...args: any[]) => angular.IController) = MainViewComponentController
    public template: string = require('./main-view.pug')()
}

angular.module('app.components.main-view', [])
  .component('mainView', new MainViewComponent())
