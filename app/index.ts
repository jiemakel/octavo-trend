'use strict'

import * as angular from 'angular'

import 'angular-ui-router'
import 'angular-animate'
import 'angular-ui-bootstrap'

import './styles/main.styl'
// Register modules
import './services'
import './components'
import './filters'

let m: angular.IModule = angular.module('app', [
  'app.services',
  'app.components',
  'app.filters',
  'ui.router',
  'ui.bootstrap',
  'ui.bootstrap.tpls',
  'ngAnimate'
  ])

m.config(($stateProvider: angular.ui.IStateProvider, $urlRouterProvider: angular.ui.IUrlRouterProvider) => {
  $stateProvider.state('main', {
    url: '/?endpoint&attr&{attrLength:int}&query&comparisonQuery&{plotTermFreq:bool}&{plotAbsolute:bool}',
    params: {
      endpoint: { dynamic: true },
      attr: { dynamic: true},
      attrLength: { dynamic: true},
      query: { dynamic: true},
      comparisonQuery: { dynamic: true},
      plotTermFreq: { dynamic: true},
      plotAbsolute: { dynamic: true}
    },
    component: 'mainView'
  })
  $urlRouterProvider.otherwise('/')
})
