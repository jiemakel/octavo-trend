'use strict'

import * as angular from 'angular'

import 'angular-ui-router'
import 'angular-animate'
import 'angular-ui-bootstrap'

import 'styles/main.styl'
// Register modules
import 'services'
import 'components'
import 'filters'

let m: angular.IModule = angular.module('app', [
  'app.services',
  'app.components',
  'app.filters',
  'ui.router',
  'ui.bootstrap',
  'ui.bootstrap.tpls',
  'ngAnimate',
  'ngPrettyJson',
  'angular-d3-word-cloud'
  ])

m.config(($stateProvider: angular.ui.IStateProvider, $urlRouterProvider: angular.ui.IUrlRouterProvider) => {
  $stateProvider.state('index', {
    url: '/?endpoint',
    params: {
      endpoint: { dynamic: true }
    },
    component: 'indexView'
  })
  $stateProvider.state('trend', {
    url: '/trend?endpoint&attr&{attrLength:int}&query&comparisonQuery&{plotTermFreq:bool}&{plotAbsolute:bool}&defaultLevel',
    params: {
      endpoint: { dynamic: true },
      attr: { dynamic: true},
      attrLength: { dynamic: true},
      query: { dynamic: true},
      comparisonQuery: { dynamic: true},
      plotTermFreq: { dynamic: true},
      plotAbsolute: { dynamic: true},
      defaultLevel: { dynamic: true}
    },
    component: 'trendView'
  })
  $stateProvider.state('search', {
    url: '/search?endpoint&query&field&showMatches&furtherOptions&{limit:int}&defaultLevel',
    params: {
      endpoint: { dynamic: true },
      query: { dynamic: true },
      field: { dynamic: true, array: true },
      showMatches: { dynamic: true },
      defaultLevel: { dynamic: true },
      limit: { dynamic: true },
      furtherOptions: { dynamic: true }
    },
    component: 'searchView'
  })
  $stateProvider.state('word-cloud', {
    url: '/word-cloud?endpoint&query&defaultLevel&{limit:int}&{smoothing:int}&{maxDocs:int}&{minTotalTermFreq:int}&{maxTotalTermFreq:int}&{minDocFreq:int}&{maxDocFreq:int}&{minFreqInDoc:int}&{maxFreqInDoc:int}&{minTermLength:int}&{maxTermLength:int}&{minSumFreq:int}&{maxSumFreq:int}&termFilter&localScaling&sumScaling&{mds:bool}&furtherOptions',
    params: {
      endpoint: { dynamic: true },
      query: { dynamic: true },
      defaultLevel: { dynamic: true },
      limit: { dynamic: true },
      smoothing: { dynamic: true },
      maxDocs: { dynamic: true },
      minTotalTermFreq: { dynamic: true},
      maxTotalTermFreq: { dynamic: true},
      minDocFreq: { dynamic: true},
      maxDocFreq: { dynamic: true},
      minFreqInDoc: { dynamic: true},
      maxFreqInDoc: { dynamic: true},
      minTermLength: { dynamic: true},
      maxTermLength: { dynamic: true},
      minSumFreq: { dynamic: true},
      maxSumFreq: { dynamic: true},
      termFilter: { dynamic: true},
      localScaling: { dynamic: true},
      sumScaling: { dynamic: true},
      furtherOptions: { dynamic: true },
      mds: { dynamic: true }
    },
    component: 'wordCloudView'
  })
  $urlRouterProvider.otherwise('/')
})
