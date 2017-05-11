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
  'ngAnimate',
  ])
