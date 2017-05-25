'use strict'

import * as angular from 'angular'
import 'script-loader!d3-cloud/build/d3.layout.cloud.js'
import 'angular-d3-word-cloud/dist/angular-word-cloud.js'
import 'ng-prettyjson/dist/ng-prettyjson.min.js'

import {OctavoComponentController, IIndexMetadata} from '../octavo-component-controller'

interface IResult {
  term: string
  weight: number
}

class Word {
  constructor(
    public text: string,
    public size: number,
    public color?: string) {}
}

interface IResults {
  results: {
    metadata: {
      acceptedTerms: number
    }
    terms: IResult[]
  }
}

export class WordCloudViewComponentController extends OctavoComponentController {

  private defaultLevel: string
  private availableLevels: string[]
  private limit: number
  private query: string
  private furtherOptions: string = ''

  private words: Word[]
  private totalResults: number
  private response: any

  private cloudWidth: number
  private cloudHeight: number

  public wordClicked: (Word) => void = (word: Word) => {
    this.query = word.text
    this.runQuery()
  }

  protected endpointUpdated(indexInfo: IIndexMetadata): void {
    this.availableLevels = indexInfo.levels.map(level => level.id)
    if (!this.defaultLevel) this.defaultLevel = this.availableLevels[this.availableLevels.length - 1]
  }

  protected runQuery(): void {
    super.runQuery()
    let params: string = this.$httpParamSerializer({
      query: this.defaultLevel && this.query.indexOf('<') !== 0 ? '<' + this.defaultLevel + '§' + this.query + '§' + this.defaultLevel + '>' : this.query,
      limit: this.limit
    }) + '&' + this.furtherOptions
    this.$http.post(this.endpoint + 'collocations', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(
      (response: angular.IHttpPromiseCallbackArg<IResults>) => {
        this.response = JSON.parse(JSON.stringify(response.data))
        this.queryRunning = false
        this.totalResults = response.data.results.metadata.acceptedTerms
        let originWords: IResult[] = response.data.results.terms
        let maxCount: number = originWords[0].weight
        let minCount: number = originWords[originWords.length - 1].weight
        let maxWordSize: number = this.cloudWidth * 0.05
        let minWordSize: number = maxWordSize / 5
        let spread: number = maxCount - minCount
        if (spread <= 0) spread = 1;
        let step: number = (maxWordSize - minWordSize) / spread
        this.words = originWords.map(word => new Word(word.term, Math.floor(maxWordSize - ((maxCount - word.weight) * step))))
      },
      error => {
        this.queryRunning = false
        this.error = error
      }
    )
  }

  /* @ngInject */
  constructor($element: angular.IAugmentedJQuery, $window: angular.IWindowService, private $sce: angular.ISCEService, private $q: angular.IQService, $http: angular.IHttpService, private $httpParamSerializer: angular.IHttpParamSerializer, $stateParams: angular.ui.IStateParamsService, $state: angular.ui.IStateService) {
    super($http, $stateParams, $state)
    let element: HTMLElement = $element.find('word-cloud')[0]
    this.cloudHeight = $window.innerHeight * 0.75
    this.cloudWidth = (element.children[0] as HTMLElement).offsetWidth
    this.furtherOptions = '&sumScaling=ABSOLUTE'
    if (!this.limit) this.limit = 20
    if (this.query) this.runQuery()
  }
}

export class WordCloudViewComponent implements angular.IComponentOptions {
    public controller: (new (...args: any[]) => angular.IController) = WordCloudViewComponentController
    public template: string = require('./word-cloud-view.pug')()
}

angular.module('app.components.word-cloud-view', [])
  .component('wordCloudView', new WordCloudViewComponent())
