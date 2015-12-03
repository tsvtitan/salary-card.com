
app.controller('partialMenu',['$scope','$element','$timeout',
                              'Auth','Dictionary','Const','Alert','Init','Utils',
                              function($scope,$element,$timeout,
                                       Auth,Dictionary,Const,Alert,Init,Utils){
  
  $scope.dic = Dictionary.dic($element);
  $scope.name = '';
  $scope.email = '';
  $scope.imageProfileUrl = '';
  
  $scope.logout = function() {
    
    Auth.logout(function(d) {

      if (d.error) {
        Alert.error(d.error);
      } else {
        
        Auth.logouting = true;
        Auth.user = false;
        Auth.emitLogout();

        $timeout(function(){

          Auth.ready = false;
          $scope.reload('login');
          Auth.logouting = false;
          
        },Const.timeoutHide);
      }
    });
  }
  
  $scope.menuClick = function(m,child) {
    
    if (!Utils.isEmpty(m.page)) {
      
      $scope.reload(m.page);
      
    } else Auth.setActiveMenu(m,true);
  }
  
  $scope.isMenuActive = function(m) {
    
    return Utils.isArray(Auth.activeMenu) && Auth.activeMenu.indexOf(m)>=0;
  }
  
  function init() {
    
    if (Auth.user) {
      
      var s = Auth.user.name+' '+((Auth.user.firstName)?Auth.user.firstName:'');
      $scope.name = (Auth.user.name)?s.trim():Auth.user.login;
      $scope.email = (Auth.user.email)?Auth.user.email:Dictionary.get(Const.emailNotDefined);
      $scope.imageProfileUrl = Auth.getUserImageProfileSmallUrl();
      
    }
    
  }
  
  Init.once('menu',function(){
    
    Auth.onLogin(function(){
      init();
    });
  });
  
  init();
  
}]);