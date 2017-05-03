(function (root, factory) {
  'use strict';

  /* istanbul ignore next */
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['angular'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    // to support bundler like browserify
    var angularObj = angular || require('angular');
    if ((!angularObj || !angularObj.module) && typeof angular != 'undefined') {
      angularObj = angular;
    }
    module.exports = factory(angularObj);
  } else {
    // Browser globals (root is window)
    factory(root.angular);
  }
})(this, function (angular) {
  'use strict';

  return angular.module('ga', [])
    .factory('ga', ['$window', function ($window) {

      var ga = function () {
        if (angular.isArray(arguments[0])) {
          for (var i = 0; i < arguments.length; ++i) {
            ga.apply(this, arguments[i]);
          }
          return;
        }
        // console.log('ga', arguments);
        if ($window.ga) {
          $window.ga.apply(this, arguments);
        }
      };

      return ga;
    }])
    .run(['$rootScope', '$location', 'ga', function ($rootScope, $location, ga) {

      $rootScope.$on('$routeChangeStart', function () {
        ga('set', 'page', $location.url());
      });

    }])
    /**
     ga="'send', 'event', 'test'" ga-on="click|hover|init"
     */
    .directive('ga', ['ga', function (ga) {
      return {
        restrict: 'A',
        scope: false,
        link: function ($scope, $element, $attrs) {
          var bindToEvent = $attrs.gaOn || 'click';

          var onEvent = function () {
            var command = $attrs.ga;
            if (command) {
              if (command[0] === '\'') command = '[' + command + ']';

              command = $scope.$eval(command);
            } else {
              // auto command
              var href = $element.attr('href');
              if (href && href === '#') href = '';
              var category = $attrs.gaCategory ? $scope.$eval($attrs.gaCategory) :
                  (href && href[0] !== '#' ? (href.match(/\/\//) ? 'link-out' : 'link-in') : 'button'),
                action = $attrs.gaAction ? $scope.$eval($attrs.gaAction) :
                  (href ? href : 'click'),
                label = $attrs.gaLabel ? $scope.$eval($attrs.gaLabel) :
                  ($element[0].title || ($element[0].tagName.match(/input/i) ? $element.attr('value') : $element.text())).substr(0, 64),
                value = $attrs.gaValue ? $scope.$eval($attrs.gaValue) : null;
              command = ['send', 'event', category, action, label];
              if (value !== null) command.push(value);
            }
            ga.apply(null, command);
          };

          if (bindToEvent === 'init') {
            onEvent();
          } else {
            $element.bind(bindToEvent, onEvent);
          }
        }
      };
    }])
    .name;
});

