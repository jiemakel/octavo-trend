'use strict'

import * as angular from 'angular'

import './main-view/main-view-component'
import './plotly/plotly-component'

angular.module('app.components', [
  'app.components.main-view',
  'app.components.plotly'
])
