describe('$editorUtils', function() {
  
  beforeEach(module("percival-utils"));
  
  var items, types;
  
  beforeEach(function() {
    items = [{groupType: 'and', isGroup: true, level: 0}];
    types = [
      {realtype: 'int', field: 'teh_field'},
      {realtype: 'string', field: 'teh_other_field'}
    ];
  });
  
  describe('$editorUtils', function() {
    describe('newItem function', function() {
      it('should create a filled item', inject(function($editorUtils, $syntaxUtils) {
        var parent = {isGroup: true, level: 0};
        
        expect($editorUtils.newItem(parent, types)).toEqual({
          level: 1,
          type: types[0],
          operators: $syntaxUtils.getOperators()['int'],
          operator: $syntaxUtils.getOperators()['int'][0]
        });
      }));
    });
  
    describe('getBlankAst function', function() {
      it('should return an empty Ast', inject(function($editorUtils) {
        expect($editorUtils.getBlankAst()).toEqual(
          [{groupType: 'and', isGroup: true, level: 0}]
        );
      }));
    });
  
    describe('addAfter function', function() {
      it('should create a new item and insert it properly', inject(function($editorUtils) {
        $editorUtils.addAfter(items[0], items, types);
        
        expect(items.length).toBe(2);
        expect(items[1]).toEqual($editorUtils.newItem(items[0], types));
      }));
    });
    
    describe('addGroupAfter function', function() {
      it('should increment an items level if created after a group', inject(function($editorUtils) {
        $editorUtils.addGroupAfter(items[0], items);
        
        expect(items).toEqual([
          {groupType: 'and', isGroup: true, level: 0},
          {groupType: 'and', isGroup: true, level: 1}
        ]);
      }));
      
      it("should have the parent's level if created after an item", inject(function($editorUtils) {
        items = [
          {groupType: 'and', isGroup: true, level: 0},
            {type: 'bar_value', operator: 'eq', value: 'alt', level: 1}
        ];
              
        $editorUtils.addGroupAfter(items[1], items);
        
        expect(items).toEqual([
          {groupType: 'and', isGroup: true, level: 0},
            {type: 'bar_value', operator: 'eq', value: 'alt', level: 1},
            {groupType: 'and', isGroup: true, level: 1}
        ]);
      }));
    });
  
    describe('remove function', function() {
      it('should prevent from removing the root group', inject(function($editorUtils) {
        $editorUtils.removeItem(items[0], items);
        expect(items).toEqual([{groupType: 'and', isGroup: true, level: 0}]);
      }));
      
      it('should prevent from removing an unknown item', inject(function($editorUtils) {
        items = [
          {groupType: 'and', isGroup: true, level: 0},
          {type: 'foo_value', operator: 'eq', value: '', level: 1}
        ];
        
        $editorUtils.removeItem({}, items);
        
        expect(items).toEqual([
          {groupType: 'and', isGroup: true, level: 0},
          {type: 'foo_value', operator: 'eq', value: '', level: 1}
        ]);
        
      }));
      
      it('should remove an item', inject(function($editorUtils) {
        $editorUtils.addAfter(items[0], items, types);
        
        expect(items.length).toEqual(2);
        
        $editorUtils.removeItem(items[1], items);
        expect(items).toEqual([{groupType: 'and', isGroup: true, level: 0}]);
      }));
      
      it('should remove a group and its children', inject(function($editorUtils) {
        items = [
          {groupType: 'and', isGroup: true, level: 0},
            {groupType: 'or', isGroup: true, level: 1},
              {type: 'bar_value', operator: 'eq', value: 'alt', level: 2},
              {type: 'bar_value', operator: 'eq', value: 'tab', level: 2},
            {groupType: 'and', isGroup: true, level: 1},
              {type: 'foo_value', operator: 'eq', value: 'gnogno', level: 2}
        ];
        
        $editorUtils.removeItem(items[1], items);
        
        expect(items).toEqual([
          {groupType: 'and', isGroup: true, level: 0},
            {groupType: 'and', isGroup: true, level: 1},
              {type: 'foo_value', operator: 'eq', value: 'gnogno', level: 2}
        ]);
      }));
      
      it('should remove the proper item', inject(function($editorUtils) {
        items = [
          {groupType: 'and', isGroup: true, level: 0},
            {groupType: 'or', isGroup: true, level: 1},
              {type: 'bar_value', operator: 'eq', value: 'alt', level: 2},
              {type: 'bar_value', operator: 'eq', value: 'tab', level: 2},
            {groupType: 'and', isGroup: true, level: 1},
              {type: 'foo_value', operator: 'eq', value: 'gnogno', level: 2}
        ];
        
        $editorUtils.removeItem(items[2], items);
        
        expect(items).toEqual([
          {groupType: 'and', isGroup: true, level: 0},
            {groupType: 'or', isGroup: true, level: 1},
              {type: 'bar_value', operator: 'eq', value: 'tab', level: 2},
            {groupType: 'and', isGroup: true, level: 1},
              {type: 'foo_value', operator: 'eq', value: 'gnogno', level: 2}
        ]);
      }));
    });
  });
});