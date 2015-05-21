
app.controller('login',['$rootScope','$scope','$state','$element','$timeout',
                        'Auth','Dictionary','Const','Regexp','Urls','Utils','Alert',
                        function($rootScope,$scope,$state,$element,$timeout,Auth,
                                 Dictionary,Const,Regexp,Urls,Utils,Alert) {
  
  $scope.tryAuth();
  $scope.dic = Dictionary.dic($element);
  
  $scope.captchaUrl = '';
  $scope.captchaPattern = Regexp.captcha;
  
  $scope.data = {
    login: '',
    pass: '',
    captcha: ''
  };
  
  $scope.state = {login:false,hide:false,spinner:false};

  $scope.captchaRefresh = function() {
    
    if (Auth.captcha) { 
      $scope.state.spinner = true;
      $scope.captchaUrl = Utils.format('%s?%d',[Urls.captchaLogin,new Date().getTime()]);
    }
  }
  
  function init() {
    $scope.captchaRefresh();
    $scope.hideSpinner();    
  }
  
  $scope.onReady(function(){
    init();
  });
  
  $scope.captchaAfterLoad = function() {
    
    $scope.data.captcha = '';
    $scope.state.spinner = false;
  }
  
  $scope.captchaChange = function() {
    this.form.captcha.setRequired(Auth.captcha && !Regexp.captcha.test($scope.data.captcha));
  }
  
  $scope.submit = function() {
    
    var self = this;
    
    self.form.captcha.setRequired(Auth.captcha && !Regexp.captcha.test($scope.data.captcha));
    
    if (self.form.checkFields()) {
      
      $scope.state.login = true;
      
      Auth.login(self.data,function(d) {
        
        if (d.error) {
          $scope.captchaRefresh();
          $scope.state.login = false;
          Alert.error(d.error);
        }
        if (d.user) {
          
          $scope.state.hide = true;
          $scope.showSpinner();
          
          Auth.ready = true;
          $rootScope.$broadcast(Const.eventLogin);
          
          $timeout(function(){
            $scope.state.login = false;
            $scope.reload(d.user.state);
          },Const.timeoutHide);
        }
      });
      
    } else Alert.error(Const.checkFields,null,{
      onHidden: function() {
        self.form.hideErrors();
      }
    });
  }
  
  init();
  
}]);