'use strict'

import * as angular from 'angular'

import '@uirouter/angularjs'
import 'angular-animate'
import 'angular-ui-bootstrap'
import 'angular-http-auth'

import 'styles/main.styl'
// Register modules
import 'services'
import 'components'
import 'filters'
import 'ngstorage';

let m: angular.IModule = angular.module('app', [
  'app.services',
  'app.components',
  'app.filters',
  'http-auth-interceptor',
  'ngStorage',
  'ui.router',
  'ui.bootstrap',
  'ui.bootstrap.tpls',
  'ngAnimate',
  'ngPrettyJson',
  'angular-d3-word-cloud'
  ])

let auths: {[url: string]: string} = {}

/* @ngInject */
m.config(($httpProvider: angular.IHttpProvider) => {
  $httpProvider.interceptors.push(() => {
    return {
      request: (request) => {
        if (auths[request.url]) request.headers['Authorization'] = auths[request.url]
        return request
      }
    }
  })
})

interface IAuthenticationRootScopeService extends angular.IRootScopeService {
  setAuth: () => void
  dismissAuth: () => void
  authInfo: {
    url: string | undefined
    authOpen: boolean
    username: string | undefined
    password: string | undefined
  }
}

/* @ngInject */
m.config(($stateProvider: angular.ui.IStateProvider, $urlRouterProvider: angular.ui.IUrlRouterProvider) => {
  $stateProvider.state('index', {
    url: '/?endpoint',
    params: {
      endpoint: { dynamic: true }
    },
    component: 'indexView'
  })
  $stateProvider.state('trend', {
    url: '/trend?endpoint&attr&{attrLength:int}&query&comparisonQuery&{plotTermFreq:bool}&{plotAbsolute:bool}&defaultLevel&furtherOptions',
    params: {
      endpoint: { dynamic: true },
      attr: { dynamic: true},
      attrLength: { dynamic: true},
      query: { dynamic: true},
      comparisonQuery: { dynamic: true},
      plotTermFreq: { dynamic: true},
      plotAbsolute: { dynamic: true},
      defaultLevel: { dynamic: true},
      furtherOptions: { dynamic: true }
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

/* @ngInject */
m.run(($rootScope: IAuthenticationRootScopeService, $localStorage: any, authService: angular.httpAuth.IAuthService) => {
  $rootScope.authInfo = {
    authOpen: false,
    url: undefined,
    username: undefined,
    password: undefined
  };
  if (!$localStorage.authorization) $localStorage.authorization = {}
  auths = $localStorage.authorization
  $rootScope.setAuth = () => {
    $rootScope.authInfo.authOpen = false
    auths[$rootScope.authInfo.url] = 'Basic ' + btoa($rootScope.authInfo.username + ':' + $rootScope.authInfo.password)
    authService.loginConfirmed()
  }
  $rootScope.dismissAuth = () => {
    $rootScope.authInfo.authOpen = false
    authService.loginCancelled({status: 401}, 'Authentication required')
  }
  $rootScope.$on('event:auth-loginRequired', (event, rejected) => {
    $rootScope.authInfo.url = rejected.config.url
    $rootScope.authInfo.authOpen = true
  })

})
