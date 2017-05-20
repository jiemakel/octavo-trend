'use strict'

import * as angular from 'angular'

import {OctavoComponentController, IIndexMetadata} from '../octavo-component-controller'

export class WordCloudViewComponentController extends OctavoComponentController {
}

export class WordCloudViewComponent implements angular.IComponentOptions {
    public controller: (new (...args: any[]) => angular.IController) = WordCloudViewComponentController
    public template: string = require('./word-cloud-view.pug')()
}

angular.module('app.components.word-cloud-view', [])
  .component('wordCloudView', new WordCloudViewComponent())
