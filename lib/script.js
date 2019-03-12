
angular.module('plunker', ['dataTableDirective']).controller('MainCtrl', function($scope,$http,$rootScope) {
    $http.get('https://jsonplaceholder.typicode.com/users').then(function mySuccess(response) {
      $scope.items = response.data;
    }, function myError(response) {
      alert(JSON.stringify(response.statusText));
    });


    $scope.sort = function(keyname) {
        $scope.sortKey = keyname; //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
        $rootScope.$broadcast('refreshFixedColumns', {});
    }
});
