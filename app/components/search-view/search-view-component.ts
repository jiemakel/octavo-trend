'use strict'

import * as angular from 'angular'
import * as Plotly from 'plotly.js'

import {OctavoComponentController, IIndexMetadata} from '../octavo-component-controller'

interface IResult {
  matches: string[]
}

interface IResults {
  results: {
    total: number
    docs: IResult[]
  }
}

class SearchViewComponentController extends OctavoComponentController {

  private availableFields: string[]
  private availableLevels: string[]
  private defaultLevel: string
  private field: string[]
  private selectedFields: {[field: string]: boolean} = {}
  private showMatches: boolean = true
  private query: string
  private furtherOptions: string = ''
  private totalResults: number
  private results: IResult[]
  private limit: number

  protected endpointUpdated(indexInfo: IIndexMetadata): void {
    this.availableLevels = indexInfo.levels.map(level => level.id)
    if (!this.defaultLevel) this.defaultLevel = this.availableLevels[this.availableLevels.length - 1]
    this.availableFields = indexInfo.sortedDocValuesFields.concat(indexInfo.storedSingularFields).concat(indexInfo.numericDocValuesFields)
  }

  protected updateSelectedFields(): void {
    if (this.availableFields)
      this.field = this.availableFields.filter(f => this.selectedFields[f])
  }

  protected runQuery(): void {
    this.updateSelectedFields()
    super.runQuery()
    let params: string = this.$httpParamSerializer({
      query: this.defaultLevel && this.query.indexOf('<') !== 0 ? '<' + this.defaultLevel + '§' + this.query + '§' + this.defaultLevel + '>' : this.query,
      returnMatches: this.showMatches,
      field: this.field,
      limit: this.limit
    }) + '&' + this.furtherOptions
    this.$http.post(this.endpoint + 'search', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(
      (response: angular.IHttpPromiseCallbackArg<IResults>) => {
        this.queryRunning = false
        this.totalResults = response.data.results.total
        this.results = response.data.results.docs
        for (let doc of this.results)
          doc.matches = doc.matches.map(this.$sce.trustAsHtml)
      },
      error => {
        this.queryRunning = false
        this.error = error
      }
    )
  }

  /* @ngInject */
  constructor(private $sce: angular.ISCEService, private $q: angular.IQService, $http: angular.IHttpService, private $httpParamSerializer: angular.IHttpParamSerializer, $stateParams: angular.ui.IStateParamsService, $state: angular.ui.IStateService) {
    super($http, $stateParams, $state)
    if (!this.limit) this.limit = 20
    for (let field of this.field) this.selectedFields[field] = true
    if (this.query) this.runQuery()
  }


}

class SearchViewComponent implements angular.IComponentOptions {
    public controller: (new (...args: any[]) => angular.IController) = SearchViewComponentController
    public template: string = require('./search-view.pug')()
}

angular.module('app.components.search-view', [])
  .component('searchView', new SearchViewComponent())
