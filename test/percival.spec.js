describe('directive', function() {
  var elm, scope, isolatedScope;

  beforeEach(module('percival'));

  beforeEach(module('conditions-template.html'));
  beforeEach(module('datetime-template.html'));

  beforeEach(inject(function($rootScope, $compile) {
    elm = angular.element('<div id="toto">' +
      '<editor types="types" conditions="conditions"></editor>' +
      '</div>');

    scope = $rootScope;

    scope.types = [
      {realtype: 'int', field: 'an_int_field', label: 'Integer'},
      {realtype: 'string', field: 'a_string_field', label: 'String'},
      {realtype: 'datems', field: 'a_date_field', label: 'Date'}
    ];
    scope.conditions = {};


    $compile(elm)(scope);
    scope.$digest();
  }));

  it('should create a default AST', inject(function($editorUtils) {
    expect(scope.conditions).toEqual({and:[]});
  }));
});