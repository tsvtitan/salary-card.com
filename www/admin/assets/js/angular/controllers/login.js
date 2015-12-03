
app.controller('pageLogin',['$scope','$element','$timeout',
                            'Auth','Dictionary','Const','Regexp','Urls','Utils',
                            function($scope,$element,$timeout,
                                     Auth,Dictionary,Const,Regexp,Urls,Utils) {
  $scope.dic = Dictionary.dic($element);

  $scope.captchaUrl = '';
  $scope.captchaPattern = Regexp.captcha;
  $scope.captchaRequired = false;

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
  
  $scope.captchaAfterLoad = function() {
    
    $scope.data.captcha = '';
    $scope.state.spinner = false;
  }
  
  $scope.captchaChange = function() {
    var flag = (Auth.captcha && !Regexp.captcha.test($scope.data.captcha))
    this.form.captcha.setRequired(flag);
  }
  
  $scope.submit = function() {
    
    var self = this;
    var form = self.form;
    
    $scope.captchaRequired = Auth.captcha && !Regexp.captcha.test($scope.data.captcha);
    form.captcha.setRequired($scope.captchaRequired);
    
    if (form.valid()) {
      
      $scope.state.login = true;
      
      Auth.login(self.data,function(d) {
        
        if (d.error) {
          $scope.captchaRefresh();
          $scope.state.login = false;
          form.error(d.error);
        }
        if (d.user) {
          
          $scope.state.hide = true;
          $scope.showSpinner();
          
          Auth.ready = true;
          Auth.emitLogin();
          
          $timeout(function(){
            $scope.state.login = false;
            $scope.reload(d.user.page);
          },Const.timeoutHide);
        }
      });
      
    } else form.error(Const.checkFields);
  }

  function init() {
    $scope.captchaRefresh();
    $scope.ready(); 
  }
                          
  init();
  
}]);