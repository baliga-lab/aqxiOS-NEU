(function() {
    
    'use strict';
    
    var app = angular.module('aqx', ['ionic', 'ngCordova', 'ngCordovaOauth']);
    
    app.run(function ($ionicPlatform) {

        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.style(1);
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
           templateUrl: 'templates/menu.html',
           controller: 'MainController'
        });
        
        $stateProvider.state('main.systems', {
            url: '/systems/:systemID',
            views: {
                'systems': {
                    templateUrl: 'templates/systems.html',
                    controller: 'SystemsController'
                },
                'details': {
                    templateUrl: 'templates/details.html',
                    controller: 'DetailsController'
                }
            }
        });
        
        $stateProvider.state('main.systems.dashboard', {
            url: '/dashboard',
            views: {
                'dashboard': {
                    templateUrl: 'templates/dashboard.html',
                    controller: 'DashboardController'
                }
            }
        });
        
        $stateProvider.state('main.systems.analytics', {
            url: '/analytics',
            views: {
                'analytics': {
                    templateUrl: 'templates/analytics.html',
                    controller: 'AnalyticsController'
                }
            }
        });
        
        $stateProvider.state('main.systems.social', {
            url: '/social',
            views: {
                'social': {
                    templateUrl: 'templates/social.html',
                    controller: 'SocialController'
                }
            }
        });
        
        $stateProvider.state('main.systems.settings', {
            url: '/settings',
            views: {
                'settings': {
                    templateUrl: 'templates/settings.html',
                    controller: 'SettingsController'
                }
            }
        });
        
        $stateProvider.state('main.systems.submission', {
            url: '/submission/:data',
            views: {
                'dashboard': {
                    // templateUrl: function(params) { return 'templates/' + params.data.toLowerCase() + '.html'; },
                    templateUrl: 'templates/submission.html',
                    controller: 'SubmissionController'
                }
            }
        });
        
        $urlRouterProvider.otherwise('/portal');
    });
    
})();