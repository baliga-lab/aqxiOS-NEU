(function() {

    'use strict';

    var app = angular.module('aqx');

    app.factory('SystemService', function($http, $q) {

        var service = {
            getSystemsForUser: getSystemsForUser,
            getSystem: getSystem,
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
            function onSuccess(systems) {
                deferred.resolve(systems);
            }
            function onFailure(error) {
                deferred.reject(error);
            }
            // THE FOLLOWING ARE MOCK DATA
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
            
            return deferred.promise;
        }

        function getSystem(systemID) {
            var deferred = $q.defer();
            function onSuccess(system) {
                deferred.resolve(system);
            }
            function onFailure(error) {
                deferred.reject(error);
            }
            // THE FOLLOWING ARE MOCK DATA
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
                ID: systemID,
                name: 'Test' + systemID,
                readings: readings
            };
            onSuccess(system);
            
            return deferred.promise;
        }

        function submitReading(systemID, type, reading) {
            
        }
        
        function submitAnnotation(systemID, annotationID, timestamp) {
            
        }

        return service;
    });

})();