
app.directive('checkField',function() {
  
  return {
    restrict: 'A',
    require:  '^form',
    link: function (scope, el, attrs, formCtrl) {
      
      var element = angular.element(el[0].querySelector("[name]"));
      
      var model = element.attr('data-ng-model');
      
      if (model) {
        var fmEl = formCtrl[element.attr('name')];
        
        scope.$watch(model,function() {
          el.toggleClass('has-error',(fmEl.$invalid && fmEl.$dirty));
        });
        
        scope.$on('show-errors',function(event,flag) {
          el.toggleClass('has-error',(flag && fmEl.$invalid));
        });
        
        if (fmEl.setRequired===undefined) {
          fmEl.setRequired = function(required) {
            fmEl.$setValidity(fmEl.$name,!required);
          }
        }
        
        if (formCtrl.checkFields===undefined) {

          formCtrl.checkFields = function() {
            if (this.$invalid) {
              scope.$broadcast('show-errors',true);
            }
            return !this.$invalid;
          }
        }

        if (formCtrl.hideErrors===undefined) {

          formCtrl.hideErrors = function() {
            scope.$broadcast('show-errors',false);
          }
        }
        
      }
    }
  }
});