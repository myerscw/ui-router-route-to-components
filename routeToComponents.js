(function(){
	'use strict';

	angular
	.module('ui.router.components', ['ui.router'])
	.config(registerComponentDecorator);

	var args2Array = function args2Array(_args) {
		return Array.prototype.slice.call(_args);
	};

	function bindResolves() {
		var injectNames = controller.$inject = ['$scope'].concat(args2Array(arguments));

		function controller($scope) {
			var injectValues = args2Array(arguments);
			for (var i = 1; i < injectValues.length; i++) {
				$scope[injectNames[i]] = injectValues[i];
			}
		}

		return controller;
	}

	var getCompInputs = function getCompInputs($injector, componentName) {
		return $injector.get(componentName + "Directive").map(function (directive) {
			return Object.keys(directive.bindToController);
		}).reduce(unnestR, []);
	};

	var unnestR = function unnestR(acc, array) {
		return acc.concat(array);
	};

	function setStateDef(stateDef) {
		stateDef.controllerProvider = function ($injector) {
			return bindResolves.apply(null, getCompInputs($injector, stateDef.component));
		};

		stateDef.templateProvider = function ($injector) {
			var attrs = getCompInputs($injector, stateDef.component).map(function (key) {
				return key + '="' + key + '"';
			}).join(" ");
			var kebobName = stateDef.component.replace(/([A-Z])/g, function ($1) {
				return "-" + $1.toLowerCase();
			});
			var template = '<' + kebobName + ' ' + attrs + '></' + kebobName + '>';
			return template;
		};
	}

	function registerComponentDecorator($stateProvider) {
		$stateProvider.decorator('component', function (stateDef, parent) {
			if (stateDef.component) {
				setStateDef(stateDef);
			}
			if (stateDef.views) {
				for (var view in stateDef.views) {
					if (stateDef.views[view].component) {
						setStateDef(stateDef.views[view]);
					}
				}
			}

			return stateDef.component;
		});
	}

}());
