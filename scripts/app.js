angular.module('npp', ['ng-boolean-editor', 'apojop'])

.config(function config($routeProvider) {
  $routeProvider
    .when('/', {controller: 'DemoCtrl', templateUrl: 'views/main.html'})
    .otherwise({redirectTo: '/'});
})

.controller('DemoCtrl', function($scope) {
  $scope.conditions = {
    and: [
      {field: "an_int_field", op: {id: "eq", text: "=="}, rhs: {realtype: "int", value: "qsd"}},
      {
        and: [
          {
            field: "an_int_field",
            op: {id: "eq", text: "=="},
            rhs: {realtype: "int", value: "pouet"}
          }
        ]
      },
      {
        field: "an_int_field",
        op: {id: "eq", text: "=="},
        rhs: {realtype: "int", value: "tutu"}
      }
    ]
  };
  
  $scope.types = [
    {realtype: 'int', field: 'an_int_field', label: 'Integer', shown: true},
    {realtype: 'string', field: 'a_string_field', label: 'String', shown: true},
    {realtype: 'datems', field: 'a_date_field', label: 'Date', shown: true}
  ];
});