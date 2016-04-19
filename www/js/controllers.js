(function() {

    'use strict';

    var app = angular.module('aqx');

    app.controller('PortalController', function($rootScope, $scope, $log, $state, $cordovaOauth, $cookies, UserService) {

        var clientID = '651960916780-kndehhtq3aooce9ftb0ss4ppbd3irqi1.apps.googleusercontent.com';
        var scopes = ['profile', 'email'];

        function beforeEnter() {
            $rootScope.user = {};
        }

        $scope.login = function() {
            function onSuccess(cookie) {
                $log.debug(cookie);
                var accessToken = cookie.access_token;
                var expires = new Date() + cookie.expires_in * 1000;
                $cookies.put('accessToken', accessToken, { expires: expires });
                UserService.getUser(accessToken).then(onSuccess2, onFailure);
            }
            function onSuccess2(user) {
                $log.debug(user);
                $rootScope.user = user;
                $state.go('main.systems');
            }
            function onFailure(error) {
                $log.error(error);
            }
            // $state.go('main.systems');
            $cordovaOauth.google(clientID, scopes).then(onSuccess, onFailure);
        };

        $scope.$on('$ionicView.beforeEnter', beforeEnter);
    });

    app.controller('MainController', function($scope, $log) {
            
    });

    app.controller('MenuController', function($scope, $log, $state, $ionicHistory, $cookies) {

        $scope.menu = [
            {
                name: 'Systems',
                onTap: function() {
                    $state.go('main.systems');
                }
            },
            {
                name: 'Log Out',
                onTap: function() {
                    $ionicHistory.clearHistory();
                    $ionicHistory.nextViewOptions({
                        historyRoot: true,
                    });
                    $cookies.remove('accessToken');
                    $state.go('portal');
                }
            }
        ];
    });

    app.controller('SystemsController', function($rootScope, $scope, $log, $state, SystemService) {

        function fetchSystems() {
            function onSuccess(systems) {
                $scope.systems = systems;
            }
            function onFailure(error) {
                $log.error(error);
            }
            SystemService.getSystemsForUser($scope.user.ID).then(onSuccess, onFailure);
        }

        $scope.addSystem = function() {
            $state.go('main.systems.editSystem')
        };

        $scope.viewSystem = function(systemID) {
            $rootScope.systemID = systemID;
            $state.go('main.systemOverview', { systemID: systemID });
        };

        $scope.$on('$ionicView.beforeEnter', fetchSystems);
    });

    app.controller('OverviewController', function($scope, $log, $stateParams, $state, SystemService) {

        function beforeEnter() {
            $scope.systemID = $stateParams.systemID;
            function onSuccess(system) {
                $log.debug(system);
                $scope.system = system;
            }
            function onFailure(error) {
                $log.error(error);
            }
            SystemService.getSystem($scope.systemID).then(onSuccess, onFailure);
        }
        
        $scope.inputReading = function(type) {
            $state.go('main.inputReading', { type: type, systemID: $scope.systemID });
        }
        
        $scope.inputAnnotation = function() {
            $state.go('main.inputAnnotation', { systemID: $scope.systemID });
        }

        $scope.$on('$ionicView.beforeEnter', beforeEnter);
    });

    app.controller('InputReadingController', function($scope, $log, $stateParams, $state, $cordovaCamera, SystemService, LightMeterService, $ionicLoading) {

        function beforeEnter() {
            $scope.systemID = $stateParams.systemID;
            $scope.type = $stateParams.type;
            $scope.reading = {
                date: new Date(),
                time: new Date()
            };
        }

        $scope.launchLightMeter = function() {
            function onSuccess(data) {
                var pdata = JSON.parse(data);
                LightMeterService.computeLux(pdata.filename, pdata.json_metadata).then(onSuccess2);
                $ionicLoading.show({ template: 'Computing...' })
            }
            function onSuccess2(lux) {
                $ionicLoading.hide();
                console.log(lux);
                $scope.reading.value = lux;
            }
            function onFailure(error) {
                $log.error(error);
                $scope.response = error;
            }
            var options = {
                quality: 50,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: false,
                mediaType: Camera.MediaType.PICTURE,
                encodingType: Camera.EncodingType.JPEG,
                saveToPhotoAlbum: false,
                correctOrientation: true,
                cameraDirection: Camera.Direction.BACK
            };
            $cordovaCamera.getPicture(options).then(onSuccess, onFailure);
        };

        $scope.submitReading = function(reading) {
            function onSuccess(response) {

            }
            function onFailure(error) {

            }
            SystemService.submitReading($scope.systemID, $scope.type, $scope.reading).then(onSuccess, onFailure);
        };

        $scope.$on('$ionicView.beforeEnter', beforeEnter);
    });

    app.controller('InputAnnotationController', function($scope, $log, $stateParams, $state, SystemService) {

        function beforeEnter() {
            $scope.type = $stateParams.type;
            $scope.reading = {
                date: Date.now(),
                time: Date.now()
            };
        }

        $scope.submitAnnotation = function(annotation) {
            function onSuccess(response) {

            }
            function onFailure(error) {

            }
            SystemService.submitAnnotation($scope.systemID, $scope.type, $scope.reading).then(onSuccess, onFailure);
        }

        $scope.$on('$ionicView.beforeEnter', beforeEnter);
    });

})();