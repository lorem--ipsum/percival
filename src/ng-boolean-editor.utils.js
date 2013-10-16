angular.module('ng-boolean-editor.utils', [])

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