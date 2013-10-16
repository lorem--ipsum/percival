angular.module('ng-boolean-editor', ['ng-boolean-editor.utils'])

.directive('dateTime', ['$datetimeutils', function($datetimeutils) {
  return {
    restrict: 'E',
    replace: true,
    scope: {value: '='},
    link: function($scope) {
      $scope.model = $datetimeutils.dateToModel($scope.value);

      $scope.$watch('value', function(v) {
        if ($datetimeutils.same($scope.model, v)) {
          return;
        }

        $scope.model = $datetimeutils.dateToModel(v);
      });

      $scope.$watch('model', function(m) {
        if ($datetimeutils.same(m, $scope.value)) {
          return;
        }

        $scope.value = $datetimeutils.modelToDate(m);
      }, true);

    },
    templateUrl: 'datetime-template.html'
  };
}])

.factory('$datetimeutils', function() {
  return {
    same: function(model, date) {
      return this.modelToDate(model) === date;
    },

    dateToModel: function(ms) {
      var date = ms ? new Date(ms) : new Date();
      return {
        hours: date.getHours(),
        minutes: date.getMinutes(),
        seconds: date.getSeconds(),
        milliseconds: date.getMilliseconds(),
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear()
      };
    },

    modelToDate: function(model) {
      var d = new Date();

      d.setHours(+model.hours);
      d.setMinutes(+model.minutes);
      d.setSeconds(+model.seconds);
      d.setMilliseconds(+model.milliseconds);
      d.setDate(+model.day);
      d.setMonth(+model.month - 1);
      d.setFullYear(+model.year);

      return d.getTime();
    }
  };
})

.factory('$editorUtils', ['$syntaxUtils', function($syntaxUtils) {
  return {
    newItem: function(parent, types) {
      return {
        level: parent.isGroup ? parent.level + 1 : parent.level,
        type: types[0],
        operators: $syntaxUtils.getOperators()[types[0].realtype],
        operator: $syntaxUtils.getOperators()[types[0].realtype][0]
      };
    },

    getBlankAst: function() {
      return [{groupType: 'and', isGroup: true, level: 0}];
    },

    removeItem: function(item, items) {
      var itemIndex = items.indexOf(item);

      if (itemIndex < 0) {
        return;
      }

      items.splice(itemIndex, $syntaxUtils.getIndexOfLastChild(item, items));
    },

    addAfter: function(item, items, types) {
      items.splice(items.indexOf(item) + 1, 0, this.newItem(item, types));
    },

    addGroupAfter: function(parent, items) {
      var group = {
        isGroup: true,
        groupType: 'and',
        level: parent.isGroup ? parent.level + 1 : parent.level
      };

      items.splice(items.indexOf(parent) + 1, 0, group);
    }
  };
}])

.directive('editor', ['$syntaxUtils', '$editorUtils', function($syntaxUtils, $editorUtils) {
  // Runs during compile
  return {
    scope: {types: "=", conditions: '='},
    controller: function($scope, $element, $attrs) {
      if (!$scope.conditions || !$scope.types) {
        return;
      }

      $scope.operators = $syntaxUtils.getOperators();

      $scope.newItem = function(parent) {return $editorUtils.newItem(parent, $scope.types);};
      $scope.resetAst = function() {$scope.items = $editorUtils.getBlankAst();};
      $scope.remove = function(item) {$editorUtils.removeItem(item, $scope.items);};
      $scope.addAfter = function(item) {$editorUtils.addAfter(item, $scope.items, $scope.types);};
      $scope.addGroupAfter = function(parent) {$editorUtils.addGroupAfter(parent, $scope.items);};

      $scope.getStyle = function(item) {
        return {'padding-left': 30 * item.level + 'px'};
      };

      $scope.resetAst();

      $scope.items = $syntaxUtils.parseSyntaxTree($scope.conditions, $scope.types);

      $scope.$watch('items', function() {
        $scope.conditions = $syntaxUtils.computeSyntaxTree($scope.items, $scope.realtypes);
      });
    },
    restrict: 'E',
    templateUrl: 'conditions-template.html'
  };
}]);