
app.directive('layerslider',['$rootScope',function ($rootScope) {
  
  return {
    restrict: 'A',
    link: function (scope, element) {
      
      element.layerSlider({
        skin: 'fullwidth',
        responsive : true,
        responsiveUnder : 960,
        layersContainer : 960,
        skinsPath: '/plugins/layerslider/skins/'
      });
    }
  };
}]);