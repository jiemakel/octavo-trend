'use strict'

export interface ILevelInfo {
  id: string,
  term: string,
  index: string
}

export interface IIndexMetadata {
  sortedDocValuesFields: string[]
  storedSingularFields: string[]
  numericDocValuesFields: string[]
  levels: ILevelInfo[]
}

export class OctavoComponentController implements angular.IComponentController {
  public endpoint: string

  protected isEndpointValid: boolean
  protected error: string
  protected queryRunning: boolean = false

  public uiOnParamsChanged(params: any): void {
    if (params.endpoint && this.endpoint !== params.endpoint) {
      this.endpoint = params.endpoint
      this.endpointChanged()
    } else this.doRunQuery()
  }

  // tslint:disable-next-line: no-empty
  protected endpointUpdated(indexInfo: IIndexMetadata): void {}

  public endpointChanged(): void {
    this.$http.get(this.endpoint + 'indexInfo').then(
      (response: angular.IHttpPromiseCallbackArg<IIndexMetadata>) => {
        this.isEndpointValid = true
        this.$state.go(this.$state.current, this)
        this.endpointUpdated(response.data)
      },
      () => {
        this.isEndpointValid = false
      }
    )
  }

  protected runQuery(): void {
    this.$state.go(this.$state.current, this)
  }

  protected doRunQuery(): void {
    this.error = undefined
    this.queryRunning = true
  }

  /* @ngInject */
  constructor(protected $http: angular.IHttpService, protected $stateParams: any, protected $state: angular.ui.IStateService) {
    Object.assign(this, $stateParams)
    this.endpointChanged()
  }

}
