angular.module('npp', ['ng-boolean-editor', 'apojop'])

.config(function config($routeProvider) {
  $routeProvider
    .when('/', {controller: 'DemoCtrl', templateUrl: 'views/main.html'})
    .otherwise({redirectTo: '/'});
})

.controller('DemoCtrl', function($scope) {
  $scope.ok = function(c) {
    $scope.conditions = c;
  };
  
  $scope.conditions = {
        and: []
      };
  
  $scope.types = [
    {realtype: 'int', field: 'an_int_field'},
    {realtype: 'string', field: 'a_string_field'},
    {realtype: 'datems', field: 'a_date_field'}
  ];
});