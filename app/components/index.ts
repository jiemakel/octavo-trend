'use strict'

import * as angular from 'angular'

import './index-view/index-view-component'
import './trend-view/trend-view-component'
import './word-cloud-view/word-cloud-view-component'
import './search-view/search-view-component'
import './plotly/plotly-component'

angular.module('app.components', [
  'app.components.index-view',
  'app.components.trend-view',
  'app.components.word-cloud-view',
  'app.components.search-view',
  'app.components.plotly'
])
