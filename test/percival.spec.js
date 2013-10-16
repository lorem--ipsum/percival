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
    $compile(elm)(scope);
    scope.$digest();
  }));

  it('should create a div', function() {
    
  });
});