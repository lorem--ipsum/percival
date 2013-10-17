/*! percival - v1.0.0-beta - 2013-10-17
* https://github.com/lorem--ipsum/percival
* Copyright (c) 2013 Lorem Ipsum  Licensed ,  */
angular.module('percival-utils', [])

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

      if (itemIndex <= 0) {
        return;
      }

      items.splice(itemIndex, $syntaxUtils.getChildrenCount(item, items) + 1);
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

.factory('$syntaxUtils', function() {
  var _operatorsByType = {
    'string': [{label: 'is', value: 'eq'}, {label: 'is not', value: 'neq'}],
    'int': [{label: '==', value: 'eq'}, {label: '!=', value: 'ne'}],
    'datems': [
      {label: ">=", value: "ge"}, {label: "==", value: "eq"}, {label: "!=", value: "ne"}, {label: ">", value: "gt"},
      {label: "<", value: "lt"}, {label: "<=", value: "le"}
    ]
  };

  return {
    getOperators: function() {
      return _operatorsByType;
    },

    getChildrenCount: function(item, items) {
      var index = items.indexOf(item);
      var count = 0;
      var currentLevel = item.level;

      while(index + 1 < items.length && items[index + 1].level > item.level) {
        currentLevel = items[index].level;
        index++;
        count++;
      }

      return count;
    },

    getIndexOfLastChild: function(item, items) {
      var index = items.indexOf(item);
      var currentLevel = item.level;

      while(index + 1 < items.length && items[index + 1].level > item.level) {
        currentLevel = items[index].level;
        index++;
      }

      return index;
    },

    parseSyntaxGroup: function(syntaxGroup, level) {
      if (!syntaxGroup.and && !syntaxGroup.or) {
        return;
      }

      return {
        groupType: syntaxGroup.and ? 'and' : 'or',
        isGroup: true,
        level: level
      };
    },

    parseSyntaxItem: function(syntaxItem, level, types) {
      var type = types.filter(function(t) {return t.field === syntaxItem.field;})[0];
      var operators = _operatorsByType[type.realtype];
      var operator = operators.filter(function(o) {return syntaxItem.op.id === o.value;})[0];

      return {
        type: type,
        operators: _operatorsByType[type.realtype],
        operator: operator,
        value: syntaxItem.rhs.value,
        level: level
      };
    },

    parseSyntaxTree: function(tree, types) {
      return this._parseSyntaxTree(tree, [], 0, types);
    },

    _parseSyntaxTree: function(tree, ast, level, types) {
      ast = ast || [];
      level = level || 0;

      if (tree.and || tree.or) {
        var that = this;
        ast.push(this.parseSyntaxGroup(tree, level));
        (tree.and || tree.or).forEach(function(elm) {
          that._parseSyntaxTree(elm, ast, level+1, types);
        });
      } else {
        ast.push(this.parseSyntaxItem(tree, level, types));
      }

      return ast;
    },

    computeSyntaxTree: function(ast) {
      return this._getTree(ast, 0);
    },

    _getTree: function(items, index) {
      var tree = {};


      var group = tree[items[index].groupType] = [];

      var from = index + 1;
      var to = this.getIndexOfLastChild(items[index], items) + 1;
      var children = items.slice(from, to);

      for (var i = 0; i < children.length; i++) {
        if (children[i].isGroup) {
          group.push(this._getTree(children, i));
          i = this.getIndexOfLastChild(children[i], children);
        } else {
          group.push({
            field: children[i].type.field,
            op: {id: children[i].operator.value, text: children[i].operator.label},
            rhs: {realtype: children[i].type.realtype, value: children[i].value}
          });
        }
      }

      return tree;
    }
  };
});
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