'use strict';

/* Controllers */

angular.module('myApp.controllers', ['d3'])
	.controller('AppCtrl', function ($scope, $http, scService) {

    $scope.depths = [2,3];
    $scope.depth = $scope.depths[0]; 

		$scope.discover = function() {
	        $http({ method: 'GET', url: 'api/user/' + $scope.user + '/' + $scope.depth
            }).success(function (data, status, headers, config) {
					$scope.data = data;
          // initialize soundcloud
          scService.init();
          scService.createPlaylist(data, $scope.user, function(err, playlistURL) {
              if (err)
                console.log("ERR: couldn't create playlist");
              else {
                console.log(playlistURL);
                $scope.playlistURL = playlistURL;
              }
            scService.openWidget(playlistURL);
          });
          
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