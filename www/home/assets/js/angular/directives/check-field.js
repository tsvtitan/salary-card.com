
app.directive('checkField',['Utils','Alert','Const','Dictionary',
                            function(Utils,Alert,Const,Dictionary) {
  
  return {
    restrict: 'A',
    require:  '^form',
    link: function (scope, el, attrs, formCtrl) {
      
      var element = angular.element(el[0].querySelector("[name]"));
      
      var model = element.attr('data-ng-model');
      
      if (model) {
        var fmEl = formCtrl[element.attr('name')];
        
        scope.$on('show-errors',function(event,flag,fields) {
          
          var enabled = flag;
          if (fields && fields.length>0) {
            enabled = enabled && fields.indexOf(fmEl.$name)>=0;
            fmEl.hasError = enabled;
          } else enabled = enabled && fmEl.$invalid;
          
          el.toggleClass('has-error',enabled);
        });
        
        if (fmEl.setRequired===undefined) {
          fmEl.setRequired = function(required) {
            fmEl.$setValidity(fmEl.$name,!required);
          }
        }

        if (formCtrl.error===undefined) {

          formCtrl.error = function(error) {
            
            var message = '';
            var fields = [];
            
            if (Utils.isString(error)) {
              message = error;
            } else if (Utils.isObject(error)) {
              message = (error.message)?error.message:Dictionary.get(Const.messageNotDefined);
              fields = (error.fields)?error.fields:fields;
            }
            
            scope.$broadcast('show-errors',true,fields);
            
            Alert.error(message,null,{
              onHidden: function(){
                scope.$broadcast('show-errors',false);
              }
            });
          }
        }
        
        if (formCtrl.valid===undefined) {
          formCtrl.valid = function() {
            return !this.$invalid;
          }
        }
        
      }
    }
  }
}]);