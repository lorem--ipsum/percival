describe('$stringUtils', function() {
  beforeEach(module("percival-utils"));

  describe('to and from string', function() {
    var types = [
      {label: "Baz", field: "baz_field", realtype: "int"},
      {label: "Bar", field: "bar_field", realtype: "datems"},
      {label: "Foo", field: "foo_field", realtype: "string"}
    ];

    it('should parse a group', inject(function($stringUtils) {
      var s = $stringUtils._parseGroup;

      expect(s('foo != 42 and bar_or == 47')).toEqual({
        string: 'foo != 42 and bar_or == 47',
        groups: {}
      });

      expect(s('foo != 42 and (bar == 47 or bar == 45)')).toEqual({
        string: 'foo != 42 and _0_',
        groups: {0: "bar == 47 or bar == 45"}
      });
    }));

    it('should detect single conditions', inject(function($stringUtils) {
      var s = $stringUtils._isSingleCondition;

      expect(s('baz_field != 42')).toBeTruthy();
      expect(s('baz_field != 42 and foo_field != "pouet"')).toBeFalsy();
      expect(s('(baz_field != 42 or bar_field != 1337) and foo_field == "pouet"')).toBeFalsy();
    }));

    it('should return group type or null if inconsistent', inject(function($stringUtils) {
      var s = $stringUtils._getGroupType;

      expect(s('(foo != 42 and bar_or == 47)')).toBe('and');
      expect(s('(foo != 42 or bar == 47)')).toBe('or');
      expect(s('(foo != 42 or bar == 47 and baz == "or")')).toBe(null);
      expect(s('(foo != 42 and bar == 47 and baz == "or")')).toBe('and');
      // foo != 42 and bar == 47 and (baz == "pouet" or baz != "tut" or (baz != "gno" and baz != "gnu")))
    }));

    it('should parse back and forth a simple ast', inject(function($stringUtils) {
      var ast = {
        and: [{
          field: "baz_field",
          op: {text: "!=", id: "ne"},
          rhs: {realtype: "int", value: "42"}
        }]
      };
      
      var expression = "baz_field != 42";
      
      expect($stringUtils.toExpression(ast)).toBe(expression);
      expect($stringUtils.fromExpression(expression, types)).toEqual(ast);
    }));

    it('should parse back and forth two groups in an ast', inject(function($stringUtils) {
      var ast = {
        and: [{
          or: [{
            field: "baz_field",
            op: {text: "!=", id: "ne"},
            rhs: {realtype: "int", value: "42"}
          },
          {
            field: "bar_field",
            op: {text: "!=", id: "ne"},
            rhs: {realtype: "datems", value: "1337"}
          }]
        },
        {
          field: "foo_field",
          op: {text: "is", id: "eq"},
          rhs: {realtype: "string", value: "pouet"}
        }]
      };
      
      var expression = '(baz_field != 42 or bar_field != 1337) and foo_field is "pouet"';
      
      expect($stringUtils.toExpression(ast)).toEqual(expression);
      expect($stringUtils.fromExpression(expression, types)).toEqual(ast);
    }));
  });
});