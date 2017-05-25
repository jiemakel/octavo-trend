'use strict'

import * as angular from 'angular'

import 'components/index-view/index-view-component'
import 'components/trend-view/trend-view-component'
import 'components/word-cloud-view/word-cloud-view-component'
import 'components/search-view/search-view-component'
import 'components/plotly/plotly-component'

angular.module('app.components', [
  'app.components.index-view',
  'app.components.trend-view',
  'app.components.word-cloud-view',
  'app.components.search-view',
  'app.components.plotly'
])
