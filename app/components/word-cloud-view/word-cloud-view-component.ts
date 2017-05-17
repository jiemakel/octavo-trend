'use strict'

import * as angular from 'angular'
import * as Plotly from 'plotly.js'

export class WordCloudViewComponentController implements angular.IComponentController {
  public endpoint: string

  private isEndpointValid: boolean
  private error: string
  private queryRunning: boolean = false

  public uiOnParamsChanged(params: any): void {
    if (params.endpoint && this.endpoint !== params.endpoint) {
      this.endpoint = params.endpoint
      this.endpointChanged()
    }
  }
  public endpointChanged(): void {
    this.$http.get(this.endpoint + 'indexInfo').then(
      (response) => {
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
  }
  /* @ngInject */
  constructor(private $q: angular.IQService, private $http: angular.IHttpService, private $httpParamSerializer: angular.IHttpParamSerializer, private $stateParams: angular.ui.IStateParamsService, private $state: angular.ui.IStateService) {
    Object.assign(this, $stateParams)
    this.endpointChanged()
  }
}

export class WordCloudViewComponent implements angular.IComponentOptions {
    public controller: (new (...args: any[]) => angular.IController) = WordCloudViewComponentController
    public template: string = require('./word-cloud-view.pug')()
}

angular.module('app.components.word-cloud-view', [])
  .component('wordCloudView', new WordCloudViewComponent())
