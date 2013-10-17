angular.module('percival-utils', [])

.factory("$stringUtils", ['$syntaxUtils', function($syntaxUtils) {
  var _operatorsByType = $syntaxUtils.getOperators();

  return {
    fromExpression: function(string, types) {
      if (this._isSingleCondition(string)) {
        return {and: [this._itemFromString(string, types)]};
      }

      return this._fromString(string, types);
    },

    _isSingleCondition: function(string) {
      var result = string.match(/^([a-zA-Z_]+)\s(!=|==)\s("?\w+"?)$/);
      return !!result;
    },

    _fromString: function(string, types) {
      if (this._isSingleCondition(string)) {
        return this._itemFromString(string, types);
      } else {
        return this._groupFromString(string, types);
      }
    },

    _itemFromString: function(string, types) {
      var matches = string.match(/([a-zA-Z_]+)\s(!=|==|is|is\snot|>=|>|<=|<)\s("?\w+"?)/);

      var type = types.filter(function(t) {return t.field === matches[1];})[0];
      var operators = _operatorsByType[type.realtype];
      var operator = operators.filter(function(o) {return o.label === matches[2];})[0];

      return {
        field: matches[1],
        op: {text: operator.label, id: operator.value},
        rhs: {realtype: type.realtype, value: type.realtype === 'string' ? matches[3].replace(/"/g, '') : matches[3]}
      };
    },

    _groupFromString: function(string, types) {
      var parsed = this._parseGroup(string);

      var groupType = this._getGroupType(parsed.string);
      if (!groupType) {
        return undefined;
      }

      var group = {};
      group[groupType] = [];

      var items = parsed.string.split(' ' + groupType +  ' ');

      for (var i = 0; i < items.length; i++) {
        if (items[i].match(/_\d+_/)) {
          group[groupType].push(this._groupFromString(
            parsed.groups[+items[i].replace(/_/g, '')],
            types
          ));
        } else {
          group[groupType].push(this._itemFromString(items[i], types));
        }
      }

      return group;
    },

    _parseGroup: function(string) {
      // we assume the outer parenthesis have been removed, if there was any
      var groups = {};
      var index = 0;

      var iterator = 0;
      var inside = false;
      var openBraces = 0;
      var inner = "";
      var foundInners = [];
      while (iterator < string.length) {
        if (string.charAt(iterator) === "(") {
          openBraces++;
          inside = true;
        }

        if (inside) {
          inner = inner + string.charAt(iterator);
        }

        if (string.charAt(iterator) === ")") {
          openBraces--;
          inside = openBraces > 0;
        }

        if (!inside && inner !== "") {
          foundInners.unshift(inner);
          inner = "";
        }
        iterator++;
      }

      foundInners.forEach(function(st, i) {
        string = string.replace(st, '_' + i + '_');
        groups[i] = st.replace(/^\(/, '').replace(/\)$/, '');
      }, this);

      return {string: string, groups: groups};
    },


    _getGroupType: function(string) {
      string = string.replace(/"[^"]*"/g, "");

      var andFound = string.match(/\sand\s/) !== null;
      var orFound = string.match(/\sor\s/) !== null;

      if (andFound && orFound) {
        return null;
      }

      return andFound ? 'and' : 'or';
    },

    toExpression: function(tree) {
      return this._groupToString(tree);
    },

    _toString: function(o) {
      if (o.and || o.or) {
        return '(' + this._groupToString(o) + ')';
      }

      return this._itemToString(o);
    },

    _itemToString: function(item) {
      return item.field + ' ' + item.op.text + ' ' + (
        item.rhs.realtype === 'string' ?
        ('"' + item.rhs.value + '"') :
        item.rhs.value
      );
    },

    _groupToString: function(tree) {
      return (tree.and || tree.or).map(this._toString, this).join(
        tree.and ? ' and ' : ' or '
      );
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

  var isEmpty = function(o) {
    for (var key in o) {
      if (o.hasOwnProperty(key)) return false;
    }

    return true;
  };

  return {
    isValidAst: function(ast) {
      if (isEmpty(ast)) {
        return false;
      }

      return true;
    },

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

    parseSyntaxTree: function(tree, types) {
      return this._parseSyntaxTree(tree, [], 0, types);
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
})

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
}]);