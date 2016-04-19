(function() {

    'use strict';

    var app = angular.module('aqx');
    
    var host = 'http://127.0.0.1:5000'
    var endpoint = host + '/aqxapi/v2/';
    var USE_MOCK = true;
    
    app.factory('UserService', function($http, $q) {
        
        var service = {
            getUser: getUser
        };
        
        function getGoogleProfile(accessToken) {
            var deferred = $q.defer();
            function onSuccess(response) {
                deferred.resolve(response.data);
            }
            function onFailure(error) {
                deferred.reject(error);
            }
            var url = 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + accessToken;
            $http.get(url).then(onSuccess, onFailure);
            return deferred.promise;
        }
        
        function getUser(accessToken) {
            var deferred = $q.defer();
            var user = {};
            function onSuccess(googleProfile) {
                var googleID = googleProfile.id;
                user.googleID = googleID;
                user.name = googleProfile.name;
                user.email = googleProfile.email;
                user.picture = googleProfile.picture;
                if (USE_MOCK) {
                    deferred.resolve(user);
                }
                else {
                    $http.get(endpoint + 'user/' + googleID).then(onSuccess2, onFailure);    
                }
                
            }
            function onSuccess2(response) {
                user.ID = response.data.user.id;
                deferred.resolve(user);
            }
            function onFailure(error) {
                deferred.reject(error);
            }
            getGoogleProfile(accessToken).then(onSuccess, onFailure);
            return deferred.promise;
        }
        
        return service;
    });
    
    app.factory('LightMeterService', function ($q) {
        
        var service = {
            computeLux: computeLux
        }
        
        function computeLux(imageURI, exif) {
            var deferred = $q.defer();
            
            var exif = JSON.parse(exif).Exif;
            var ISO = exif.ISOSpeedRatings;
            var exposure = exif.ExposureTime;
            var brightnessValue = exif.BrightnessValue;
            
            var image = document.createElement('img');
            var context = document.createElement('canvas').getContext('2d');
            image.src = imageURI;
            
            var illuminance = 7500;
            
            var normalAverage = 0.0;
            var grayscale = 0.0;
            var imageBrightnessStd = 0.0;
            var imageBrightnessNonLinear = 0.0;
            
            image.onload = function() {
                var width = image.naturalWidth;
                var height = image.naturalHeight;
                context.drawImage(image, 0, 0, width, height);
                var data = context.getImageData(0, 0, width, height).data;
                var r, g, b, a;
                var pixelCount = data.length / 4;
                
                for (var i = 0; i < data.length; i += 4) {
                    
                    r = data[i];
                    g = data[i + 1];
                    b = data[i + 2];
                    
                    // normalAverage += (r + g + b) / 3.0;
                    grayscale += 0.299 * r + 0.587 * g + 0.114 * b;
                    // imageBrightnessStd += 0.2126 * r + 0.7152 * g + 0.0722 * b;
                    // imageBrightnessNonLinear += Math.sqrt( 0.241 * Math.pow(r, 2) + 0.691 * Math.pow(g, 2) + 0.068 * Math.pow(b, 2) );
                    pixelCount += 1;
                }
                
                // averageBrightness += (normalAverage + grayscale + imageBrightnessStd + imageBrightnessNonLinear) / (4 * pixelCount);
                var averageBrightness = grayscale / pixelCount;
                var totalIlluminance = illuminance * Math.pow(averageBrightness, 2) / (0.0929 * ISO / exposure);
                
                deferred.resolve(totalIlluminance);  
            }
            
            return deferred.promise;
        }
        
        return service;
    });

    app.factory('SystemService', function($http, $q) {

        var service = {
            getSystemsForUser: getSystemsForUser,
            getSystem: getSystem,
            getReadingsForSystem: getReadingsForSystem,
            submitReading: submitReading,
            submitAnnotation: submitAnnotation
        };
        
        var measurements = [
            {
                name: 'Alkalinity',
                column: 'alkalinity',
                unit: 'mg/L',
                min: 60.0,
                max: 140.0
            },
            {
                name: 'Ammonium',
                column: 'ammonium',
                unit: 'mg/L',
                min: 0.0,
                max: 1.0
            },
            {
                name: 'Chlorine',
                column: 'chlorine',
                unit: 'mg/L',
                min: null,
                max: null
            },
            {
                name: 'Hardness',
                column: 'hardness',
                unit: 'mg/L',
                min: 60.0,
                max: 140.0
            },
            {
                name: 'Light',
                column: 'light',
                unit: 'lux',
                min: null,
                max: null
            },
            {
                name: 'Nitrate',
                column: 'nitrate',
                unit: 'mg/L',
                min: 5.0,
                max: 159.0
            },
            {
                name: 'Nitrite',
                column: 'nitrite',
                unit: 'mg/L',
                min: 0.0,
                max: 0.25
            },
            {
                name: 'Oxygen',
                column: 'o2',
                unit: 'mg/L',
                min: null,
                max: null
            },
            {
                name: 'pH',
                column: 'ph',
                unit: null,
                min: 6.0,
                max: 7.0
            },
            {
                name: 'Temperature',
                column: 'temp',
                unit: '°C',
                min: 22.0,
                max: 30.0
            },
        ];

        function getSystemsForUser(userID) {
            var deferred = $q.defer();
            function onSuccess(response) {
                deferred.resolve(response);
            }
            function onFailure(error) {
                deferred.reject(error);
            }
            // THE FOLLOWING ARE MOCK DATA
            if (USE_MOCK) {
                onSuccess([
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
                ]);    
            }
            else {
                $http.get(endpoint + 'user/' + userID + '/system').then(onSuccess, onFailure);
            }
            return deferred.promise;
        }

        function getSystem(systemUID) {
            var deferred = $q.defer();
            function onSuccess(system) {
                deferred.resolve(system);
            }
            function onFailure(error) {
                deferred.reject(error);
            }
            // THE FOLLOWING ARE MOCK DATA
            if (USE_MOCK) {
                var readings = [];
                var measurement;
                for (var i = 0; i < measurements.length; i++) {
                    measurement = measurements[i];
                    measurement.max = measurement.max || 140;
                    measurement.min = measurement.min || 60;
                    readings.push({
                        name: measurement.name,
                        value: measurement.min + Math.random() * (measurement.max - measurement.min),
                        unit: measurement.unit
                    });
                }
                var system = {
                    ID: systemUID,
                    name: systemUID,
                    readings: readings
                };
                onSuccess(system);    
            }
            else {
                $http.get(endpoint + 'system/' + systemUID)    
            }
            return deferred.promise;
        }
        
        function getReadingsForSystem(systemUID) {
            function onSuccess(response) {
                
            }
            function onFailure(error) {
                
            }
            // $http.get(endpoint + 'system/' + systemUID + '/reading').then(onSuccess, onResponse);
        }

        function submitReading(systemUID, type, reading) {
            function onSuccess(response) {
                
            }
            function onFailure(error) {
                
            }
            // $http.post(endpoint + 'system/' + systemUID + '/reading/' + type, reading).then(onSuccess, onFailure);
        }
        
        function submitAnnotation(systemID, annotation) {
            function onSuccess(response) {
                
            }
            function onFailure(error) {
                
            }
            // $http.post(endpoint + 'system/' + systemID + '/annotation', annotation).then(onSuccess, onFailure);
        }

        return service;
    });

})();