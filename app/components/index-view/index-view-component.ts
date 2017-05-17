'use strict'

import * as angular from 'angular'

import {OctavoComponentController} from '../octavo-component-controller'

class IndexViewComponent implements angular.IComponentOptions {
  public controller: (new (...args: any[]) => angular.IController) = OctavoComponentController
  public template: string = require('./index-view.pug')()
}

angular.module('app.components.index-view', [])
  .component('indexView', new IndexViewComponent())
