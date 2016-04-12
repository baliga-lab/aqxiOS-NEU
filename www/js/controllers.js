(function() {

    'use strict';

    var app = angular.module('aqx');

    app.controller('PortalController', function($rootScope, $scope, $log, $state, $cordovaOauth, $cookies, $http) {

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
                var url = 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + accessToken;
                $http.get(url).then(onSuccess2, onFailure);
            }
            function onSuccess2(response) {
                $log.debug(response.data);
                $rootScope.user = response.data;
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
            SystemService.getSystemsForUser($scope.user.id).then(onSuccess, onFailure);
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

    app.controller('InputReadingController', function($scope, $log, $stateParams, $state, $cordovaCamera, SystemService) {

        function beforeEnter() {
            $scope.systemID = $stateParams.systemID;
            $scope.type = $stateParams.type;
            $scope.reading = {
                date: new Date(),
                time: new Date()
            };
        }

        function getLux(imageURI, exif, callback) {

            //Parse Exif data
            var parsedExif = JSON.parse(exif);
            var isoSpeed = parsedExif.Exif.ISOSpeedRatings;
            var exposureTime = parsedExif.Exif.ExposureTime;
            var brightnessValue =  parsedExif.Exif.BrightnessValue;

            var image = document.createElement('img');
            var context = document.createElement('canvas').getContext('2d');
            image.src = imageURI;

            var normalAvg = 0.0;
            var grayscale = 0.0;
            var imageBrightnessStd = 0.0;
            var imageBrightnessNonLinear = 0.0;
            var pixelCount = 0.0;
            var avgBrightness = 0.0;
            var totalIlluminance_C750;

            image.onload = function() {

                var width =  image.naturalWidth;
                var height = image.naturalHeight;
                context.drawImage(image, 0, 0, width, height);
                var data = context.getImageData(0, 0, width, height).data;

                for (var i = 0; i < data.length; i += 4) {
                    normalAvg = normalAvg + (data[i] + data[i + 1] + data[i + 2]) / 3;

                    grayscale = grayscale + 0.299 * data[i] + 0.587 * data[i + 1] + 0.114
                       * data[i + 2];

                    imageBrightnessStd = imageBrightnessStd + 0.2126 * data[i] + 0.7152 * data[i + 1]
                       + 0.0722 * data[i + 2];

                    imageBrightnessNonLinear = imageBrightnessNonLinear + Math.sqrt((Math.pow(data[i], 2) * 0.241
                       + Math.pow(data[i + 1], 2) * 0.691 + Math.pow(data[i + 2], 2) * 0.068));

                    pixelCount = pixelCount + 1;
                }
                    avgBrightness = avgBrightness + (normalAvg/pixelCount);
                    avgBrightness = avgBrightness + (grayscale/pixelCount);
                    avgBrightness = avgBrightness + (imageBrightnessStd/pixelCount);
                    avgBrightness = avgBrightness + (imageBrightnessNonLinear/pixelCount);
                    avgBrightness = avgBrightness / 4;
                    console.log(avgBrightness);


                    totalIlluminance_C750 = 7500 * Math.pow(avgBrightness, 2) / (0.0929 * isoSpeed / exposureTime);

                   console.log("Inlluminance : "+totalIlluminance_C750);
                   callback(totalIlluminance_C750);
//                var oldIlluminance = Math.pow(avgBrightness, 2) / (0.0929);
//                var totalIlluminance_C112 = Double(112) * Math.pow(avgBrightness, 2) / (0.0929 * isoSpeed / exposureTime);
//                var totalIlluminance_C1k = Double(1000) * Math.pow(avgBrightness, 2) / (0.0929 * isoSpeed / exposureTime);
//                var totalIlluminance_C100 = Double(100) * Math.pow(avgBrightness, 2) / (0.0929 * isoSpeed / exposureTime);
//                var totalIlluminance_C1 = Math.pow(avgBrightness, 2) / (0.0929 * isoSpeed / exposureTime);
//                var totalIlluminance_C112_192_AB = 112 * Math.pow(1.92, avgBrightness) / (0.0929 * isoSpeed / exposureTime);
//                var totalIlluminance_AB = Math.pow(avgBrightness, 2) / (0.0929 * isoSpeed / exposureTime);
//
//
//                var totalIlluminance_C750_BV = 750 * Math.pow(brightnessValue, 2) / (0.0929 * isoSpeed / exposureTime);
//            //outside works
//                var oldIlluminance_BV = Math.pow(brightnessValue, 2) / (0.0929);
//                var totalIlluminance_C112_BV = 112 * Math.pow(brightnessValue, 2) / (0.0929 * isoSpeed / exposureTime);
//                var totalIlluminance_C1_BV = Math.pow(brightnessValue, 2) / (0.0929 * isoSpeed / exposureTime);
//                var totalIlluminance_C112_192_BV = 112 * Math.pow(1.92, brightnessValue) / (0.0929 * isoSpeed / exposureTime);
//                var totalIlluminance_BV = Math.pow(brightnessValue, 2) / (0.0929 * isoSpeed / exposureTime);
//                var totalIlluminance_C100_BV = 100 * Math.pow(brightnessValue, 2) / (0.0929 * isoSpeed / exposureTime);

            };

        }

        $scope.launchLightMeter = function() {
            function onSuccess(data) {
                var pdata = JSON.parse(data);
                 getLux(pdata.filename, pdata.json_metadata, function(illuminanceResult){
                  console.log(illuminanceResult);
                  $scope.reading.value = illuminanceResult;
                });
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
