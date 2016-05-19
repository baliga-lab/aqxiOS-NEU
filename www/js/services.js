(function () {

    'use strict';

    var app = angular.module('aqx');

    var host = 'https://pf1010.systemsbiology.net'
    var endpoint = host + '/aqxapi/v2/';

    app.factory('UserService', function ($http, $q) {

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
                $http.get(endpoint + 'user/' + googleID).then(onSuccess2, onFailure);
            }
            function onSuccess2(response) {
                user.ID = response.data.userID;
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

            var illuminance = 750;

            var tr = 0, tg = 0, tb = 0;
            var normalAverage = 0;
            var grayscale = 0;
            var brightnessLinear = 0;
            var brightnessNonLinear = 0;

            image.onload = function () {
                var width = image.naturalWidth;
                var height = image.naturalHeight;
                context.drawImage(image, 0, 0, width, height);
                var data = context.getImageData(0, 0, width, height).data;
                var pixelCount = data.length / 4;
                var totalIlluminance;

                for (var i = 0; i < data.length; i += 4) {

                    tr += data[i];
                    tg += data[i + 1];
                    tb += data[i + 2];

                    // brightnessNonLinear += Math.sqrt( 0.241 * Math.pow(data[i], 2) + 0.691 * Math.pow(data[i+1], 2) + 0.068 * Math.pow(data[i+2], 2) );
                }

                grayscale = (0.299 * tr + 0.587 * tg + 0.114 * tb);
                // normalAverage = (tr + tg + tb) / 3;
                // brightnessLinear = (0.299 * tr + 0.587 * tg + 0.114 * tb);

                // averageBrightness += (normalAverage + grayscale + brightnessLinear + brightnessNonLinear) / (4 * pixelCount);
                var averageBrightness = grayscale / pixelCount;

                if (brightnessValue > 3) {
                    totalIlluminance = illuminance * Math.pow(averageBrightness, 2) / (ISO * 0.4);
                    console.log("totalIlluminance of bright surrounding::  " + totalIlluminance);
                }
                else {
                    totalIlluminance = Math.pow(averageBrightness, 2) / (0.0929);
                    console.log("totalIlluminance of dark surrounding::  " + totalIlluminance);
                }

                deferred.resolve(totalIlluminance);
            }

            return deferred.promise;
        }

        return service;
    });

    app.factory('SystemService', function ($http, $q, $filter) {

        var service = {
            getSystemsForUser: getSystemsForUser,
            getSystem: getSystem,
            getReadingsForSystem: getReadingsForSystem,
            submitReading: submitReading,
            submitAnnotation: submitAnnotation
        };

        var measurements = {

            alkalinity: {
                name: 'Alkalinity',
                unit: 'mg/L'
            },
            ammonium: {
                name: 'Ammonium',
                unit: 'mg/L'
            },
            chlorine: {
                name: 'Chlorine',
                unit: 'mg/L'
            },
            hardness: {
                name: 'Hardness',
                unit: 'mg/L'
            },
            light: {
                name: 'Light',
                unit: 'lux',
            },
            nitrate: {
                name: 'Nitrate',
                unit: 'mg/L'
            },
            nitrite: {
                name: 'Nitrite',
                unit: 'mg/L'
            },
            o2: {
                name: 'Oxygen',
                unit: 'mg/L'
            },
            ph: {
                name: 'pH',
                unit: null
            },
            temp: {
                name: 'Temperature',
                unit: '°C'
            }
        };

        function getSystemsForUser(userID) {
            var deferred = $q.defer();
            function onSuccess(response) {
                deferred.resolve(response.data);
            }
            function onFailure(error) {
                deferred.reject(error);
            }
            $http.get(endpoint + 'user/' + userID + '/system').then(onSuccess, onFailure);
            return deferred.promise;
        }

        function getSystem(systemUID) {
            var deferred = $q.defer();
            function onSuccess(response) {
                var data = response.data;
                var metadata = [
                    {
                        key: 'Name',
                        value: data.name
                    },
                    {
                        key: 'Status',
                        value: data.status.charAt(0).toUpperCase() + data.status.slice(1).toLowerCase()
                    },
                    {
                        key: 'Technique',
                        value: data.technique
                    },
                    {
                        key: 'Start Date',
                        value: data.startDate
                    },
                    {
                        key: 'Location',
                        value: $filter('number')(data.location.lat, 2) + ', ' + $filter('number')(data.location.lng, 2)
                    },
                    {
                        key: 'Growbed Media',
                        value: data.gbMedia.map(function (medium) { return medium.name }).join(', ')
                    },
                    {
                        key: 'Crops',
                        value: data.crops.map(function (crop) { return crop.count + ' ' + crop.name }).join(', ')
                    },
                    {
                        key: 'Organisms',
                        value: data.organisms.map(function (organism) { return organism.count + ' ' + organism.name }).join(', ')
                    }
                ]
                deferred.resolve(metadata);
            }
            function onFailure(error) {
                deferred.reject(error);
            }
            $http.get(endpoint + 'system/' + systemUID).then(onSuccess, onFailure);
            return deferred.promise;
        }

        function getReadingsForSystem(systemUID) {
            var deferred = $q.defer();
            function onSuccess(response) {
                var readings = [];
                var r, datum;
                for (r in response.data) {
                    datum = response.data[r];
                    readings.push({
                        name: measurements[datum.name].name,
                        value: datum.value,
                        unit: measurements[datum.name].unit,
                        type: datum.name
                    });
                }
                deferred.resolve(readings);
            }
            function onFailure(error) {
                deferred.reject(error);
            }
            $http.get(endpoint + 'system/' + systemUID + '/reading').then(onSuccess, onFailure);
            return deferred.promise;
        }

        function submitReading(systemUID, type, reading) {
            var deferred = $q.defer();
            function onSuccess(response) {
                deferred.resolve(response.data);
            }
            function onFailure(error) {
                deferred.reject(error);
            }
            reading.timestamp = new Date(
                reading.date.getFullYear(), reading.date.getMonth(), reading.date.getDate(), 
                reading.time.getHours(), reading.time.getMinutes(), reading.time.getSeconds(), reading.time.getMilliseconds());
            console.log(reading);
            $http.post(endpoint + 'system/' + systemUID + '/reading/' + type, reading).then(onSuccess, onFailure);
            return deferred.promise;
        }

        function submitAnnotation(systemID, annotation) {
            var deferred = $q.defer();
            function onSuccess(response) {
                deferred.resolve(response.data);
            }
            function onFailure(error) {
                deferred.reject(error);
            }
            annotation.timestamp = new Date(
                annotation.date.getFullYear(), annotation.date.getMonth(), annotation.date.getDate(), 
                annotation.time.getHours(), annotation.time.getMinutes(), annotation.time.getSeconds(), annotation.time.getMilliseconds());
            console.log(annotation);
            $http.post(endpoint + 'system/' + systemID + '/annotation', annotation).then(onSuccess, onFailure);
            return deferred.promise;
        }

        return service;
    });

})();