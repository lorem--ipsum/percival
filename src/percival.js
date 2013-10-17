angular.module('percival', ['percival-utils'])

.directive('editor', ['$editorUtils', '$syntaxUtils', function($editorUtils, $syntaxUtils) {
  // Runs during compile
  return {
    scope: {types: "=", conditions: '='},
    controller: ['$scope', function($scope) {
      if (!$scope.conditions || !$scope.types) {
        return;
      }
      $scope.operators = $syntaxUtils.getOperators();

      $scope.newItem = function(parent) {return $editorUtils.newItem(parent, $scope.types);};
      $scope.resetAst = function() {$scope.items = $editorUtils.getBlankAst();};
      $scope.remove = function(item) {$editorUtils.removeItem(item, $scope.items);};
      $scope.addAfter = function(item) {$editorUtils.addAfter(item, $scope.items, $scope.types);};
      $scope.addGroupAfter = function(parent) {$editorUtils.addGroupAfter(parent, $scope.items);};
      $scope.getChildrenCount = $syntaxUtils.getChildrenCount;

      $scope.resetAst();

      $scope.items = $syntaxUtils.parseSyntaxTree($scope.conditions, $scope.types);

      $scope.updateBounds = function(item) {
        if (item) {
          $scope.min_children_index = $scope.items.indexOf(item);
          $scope.max_children_index = $scope.min_children_index + $scope.getChildrenCount(item, $scope.items);
        } else {
          $scope.min_children_index = $scope.max_children_index = undefined;
        }
      };

      $scope.$watch('items', function() {
        $scope.conditions = $syntaxUtils.computeSyntaxTree($scope.items, $scope.realtypes);
        $scope.updateBounds($scope.hoveredItem);
      }, true);

      // here
      $scope.$watch('hoveredItem', $scope.updateBounds);
    }],
    restrict: 'E',
    templateUrl: 'conditions-template.html'
  };
}])

.directive('dateTime', ['$datetimeutils', function($datetimeutils) {
  return {
    restrict: 'E',
    transclude: true,
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
}]);