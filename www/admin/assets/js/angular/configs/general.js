
app.config(['$provide','$sceDelegateProvider','laddaProvider','toastrConfig','Const','Urls',
            function($provide,$sceDelegateProvider,laddaProvider,toastrConfig,Const,Urls) {
    
  $provide.decorator('$controller', ['$delegate','$injector',function ($delegate,$injector) {

    return function(constructor,locals,later,indent) {
      if (typeof constructor == "string") {
        //locals.$scope.controllerName = constructor;
      } 
      return $delegate(constructor,locals,later,indent);
    }
  }]);  

  $provide.decorator('$templateCache',['$delegate',function($delegate) {
    var originalGet = $delegate.get;

    $delegate.get = function(key) {
      var value;
      value = originalGet(key);
      if (!value) {
        if (key in JST) {
          value = JST[key]();
          if (value) {
            $delegate.put(key, value);
          }
        }
      }
      return value;
    };

    return $delegate;
  }]);

  /*$provide.decorator('formDirective', function($delegate) {
    var form = $delegate[0], controller = form.controller;
    form.controller = ['$scope', '$element', '$attrs', '$injector', 
                       function(scope, element, attrs, $injector) {
      var $interpolate = $injector.get('$interpolate');
      attrs.$set('name', $interpolate(attrs.name || attrs.ngForm || '')(scope));
      $injector.invoke(controller, this, {
        '$scope': scope,
        '$element': element,
        '$attrs': attrs
      });
    }];
    return $delegate;
  });*/

  $sceDelegateProvider.resourceUrlWhitelist(Urls.whiteList);

  laddaProvider.setOption({
    style: 'expand-left',
    spinnerColor: '#ccc',
    spinnerSize: '24'
  });
  
  angular.extend(toastrConfig, {
    allowHtml: true,
    autoDismiss: true,
    closeButton: true,
    maxOpened: Const.limitAlerts,    
    newestOnTop: false,
    preventDuplicates: true,
    progressBar: true,
    tapToDismiss: false,
    timeOut: Const.timeoutAlert
  });

  return this;
}]);
