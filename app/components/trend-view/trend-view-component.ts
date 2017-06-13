'use strict'

import * as angular from 'angular'
import 'ng-prettyjson/dist/ng-prettyjson.min.js'
import * as Plotly from 'plotly.js'

interface IStats {
  docFreq: number
  totalTermFreq: number
}

interface IResults {
  results: {
    general: IStats
    grouped: Array<{
      stats: IStats
    }>
  }
}
import {OctavoComponentController, IIndexMetadata} from '../octavo-component-controller'

export class TrendViewComponentController extends OctavoComponentController {
  public defaultLevel: string
  public attr: string
  public attrLength: number
  public query: string
  public comparisonQuery: string
  public plotTermFreq: boolean
  public plotAbsolute: boolean

  private availableLevels: string[]
  private attrs: string[]
  private sampleAttrs: (string|Date)[]
  private queryURL: string
  private response: any
  private data: Partial<Plotly.Data>[]
  private layout: any // Partial<Plotly.Layout>

  protected endpointUpdated(indexInfo: IIndexMetadata): void {
    this.attrs = indexInfo.sortedDocValuesFields.concat(indexInfo.storedSingularFields)
    this.availableLevels = indexInfo.levels.map(level => level.id)
    if (!this.defaultLevel) this.defaultLevel = this.availableLevels[this.availableLevels.length - 1]
    if (this.attr && this.query) this.doRunQuery()
  }

  protected doRunQuery(): void {
    super.doRunQuery()
    let params: string = this.$httpParamSerializer({
      attr: this.attr,
      attrLength: this.attrLength !== -1 ? this.attrLength : undefined,
      query: this.defaultLevel && this.query.indexOf('<') !== 0 ? '<' + this.defaultLevel + '§' + this.query + '§' + this.defaultLevel + '>' : this.query,
    })
    this.queryURL = this.endpoint + 'queryStats' + '?' + params
    let q1: angular.IHttpPromise<IResults> = this.$http.post(this.endpoint + 'queryStats', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }) as angular.IHttpPromise<IResults>
    let q2: angular.IHttpPromise<IResults> = !this.plotAbsolute ? this.$http.post(
      this.endpoint + 'queryStats', this.$httpParamSerializer({
        attr: this.attr,
        attrLength: this.attrLength !== -1 ? this.attrLength : undefined,
        query: this.defaultLevel && this.comparisonQuery.indexOf('<') !== 0 ? '<' + this.defaultLevel + '§' + this.comparisonQuery + '§' + this.defaultLevel + '>' : this.comparisonQuery,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }) as angular.IHttpPromise<IResults> : this.$q.resolve(null)
    this.$q.all([q1, q2]).then(
      (responses: angular.IHttpPromiseCallbackArg<IResults>[]) => {
        this.response = JSON.parse(JSON.stringify(!this.plotAbsolute ? [responses[0].data, responses[1].data] : responses[0].data))
        this.queryRunning = false
        let data: Partial<Plotly.ScatterData> = {
          x: [],
          y: [],
          mode: 'lines+markers'
        }
        this.sampleAttrs = responses[0].data.results.grouped.slice(0, 5).map(g => g[this.attr])
        let cmap: {[id: string]: IStats} = {}
        if (!this.plotAbsolute)
          for (let group of responses[1].data.results.grouped) cmap[group[this.attr] as string] = group.stats
        for (let group of responses[0].data.results.grouped) {
          if (!this.plotAbsolute) {
            group.stats.docFreq = 1000000 * group.stats.docFreq / cmap[group[this.attr] as string].docFreq
            group.stats.totalTermFreq = 1000000 * group.stats.totalTermFreq / cmap[group[this.attr] as string].totalTermFreq
          }
          let ts: number = Date.parse(group[this.attr] as string)
          if (!isNaN(ts)) group[this.attr] = new Date(ts)
        }
        responses[0].data.results.grouped.sort((a, b) => { if (a[this.attr] < b[this.attr]) return -1; if (a[this.attr] > b[this.attr]) return 1; return 0; })
        for (let group of responses[0].data.results.grouped) {
          data.x.push(group[this.attr])
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
  constructor(private $q: angular.IQService, $http: angular.IHttpService, private $httpParamSerializer: angular.IHttpParamSerializer, $stateParams: angular.ui.IStateParamsService, $state: angular.ui.IStateService) {
    super($http, $stateParams, $state)
    if (!this.plotAbsolute) this.plotAbsolute = false
    if (!this.plotTermFreq) this.plotTermFreq = false
    if (!this.query) this.query = ''
    if (!this.comparisonQuery) this.comparisonQuery = ''
  }
}

export class TrendViewComponent implements angular.IComponentOptions {
    public controller: (new (...args: any[]) => angular.IController) = TrendViewComponentController
    public template: string = require('./trend-view.pug')()
}

angular.module('app.components.trend-view', [])
  .component('trendView', new TrendViewComponent())
