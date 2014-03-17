'use strict';

/* Directives */

angular.module('myApp.directives', ['d3'])
	.directive('soundcloudGraph', ['$window', '$timeout', 'd3Service', 
		function($window, $timeout, d3Service) {

		return {
			restrict: 'EA',
			scope: {
				data: '=chartData'
	    },

    	link: function (scope, element, attrs) {
    		d3Service.d3().then(function(d3) {

	    		var renderTimeout;
                var width = 960,
                    height = 500;

                var color = d3.scale.category20();

                var force = d3.layout.force()
                    .charge(-120)
                    .linkDistance(30)
                    .size([width, height]);

                var svg = d3.select("#graph").append("svg")
					.attr("viewBox", "0 0 " + width +  " " + height)
					.attr("preserveAspectRatio", "xMinYMin meet");

	        // Browser onresize event
	        /*window.onresize = function() {
	          scope.$apply();
	        };*/

	        scope.$watch(function(){
	        	return angular.element($window)[0].innerWidth;
	      	}, function() {
	      		scope.render(scope.data);
	      	});

	      	scope.$watch('data', function(newData, oldData) {
	    			return scope.render(newData);
	  			}, true);

	        scope.render = function(data) {

	          svg.selectAll('*').remove();
	          if (!data) return;


	          if(renderTimeout) clearTimeout(renderTimeout);

	          renderTimeout = $timeout(function() {
	          
						  data = {
							  "nodes":[
							    {"name":"Myriel","group":1},
							    {"name":"Napoleon","group":1},
							    {"name":"Mlle.Baptistine","group":1},
							    {"name":"Mme.Magloire","group":1},
							    {"name":"CountessdeLo","group":1},
							    {"name":"Geborand","group":1},
							    {"name":"Champtercier","group":1},
							    {"name":"Cravatte","group":1},
							    {"name":"Count","group":1},
							    {"name":"OldMan","group":1},
							  ],
							  "links":[
							    {"source":1,"target":0,"value":1},
							    {"source":2,"target":0,"value":8},
							    {"source":3,"target":0,"value":10},
							    {"source":3,"target":2,"value":6},
							    {"source":4,"target":0,"value":1},
							    {"source":5,"target":0,"value":1},
							    {"source":6,"target":0,"value":1},
							    {"source":7,"target":0,"value":1},
							    {"source":8,"target":0,"value":2},
							    {"source":9,"target":0,"value":1}
							  ]
							};

						  force
						      .nodes(data.nodes)
						      .links(data.links)
						      .linkDistance(115)
						      .charge(-200)
						      .chargeDistance(200)
						      .start();

						  var link = svg.selectAll(".link")
						      .data(data.links)
						    .enter().append("line")
						      .attr("class", "link")
						      .style("stroke-width", function(d) { return Math.sqrt(d.value); });

						  var node = svg.selectAll(".node")
						      .data(data.nodes)
						    .enter().append("circle")
						      .attr("class", "node")
						      .attr("r", 20)
						      .style("fill", function(d) { return color(d.group); })
						      .call(force.drag);

							var labels = svg.selectAll(".text")
				 			    .data(data.nodes)
				 			  .enter()
				 			    .append("text")
				 			    .attr({"x":function(d){return d.x;},
				 					   "y":function(d){return d.y;}})
				 			    .text(function(d){return d.name;})
				 			    .call(force.drag);

						  node.append("title")
							    .text(function(d) { return d.name; });

						  force.on("tick", function() {
						    link.attr("x1", function(d) { return d.source.x; })
						        .attr("y1", function(d) { return d.source.y; })
						        .attr("x2", function(d) { return d.target.x; })
						        .attr("y2", function(d) { return d.target.y; });

						    node.attr("cx", function(d) { return d.x; })
						        .attr("cy", function(d) { return d.y; });

						    labels.attr("x", function(d) { return d.x; })
		                    	.attr("y", function(d) { return d.y; }); 
						  }); 

						  svg.selectAll(".node").on("click", function() {
						  	alert("hi!");
						  });
						}, 200);
					};
    		});
  		}
		}
}])
