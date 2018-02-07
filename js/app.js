var app = angular.module('expensesApp', ['ngRoute'])

//helper
var myHelpers = {
  //from http://stackoverflow.com/questions/2280104/convert-javascript-to-date-object-to-mysql-date-format-yyyy-mm-dd
  dateObjToString: function(dateObj) {
    var year, month, day;
    year = String(dateObj.getFullYear());
    month = String(dateObj.getMonth() + 1);
    if (month.length == 1) {
        month = "0" + month;
    }
    day = String(dateObj.getDate());
    if (day.length == 1) {
        day = "0" + day;
    }
    return year + "-" + month + "-" + day;
  },
  stringToDateObj: function(string) {
    return new Date(string.substring(0,4), string.substring(5,7) - 1, string.substring(8,10));
  }
};

//define routes for the app, each route defines a template and a controller
app.config(['$routeProvider', function($routeProvider){
  $routeProvider
    .when('/', {
      templateUrl : 'views/expenses.html',
      controller  : 'ExpensesViewController'
    })
    .when('/expenses', {
      templateUrl : 'views/expenses.html',
      controller  : 'ExpensesViewController'
    })
    .when('/expenses/new', {
      templateUrl : 'views/expenseForm.html',
      controller  : 'ExpenseViewController'
    })
    .when('/expenses/edit/:id', {
      templateUrl : 'views/expenseForm.html',
      controller  : 'ExpenseViewController'
    })
    .otherwise({
      redirectTo: '/'
    });
}]);

//this service will take care of keeping track of the expenses and other operations
//for more on services see the documentation: https://docs.angularjs.org/guide/providers
//you can access a factory from the console by doing: angular.element(document.body).injector().get('Expenses')
app.factory('Expenses', function() {
  var service = {};

  //the id will be a unique identifier, it could come from a server
  service.entries = [
    {id: 1, description: 'Adobe Creative Suite 6 Master Collection', amount: 3199.99, date: '2014-10-01'},
    {id: 2, description: 'Apple iMac Pro Retina 5K 27"', amount: 4999.99, date: '2014-10-02'},
    {id: 3, description: '2011 Lotus Elise', amount: 38999, date: '2014-10-03'}
  ];

  //convert strings to date objects
  service.entries.forEach(function(element){
    element.date = myHelpers.stringToDateObj(element.date);
  });

  //get the next id. we only need this because we are not connecting to a server
  //if you were, normally the backend should return the id of the new element you are creating
  //to test use this in the console: angular.element(document.body).injector().get('Expenses').getNewId()
  service.getNewId = function() {

    //if we already have one, increase by 1
    if(service.newId) {
      service.newId++;
      return service.newId;
    }
    else {
      //find the largest id value using underscore.js
      //documentation for _.max: http://underscorejs.org/#max
      var entryMaxId = _.max(service.entries, function(entry){return entry.id});
      service.newId = entryMaxId.id + 1;
      return service.newId;
    }
  }

  //get an entry by id, using underscore.js
  service.getById = function(id) {

    //find retrieves the first entry that passes the condition.
    //documentation for _.find() http://underscorejs.org/#find
    return _.find(service.entries, function(entry){return entry.id == id});
  }

  //update an entry
  service.save = function(entry) {
     //find element we want to update
    var toUpdate = service.getById(entry.id);

    //if exists we update
    if(toUpdate) {
      //we'll copy all the properties from "entry" to the object we want to update
      //documentation for _.extend: http://underscorejs.org/#extend
      _.extend(toUpdate, entry);
    }
    //otherwise we create it
    else {
      entry.id = service.getNewId();
      service.entries.push(entry);
    }    
  }

  service.remove = function(entry) {
    service.entries = _.reject(service.entries, function(element){
      return element.id == entry.id;
    });
  };

  return service;
});

//listing of all expenses
app.controller('ExpensesViewController', ['$scope', 'Expenses', function($scope, Expenses) {
  $scope.expenses = Expenses.entries;

  $scope.remove = function(expense) {
    Expenses.remove(expense);
  };

  $scope.$watch(function(){
    return Expenses.entries
  },
  function(entries){
    $scope.expenses = entries;
  });
}]);

//create or edit an expense
app.controller('ExpenseViewController', ['$scope', '$routeParams', '$location', 'Expenses', function($scope, $routeParams, $location, Expenses) {

  //the expense will either be a new one or existing one if we are editing
  if(!$routeParams.id) {
    $scope.expense = {date: new Date()}
  }
  else {
    //clone makes a copy of an object, so we don't modify the real object before clicking Save
    $scope.expense = _.clone(Expenses.getById($routeParams.id));
  }

  //push the expense to the array of expenses. Duplicate entries will thow error unless adding  "track by $index" to the ng-repeat directive
  $scope.save = function() {
    Expenses.save($scope.expense); 
    $location.path('/');
  };
}]);

app.directive('zvaExpense', function(){
  return {
    restrict: 'E', 
    templateUrl: 'views/other_expenses.html'
  }
});




