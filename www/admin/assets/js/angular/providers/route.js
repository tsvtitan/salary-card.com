
app.provider('Route',['$stateProvider','$urlRouterProvider',
                      function($stateProvider,$urlRouterProvider) {
  
  var lastState = false;
  
  this.$get = function () {
    return {
      defaultUrl: function(url) {
        return $urlRouterProvider.otherwise(url);
      },
      state: function(name,definition) {
        return $stateProvider.state(name,definition);
      },
      clear: function() {
        $urlRouterProvider.clear();
        return $stateProvider.clear();
      },
      setLastState: function(state) {
        lastState = state;
      }
    }
  }
}]);

