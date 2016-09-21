(function (angular, undefined) {
    'use strict';

    angular.module('ng-server-validate', [])
        .constant('SERVER_VALIDATE_EVENT', 'ng-server-validate-event')
        .provider('ngServerValidateConfig', function () {
            var self = this;
            self.config = {
                root: null,
                field: 'field',
                message: 'message'
            };

            /**
             * Set global config
             *
             * @param {Object} config
             */
            self.setConfig = function (config) {
                angular.extend(self.config, config);
            };

            self.$get = function () {
                return self;
            };
        })
        .factory('serverValidateResponseInterceptor', ['$q', '$rootScope', 'SERVER_VALIDATE_EVENT', function ($q, $rootScope, SERVER_VALIDATE_EVENT) {
            return {
                responseError: function ($rejection) {
                    if ($rejection.status === 422) {
                        $rootScope.$broadcast(SERVER_VALIDATE_EVENT, {
                            errors: $rejection.data !== undefined ? $rejection.data : []
                        });
                    }

                    return $q.reject($rejection);
                }
            };
        }])
        .directive('ngServerValidate', ['ngServerValidateConfig', 'SERVER_VALIDATE_EVENT', function (ngServerValidateConfig, SERVER_VALIDATE_EVENT) {
            return {
                require: '^form',
                restrict: 'A',
                link: function ($scope, $element, attrs, form) {
                    var config = ngServerValidateConfig.config;
                    try {
                        angular.extend(config, $scope.$eval(attrs.ngServerValidate));
                    } catch (e) {}

                    angular.forEach(form, function (ngModel) {
                        if (angular.isObject(ngModel) && ngModel.hasOwnProperty('$modelValue')) {
                            ngModel.$validators.server = function () {
                                ngModel.$setValidity('server', true);
                                delete ngModel.$error.server;
                                return true;
                            };
                        }
                    });

                    $scope.$on(SERVER_VALIDATE_EVENT, function (event, data) {
                        if (form.ngServerValidating === true) {
                            form.ngServerValidating = false;

                            var errors = config.root === null ? data.errors : resolvePath(data.errors, config.root),
                                error, key, field;

                            for (key in errors) {
                                if (!errors.hasOwnProperty(key)) {
                                    continue;
                                }

                                error = errors[key];
                                field = config.field === '__key__' ? key : error[config.field];

                                if (form.hasOwnProperty(field)) {
                                    form[field].$setValidity('server', false);
                                    form[field].$error.server = getMessage(field, config.message, error);
                                }
                            }
                        }
                    });
                }
            };
        }])
        .directive('ngSubmit', function () {
            return {
                require: '?form',
                priority: 10,
                link: {
                    pre: function ($scope, $element, attrs, form) {
                        $element.on('submit', function () {
                            if (form && form.$valid === true) {
                                form.ngServerValidating = true;
                            }
                        });
                    }
                }
            };
        })
        .config(['$httpProvider', function ($httpProvider) {
            $httpProvider.interceptors.push('serverValidateResponseInterceptor');
        }])
        .run(function () {

        });

    function getMessage(field, messageField, error) {
        if (error[messageField]) {
            return error[messageField];
        } else if (angular.isArray(error)) {
            return error[0];
        } else if (angular.isObject(error)) {
            return error[Object.keys(error)[0]];
        } else if (angular.isString(error)) {
            return error;
        }

        return error[field];
    }

    function resolvePath(o, s) {
        s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        s = s.replace(/^\./, '');           // strip a leading dot
        var a = s.split('.'), i, n, k;
        for (i = 0, n = a.length; i < n; ++i) {
            k = a[i];
            if (k in o) {
                o = o[k];
            } else {
                return;
            }
        }
        return o;
    }
})(angular);