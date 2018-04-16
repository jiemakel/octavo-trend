"use strict";

import * as angular from "angular";
import "ng-prettyjson/dist/ng-prettyjson.min.js";

import {
  OctavoComponentController,
  IIndexMetadata
} from "../octavo-component-controller";
import { NodeStringDecoder } from "string_decoder";

interface IResult {
  matches: string[];
}

interface IResults {
  results: {
    total: number;
    docs: IResult[];
  };
}

class Field {
  constructor(public id: string, public description: string) {}
}

class SearchViewComponentController extends OctavoComponentController {
  private availableFields: Field[];
  private availableLevels: string[];
  private defaultLevel: string;
  private field: string[];
  private selectedFields: { [field: string]: boolean } = {};
  private showMatches: boolean = true;
  private query: string;
  private furtherOptions: string = "";
  private totalResults: number;
  private results: IResult[];
  private limit: number;
  private queryURL: string;
  private response: any;

  protected endpointUpdated(indexInfo: IIndexMetadata): void {
    this.availableLevels = indexInfo.levels.map(level => level.id);
    if (!this.defaultLevel)
      this.defaultLevel = this.availableLevels[this.availableLevels.length - 1];
    this.availableFields = [];
    for (let field in indexInfo.commonFields)
      this.availableFields.push(
        new Field(field, indexInfo.commonFields[field].description)
      );
    if (this.query) this.doRunQuery();
  }

  protected updateSelectedFields(): void {
    if (this.availableFields)
      this.field = this.availableFields
        .map(f => f.id)
        .filter(f => this.selectedFields[f]);
  }

  protected doRunQuery(): void {
    this.updateSelectedFields();
    super.doRunQuery();
    let params: string =
      this.$httpParamSerializer({
        query:
          this.defaultLevel && this.query.indexOf("<") !== 0
            ? "<" +
              this.defaultLevel +
              "§" +
              this.query +
              "§" +
              this.defaultLevel +
              ">"
            : this.query,
        returnMatches: this.showMatches,
        field: this.field,
        limit: this.limit
      }) +
      "&" +
      this.furtherOptions;
    this.queryURL = this.endpoint + "search" + "?" + params;
    this.$http
      .post(this.endpoint + "search", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      })
      .then(
        (response: angular.IHttpPromiseCallbackArg<IResults>) => {
          this.response = JSON.parse(JSON.stringify(response.data));
          this.queryRunning = false;
          this.totalResults = response.data.results.total;
          this.results = response.data.results.docs;
          for (let doc of this.results)
            doc.matches = doc.matches.map(this.$sce.trustAsHtml);
        },
        error => {
          this.queryRunning = false;
          this.error = error;
        }
      );
  }

  /* @ngInject */
  constructor(
    private $sce: angular.ISCEService,
    private $q: angular.IQService,
    $http: angular.IHttpService,
    private $httpParamSerializer: angular.IHttpParamSerializer,
    $stateParams: angular.ui.IStateParamsService,
    $state: angular.ui.IStateService
  ) {
    super($http, $stateParams, $state);
    if (!this.limit) this.limit = 20;
    if (!this.field) this.field = [];
    for (let field of this.field) this.selectedFields[field] = true;
  }
}

class SearchViewComponent implements angular.IComponentOptions {
  public controller: new (
    ...args: any[]
  ) => angular.IController = SearchViewComponentController;
  public template: string = require("./search-view.pug")();
}

angular
  .module("app.components.search-view", [])
  .component("searchView", new SearchViewComponent());
