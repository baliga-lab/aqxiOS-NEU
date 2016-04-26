(function() {

    'use strict';

    var app = angular.module('aqx', ['ionic', 'ngCordova', 'ngCordovaOauth', 'ngCookies']);

    app.run(function($ionicPlatform) {

        $ionicPlatform.ready(function() {
            // Hide the accessory bar by default
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleLightContent();
            }
        });
    });

    app.config(function($stateProvider, $urlRouterProvider) {

        $stateProvider.state('portal', {
            url: '/portal',
            templateUrl: 'templates/portal.html',
            controller: 'PortalController'
        });

        $stateProvider.state('main', {
            url: '/main',
            abstract: true,
            templateUrl: 'templates/main.html',
            controller: 'MainController'
        });

        $stateProvider.state('main.systems', {
            url: '/system',
            views: {
                'menu': {
                    templateUrl: 'templates/menu.html',
                    controller: 'MenuController'
                },
                'content': {
                    templateUrl: 'templates/systems.html',
                    controller: 'SystemsController'
                }
            }
        });

        $stateProvider.state('main.systemOverview', {
            url: '/system/:systemID/:systemUID',
            views: {
                'menu': {
                    templateUrl: 'templates/menu.html',
                    controller: 'MenuController'
                },
                'content': {
                    templateUrl: 'templates/overview.html',
                    controller: 'OverviewController'
                }
            }
        });

        $stateProvider.state('main.inputReading', {
            url: '/system/:systemID/:systemUID/input/reading/:type',
            views: {
                'menu': {
                    templateUrl: 'templates/menu.html',
                    controller: 'MenuController'
                },
                'content': {
                    templateUrl: 'templates/input-reading.html',
                    controller: 'InputReadingController'
                }
            }
        });
        
        $stateProvider.state('main.inputAnnotation', {
            url: '/system/:systemID/:systemUID/input/annotation',
            views: {
                'menu': {
                    templateUrl: 'templates/menu.html',
                    controller: 'MenuController'
                },
                'content': {
                    templateUrl: 'templates/input-annotation.html',
                    controller: 'InputAnnotationController'
                }
            }
        });

        $urlRouterProvider.otherwise('/portal');
    });

})();