describe('$syntaxUtils', function() {
  beforeEach(module("percival-utils"));
  
  describe('getIndexOfLastChild function', function() {
    var items;
    
    beforeEach(function() {
      items = [
        {level: 0},
          {level: 1},
            {level: 2},
            {level: 2},
          {level: 1},
            {level: 2},
            {level: 2},
              {level: 3},
          {level: 1},
          {level: 1},
            {level: 2},
            {level: 2},
        {level: 0},
        {level: 0},
        {level: 0}
      ];
    });
    
    it('should deal with a lone item', inject(function($syntaxUtils) {
      expect($syntaxUtils.getIndexOfLastChild(items[8], items)).toBe(8);
    }));
    
    it('should deal with an item with children', inject(function($syntaxUtils) {
      expect($syntaxUtils.getIndexOfLastChild(items[9], items)).toBe(11);
    }));
    
    it('should deal with the first item - even if it has no sense', inject(function($syntaxUtils) {
      expect($syntaxUtils.getIndexOfLastChild(items[0], items)).toBe(11);
    }));
    
    it('should deal with the last item', inject(function($syntaxUtils) {
      expect($syntaxUtils.getIndexOfLastChild(items[11], items)).toBe(11);
    }));
  });

  describe('getChildrenCount function', function() {
    var items;
    
    beforeEach(function() {
      items = [
        {level: 0}, // #0
          {level: 1}, // #1
            {level: 2}, // #2
            {level: 2}, // #3
          {level: 1}, // #4
            {level: 2}, // #5
            {level: 2}, // #6
              {level: 3}, // #7
          {level: 1}, // #8
          {level: 1}, // #9
            {level: 2}, // #10
            {level: 2}, // #11
        {level: 0}, // #12
        {level: 0}, // #13
        {level: 0} // #14
      ];
    });
    
    it('should deal with a lone item', inject(function($syntaxUtils) {
      expect($syntaxUtils.getChildrenCount(items[8], items)).toBe(0);
    }));
    
    it('should deal with an item with children', inject(function($syntaxUtils) {
      expect($syntaxUtils.getChildrenCount(items[9], items)).toBe(2);
    }));
    
    it('should deal with the first item', inject(function($syntaxUtils) {
      expect($syntaxUtils.getChildrenCount(items[0], items)).toBe(11);
    }));
    
    it('should deal with the last item', inject(function($syntaxUtils) {
      expect($syntaxUtils.getChildrenCount(items[11], items)).toBe(0);
    }));
  });
  
  describe('parseSyntaxTree', function() {
    it('should parse back and forth a simple syntax tree', inject(function($syntaxUtils) {
      var types = [
        {label: "Baz", field: "baz_field", realtype: "int"}
      ];
        
      var syntaxTree = {
        and: [{
          field: "baz_field",
          op: {text: "!=", id: "ne"},
          rhs: {realtype: "int", value: "42"}
        }]
      };
      
      var formItems = [
        {groupType: 'and', isGroup: true, level: 0 },
        {
          type: {label: 'Baz', field: 'baz_field', realtype: 'int'},
          operators: [{label: '==', value: 'eq'}, {label: '!=', value: 'ne'}],
          operator: {label: '!=', value: 'ne'},
          value: '42',
          level:1
        }
      ];
      
      expect($syntaxUtils.parseSyntaxTree(syntaxTree, types)).toEqual(formItems);
      expect($syntaxUtils.computeSyntaxTree(formItems)).toEqual(syntaxTree);
    }));
    
    it('should parse back and forth two groups in a syntax tree', inject(function($syntaxUtils) {
      var syntaxTree = {
        and: [{
          or: []
        }]
      };
      
      var formItems = [
        {groupType: 'and', isGroup: true, level: 0},
        {groupType: 'or', isGroup: true, level: 1}
      ];
      
      expect($syntaxUtils.parseSyntaxTree(syntaxTree, [])).toEqual(formItems);
      expect($syntaxUtils.computeSyntaxTree(formItems)).toEqual(syntaxTree);
    }));
    
    it('should parse back and forth a less simple syntax tree', inject(function($syntaxUtils) {
      var types = [
        {label: "Bar", field: "bar", realtype: "string"},
        {label: "Foo", field: "foo", realtype: "int"}
      ];
      
      var syntaxTree = {
        and: [
          {
            or: [
              {
                rhs: {value: "5784654564", realtype: "string"},
                op: {text: "is", id: "eq"},
                field: "bar"
              },
              {
                rhs: {value: "5446456", realtype: "int"},
                op: {text: "!=", id: "ne"},
                field: "foo"
              },
              {
                and: [
                  {
                    rhs: {value: "5646549645", realtype: "string"},
                    op: {text: "is not", id: "neq"},
                    field: "bar"
                  }
                ]
              }
            ]
          },
          {
            rhs: {value: "1340373286331", realtype: "int"},
            op: {text: "!=", id: "ne"},
            field: "foo"
          }
        ]
      };
      
      var formItems = [
        {groupType: 'and', isGroup: true, level: 0},
        {groupType: 'or', isGroup: true, level: 1},
          {
            type: {label: 'Bar', field: 'bar', realtype: 'string'},
            operators: [{label: 'is', value: 'eq'}, {label: 'is not', value: 'neq'}],
            operator: {label: 'is', value: 'eq'},
            value: '5784654564',
            level: 2
          },
          {
            type: {label: 'Foo', field: 'foo', realtype: 'int'},
            operators: [{label: '==', value: 'eq'}, {label: '!=', value: 'ne'}],
            operator: {label: '!=', value: 'ne'},
            value: '5446456',
            level: 2
          },
          {groupType: 'and', isGroup: true, level: 2},
            {
              type: {label: 'Bar', field: 'bar', realtype: 'string'},
              operators: [{label: 'is', value: 'eq'}, {label: 'is not', value: 'neq'}],
              operator: {label: 'is not', value: 'neq'},
              value: '5646549645',
              level: 3
            },
        {
          type: {label: 'Foo', field: 'foo', realtype: 'int'},
          operators: [{label: '==', value: 'eq'}, {label: '!=', value: 'ne'}],
          operator: {label: '!=', value: 'ne'},
          value: '1340373286331',
          level: 1
        }
      ];
      
      expect($syntaxUtils.parseSyntaxTree(syntaxTree, types)).toEqual(formItems);
      expect($syntaxUtils.computeSyntaxTree(formItems)).toEqual(syntaxTree);
    }));
  });
});