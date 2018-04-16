"use strict";

import * as angular from "angular";
import * as Plotly from "plotly.js";
import * as d3 from "d3";

import { IPlotlyEvent } from "components/plotly/plotly-component";

import "script-loader!d3-cloud/build/d3.layout.cloud.js";
import "angular-d3-word-cloud/dist/angular-word-cloud.js";
import "ng-prettyjson/dist/ng-prettyjson.min.js";

import {
  OctavoComponentController,
  IIndexMetadata
} from "components/octavo-component-controller";

interface IResult {
  term: string;
  weight: number;
  termVector?: {
    terms: number[];
  };
}

class Word {
  constructor(
    public text: string,
    public size: number,
    public color?: string
  ) {}
}

interface IResults {
  results: {
    metadata: {
      acceptedTerms: number;
    };
    terms: IResult[];
  };
}

interface IQuantile {
  quantile: string;
  freq: number;
}

interface IQuantileResults {
  termFreqQuantiles: IQuantile[];
  docFreqQuantiles: IQuantile[];
}

export class WordCloudViewComponentController extends OctavoComponentController {
  private defaultLevel: string;
  private availableLevels: string[];
  private limit: number;
  private query: string;
  private smoothing: number;
  private maxDocs: number;
  private minTotalTermFreq: number;
  private maxTotalTermFreq: number;
  private minDocFreq: number;
  private maxDocFreq: number;
  private minFreqInDoc: number;
  private maxFreqInDoc: number;
  private minTermLength: number;
  private maxTermLength: number;
  private minSumFreq: number;
  private maxSumFreq: number;
  private termFilter: string;
  private localScaling: "ABSOLUTE" | "MIN" | "FLAT";
  private sumScaling: "ABSOLUTE" | "TTF" | "DF";
  private furtherOptions: string;
  private mds: boolean;

  private words: Word[];
  private totalResults: number;
  private queryURL: string;
  private response: any;

  private cloudWidth: number;
  private cloudHeight: number;

  private mquantiles: number[];
  private quantiles: number[];
  private mdquantiles: number[];
  private dquantiles: number[];

  private tfData: Partial<Plotly.Data>[];
  private tfLayout: any; // Partial<Plotly.Layout>
  private dfData: Partial<Plotly.Data>[];
  private dfLayout: any; // Partial<Plotly.Layout>

  private mdsData: Partial<Plotly.Data>[];
  private mdsLayout: any; // Partial<Plotly.Layout>

  public mdsWordClicked(data: IPlotlyEvent): void {
    if (data.event.altKey) {
      this.query = data.points[0].data.text[data.points[0].pointNumber];
      this.doRunQuery();
    } else {
      let url: string = this.$state.href("search", {
        endpoint: this.endpoint,
        query:
          "+(" +
          this.query +
          ") +" +
          data.points[0].data.text[data.points[0].pointNumber],
        defaultLevel: this.defaultLevel
      });
      this.$window.open(url, "_blank");
    }
  }

  public wordClicked: (Word) => void = (word: Word) => {
    if (d3.event.altKey) {
      this.query = word.text;
      this.doRunQuery();
    } else {
      let url: string = this.$state.href("search", {
        endpoint: this.endpoint,
        query: "+(" + this.query + ") +" + word.text,
        defaultLevel: this.defaultLevel
      });
      this.$window.open(url, "_blank");
    }
  };

