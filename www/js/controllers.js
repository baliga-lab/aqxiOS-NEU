(function() {
    
    'use strict';
    
    var app = angular.module('aqx');
    
    app.controller('PortalController', function ($scope, $log, $state, $cordovaOauth) {
        
        var clientID = '651960916780-76h7karv1iprib1jo747tvlv98mbch65.apps.googleusercontent.com';
        var fields = ['profile', 'email', 'openid'];
        
        $scope.login = function() {
            function onSuccess(result) {
                $log.debug(result);
                $state.go('main.systems.dashboard');
            }
            function onFailure(error) {
                $log.error(error);
            }
            $cordovaOauth.google(clientID, fields).then(onSuccess, onFailure);
        };
    });
    
    app.controller('MainController', function ($scope, $log) {
        
    });
    
    app.controller('DetailsController', function ($scope, $log, $stateParams, $state) {
        
        $scope.missingSystemMessage = 'Please choose a system';
        
        $scope.toDashboard = function(systemID) {
            $state.go('^.dashboard', { systemID: systemID });
        };
        
        $scope.toAnalytics = function(systemID) {
            $state.go('^.analytics', { systemID: systemID });
        };
        
        $scope.toSocial = function(systemID) {
            $state.go('^.social', { systemID: systemID });
        };
        
        $scope.toSettings = function(systemID) {
            $state.go('^.settings', { systemID: systemID });
        };
    });
    
    app.controller('SystemsController', function ($rootScope, $scope, $log, $state, $ionicHistory) {
        
        function fetchSystems() {
            // THE FOLLOWING ARE MOCK DATA
            $scope.systems = [
                {
                    ID: '1',
                    name: 'Test1'
                },
                {
                    ID: '2',
                    name: 'Test2'
                },
                {
                    ID: '3',
                    name: 'Test3'
                }
            ];
        }
        
        $scope.viewSystem = function(systemID) {
            $rootScope.systemID = systemID;
            $ionicHistory.clearHistory();
            $ionicHistory.nextViewOptions({
                historyRoot: true, 
            });
            $state.go('.', { systemID: systemID });
        };
        
        $scope.$on('$ionicView.loaded', fetchSystems);
    });
    
    app.controller('DashboardController', function ($scope, $log, $stateParams) {
        
        function fetchSystem() {
            $scope.systemID = $stateParams.systemID;
            // THE FOLLOWING ARE MOCK DATA
            $scope.system = {
                ID: $scope.systemID,
                name: 'Test' + $scope.systemID,
                statistics: [
                    {
                        name: 'pH',
                        value: 6.82
                    },
                    {
                        name: 'Temp',
                        value: 26.0
                    },
                    {
                        name: 'Light',
                        value: 120
                    },
                    {
                        name: 'NO3',
                        value: 50
                    },
                    {
                        name: 'NO2',
                        value: 37
                    },
                    {
                        name: 'O2',
                        value: 250
                    }
                ]
            };
        }
        
        $scope.$on('$ionicView.loaded', fetchSystem);
    });
    
    app.controller('AnalyticsController', function ($scope, $log, $stateParams) {
        
        
    });
    
    app.controller('SocialController', function ($scope, $log, $stateParams) {
        
        
    });
    
    app.controller('SettingsController', function ($scope, $log, $stateParams, $state, $ionicHistory) {
        
        $scope.logout = function() {
            $ionicHistory.clearHistory();
            $ionicHistory.nextViewOptions({
                historyRoot: true, 
            });
            $state.go('portal');
        };
    });
    
    app.controller('SubmissionController', function ($scope, $log, $stateParams, $state) {
        
        function beforeEnter() {
            $scope.data = $stateParams.data;
            $scope.system = {
                date: Date.now()
            };
        }
        
        $scope.$on('$ionicView.beforeEnter', beforeEnter);
    });
    
})();