'use strict';

/* Controllers */

angular.module('myApp.controllers', ['d3'])
	.controller('AppCtrl', function ($scope, $http) {
		$scope.getuser = function() {
	        $http({ method: 'GET', url: 'api/user/vampire-weekend/2' //+ $scope.user.name + '/' + $scope.user.depth //document.getElementsByTagName('input')[0].value + '/' + document.getElementsByTagName('select')[0].value
			}).success(function (data, status, headers, config) {
				$scope.data = data;
			}).error(function (data, status, headers, config) {
				$scope.name = 'Error!'
			});
	  };
	});

angular.module('d3', [])
.factory('d3Service', ['$document', '$window', '$q', '$rootScope',
  function($document, $window, $q, $rootScope) {
    var d = $q.defer(),
      d3service = {
        d3: function() { return d.promise; }
      };
  function onScriptLoad() {
    // Load client in the browser
    $rootScope.$apply(function() { d.resolve($window.d3); });
  }
  var scriptTag = $document[0].createElement('script');
  scriptTag.type = 'text/javascript'; 
  scriptTag.async = true;
  scriptTag.src = 'http://d3js.org/d3.v3.min.js';
  scriptTag.onreadystatechange = function () {
    if (this.readyState == 'complete') onScriptLoad();
  }
  scriptTag.onload = onScriptLoad;
 
  var s = $document[0].getElementsByTagName('body')[0];
  s.appendChild(scriptTag);
 
  return d3service;
}]);