  protected endpointUpdated(indexInfo: IIndexMetadata): void {
    this.availableLevels = indexInfo.levels.map(level => level.id);
    if (!this.defaultLevel)
      this.defaultLevel = this.availableLevels[this.availableLevels.length - 1];
    this.mquantiles = undefined;
    this.quantiles = undefined;
    this.mdquantiles = undefined;
    this.dquantiles = undefined;
    this.$http
      .get(this.endpoint + "indexStats?by=0.001")
      .then((response: angular.IHttpPromiseCallbackArg<IQuantileResults>) => {
        let tfs: IQuantile[] = response.data.termFreqQuantiles;
        let dfs: IQuantile[] = response.data.docFreqQuantiles;
        this.mquantiles = [
          tfs[100].freq,
          tfs[500].freq,
          tfs[800].freq,
          tfs[900].freq
        ];
        this.quantiles = [
          tfs[950].freq,
          tfs[990].freq,
          tfs[995].freq,
          tfs[999].freq,
          tfs[1000].freq
        ];
        this.mdquantiles = [
          dfs[100].freq,
          dfs[500].freq,
          dfs[800].freq,
          dfs[900].freq
        ];
        this.dquantiles = [
          dfs[950].freq,
          dfs[990].freq,
          dfs[995].freq,
          dfs[999].freq,
          dfs[1000].freq
        ];
        let tfData: Partial<Plotly.ScatterData> = {
          x: [],
          y: [],
          mode: "markers"
        };
        for (let q of tfs) {
          (tfData.x as any)
            .push((1.0 - parseFloat(q.quantile)) * 100)(tfData.y as number[])
            .push(q.freq);
        }
        this.tfData = [tfData];
        this.tfLayout = {
          title: "Term frequency quantiles (log)",
          yaxis: {
            type: "log",
            autorange: true
          }
        };
        let dfData: Partial<Plotly.ScatterData> = {
          x: [],
          y: [],
          mode: "markers"
        };
        for (let q of dfs.reverse()) {
          (dfData.x as any)
            .push((1.0 - parseFloat(q.quantile)) * 100)(dfData.y as number[])
            .push(q.freq);
        }
        this.dfData = [dfData];
        this.dfLayout = {
          title: "Document frequency quantiles (log)",
          yaxis: {
            type: "log",
            autorange: true
          }
        };
      });
    if (this.query) this.doRunQuery();
  }

