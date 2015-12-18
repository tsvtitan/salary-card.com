
app.factory('Frame',['$http','$controller','$rootScope',
                     'Utils','Dictionary','Urls','Payload','Event',
                     'Table','Chart','Form',
                     function($http,$controller,$rootScope,
                              Utils,Dictionary,Urls,Payload,Event,
                              Table,Chart,Form) {
  
  function prepareFrame(frame) {

    if (Utils.isObject(frame)) {

      frame.titleVisible = Utils.isDefined(frame.titleVisible)?frame.titleVisible:true;
      frame.collapsed = Utils.isDefined(frame.collapsed)?frame.collapsed:false;
      frame.canCollapse = Utils.isDefined(frame.canCollapse)?frame.canCollapse:true;
      frame.canClose = Utils.isDefined(frame.canClose)?frame.canClose:true;
      frame.canLoad = Utils.isDefined(frame.canLoad)?frame.canLoad:true;
      
      if (!Utils.isFunction(frame.controller)) {
        var defController = 'frame'+frame.type.charAt(0).toUpperCase()+frame.type.slice(1);
        frame.controllerName = (frame.controller)?frame.controller:defController;
      }

      switch (frame.type) {
        case 'table': Table.prepare(frame); break;
        case 'chart': Chart.prepare(frame); break;
        case 'form': Form.prepare(frame); break;
      }

      if (!Utils.isFunction(frame.isTable)) {
        frame.isTable = function() {
          return frame.type==='table';
        }
      }

      if (!Utils.isFunction(frame.isChart)) {
        frame.isChart = function() {
          return frame.type==='chart';
        }
      }

      if (!Utils.isFunction(frame.isForm)) {
        frame.isForm = function() {
          return frame.type==='form';
        }
      }
      
      if (Utils.isObject(frame.events)) {
      
        for (var event in frame.events) {

          var obj = frame.events[event];
          if (Utils.isArray(obj)) {

            if (Utils.isFunction(frame[event])) {

              Utils.forEach(obj,function(name){

                $rootScope.$on(name,function(e,n){
                  frame[event](n);
                });
              });
            }
          } else if (Utils.isString(obj)) {
            
            if (Utils.isFunction(frame[event])) 
              $rootScope.$on(obj,function(e,n){
                frame[event](n);
              });
          }
        }
      }

      if (!Utils.isFunction(frame.controller)) {

        frame.controller = function($scope,$element){

          if (frame.isTable) $scope.table = frame;
          if (frame.isChart) $scope.chart = frame;
          if (frame.isForm) $scope.form = frame;

          $scope.dic = Dictionary.dic($element,frame.controllerName);
          
          var inject = {
            '$scope':$scope,
            '$element':$element
          };
          
          return $controller(frame.controllerName,inject);
        }
      }
      
    }
  }

  var factory = {
    
     get: function(frame,result) {
      
      $http.post(Urls.frameGet,Payload.get({frame:frame}))
           .success(function(d){
             result(Utils.extend(d,prepareFrame(d.frame)));
           })
           .error(function(d){ result({error:Dictionary.connectionFailed(d)}); });  
    },
    
    prepare: function(frame) {
      prepareFrame(frame);
    }
  }
  
  return factory;
  
}]);