  protected doRunQuery(): void {
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
        limit: this.limit,
        smoothing: this.smoothing,
        maxDocs: this.maxDocs,
        minTotalTermFreq: this.minTotalTermFreq,
        maxTotalTermFreq:
          this.maxTotalTermFreq !== -1 ? this.maxTotalTermFreq : null,
        minDocFreq: this.minDocFreq,
        maxDocFreq: this.maxDocFreq !== -1 ? this.maxDocFreq : null,
        minSumFreq: this.minSumFreq,
        maxSumFreq: this.maxSumFreq !== -1 ? this.maxSumFreq : null,
        termFilter: this.termFilter ? this.termFilter : null,
        localScaling: this.localScaling,
        sumScaling: this.sumScaling,
        minTermLength: this.minTermLength,
        maxTermLength: this.maxTermLength !== -1 ? this.maxTermLength : null,
        r_smoothing: this.mds ? this.smoothing : null,
        r_maxDocs: this.mds ? this.maxDocs : null,
        r_minTotalTermFreq: this.mds ? this.minTotalTermFreq : null,
        r_maxTotalTermFreq:
          this.mds && this.maxTotalTermFreq !== -1
            ? this.maxTotalTermFreq
            : null,
        r_minDocFreq: this.mds ? this.minDocFreq : null,
        r_maxDocFreq:
          this.mds && this.maxDocFreq !== -1 ? this.maxDocFreq : null,
        r_minSumFreq: this.mds ? this.minSumFreq : null,
        r_maxSumFreq:
          this.mds && this.maxSumFreq !== -1 ? this.maxSumFreq : null,
        r_termFilter: this.mds && this.termFilter ? this.termFilter : null,
        r_localScaling: this.mds ? this.localScaling : null,
        r_sumScaling: this.mds ? this.sumScaling : null,
        r_minTermLength: this.mds ? this.minTermLength : null,
        r_maxTermLength:
          this.mds && this.maxTermLength !== -1 ? this.maxTermLength : null,
        dimensions: this.mds ? 2 : null
      }) +
      "&" +
      this.furtherOptions;
    this.queryURL = this.endpoint + "termVectors" + "?" + params;
    this.$http
      .post(this.endpoint + "termVectors", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      })
      .then(
        (response: angular.IHttpPromiseCallbackArg<IResults>) => {
          this.response = JSON.parse(JSON.stringify(response.data));
          this.queryRunning = false;
          this.totalResults = response.data.results.metadata.acceptedTerms;
          let originWords: IResult[] = response.data.results.terms;
          let maxCount: number = originWords[0].weight;
          let minCount: number = originWords[originWords.length - 1].weight;
          let maxWordSize: number = this.cloudWidth * 0.05;
          let minWordSize: number = maxWordSize / 5;
          let spread: number = maxCount - minCount;
          if (spread <= 0) spread = 1;
          let step: number = (maxWordSize - minWordSize) / spread;
          if (!this.mds)
            this.words = originWords.map(
              word =>
                new Word(
                  word.term,
                  Math.floor(maxWordSize - (maxCount - word.weight) * step)
                )
            );
          else {
            let mdsData: any = {
              x: [],
              y: [],
              text: [],
              type: "scatter",
              mode: "text+markers",
              marker: { size: [] }
            };
            for (let term of response.data.results.terms) {
              (mdsData.text as string[]).push(term.term);
              mdsData.x.push(term.termVector.terms[0]);
              mdsData.y.push(term.termVector.terms[1]);
              mdsData.marker.size.push(
                Math.floor(maxWordSize - (maxCount - term.weight) * step)
              );
            }
            this.mdsData = [mdsData];
            this.mdsLayout = {
              title: "Term space (MDS)",
              hovermode: "closest",
              autosize: false,
              width: 800,
              height: 800
            };
          }
        },
        error => {
          this.queryRunning = false;
          this.error = error;
        }
      );
  }

  /* @ngInject */
  constructor(
    $element: angular.IAugmentedJQuery,
    private $window: angular.IWindowService,
    private $sce: angular.ISCEService,
    private $q: angular.IQService,
    $http: angular.IHttpService,
    private $httpParamSerializer: angular.IHttpParamSerializer,
    $stateParams: angular.ui.IStateParamsService,
    $state: angular.ui.IStateService
  ) {
    super($http, $stateParams, $state);
    let element: HTMLElement = $element.find("word-cloud")[0];
    this.cloudHeight = $window.innerHeight * 0.75;
    this.cloudWidth = (element.children[0] as HTMLElement).offsetWidth;
    if (!this.furtherOptions) this.furtherOptions = "";
    if (!this.limit) this.limit = 100;
    if (!this.smoothing) this.smoothing = 2;
    if (!this.maxDocs) this.maxDocs = 50000;
    if (!this.minTotalTermFreq) this.minTotalTermFreq = 0;
    if (!this.maxTotalTermFreq) this.maxTotalTermFreq = -1;
    if (!this.minDocFreq) this.minDocFreq = 0;
    if (!this.maxDocFreq) this.maxDocFreq = -1;
    if (!this.minFreqInDoc) this.minFreqInDoc = 0;
    if (!this.maxFreqInDoc) this.maxFreqInDoc = -1;
    if (!this.minTermLength) this.minTermLength = 0;
    if (!this.maxTermLength) this.maxTermLength = -1;
    if (!this.minSumFreq) this.minSumFreq = 0;
    if (!this.maxSumFreq) this.maxSumFreq = -1;
    if (!this.termFilter) this.termFilter = "";
    if (!this.localScaling) this.localScaling = "ABSOLUTE";
    if (!this.sumScaling) this.sumScaling = "TTF";
  }
}

export class WordCloudViewComponent implements angular.IComponentOptions {
  public controller: new (
    ...args: any[]
  ) => angular.IController = WordCloudViewComponentController;
  public template: string = require("./word-cloud-view.pug")();
}

angular
  .module("app.components.word-cloud-view", [])
  .component("wordCloudView", new WordCloudViewComponent());
