
var html = document.getElementsByTagName('html')[0];
var title = document.getElementsByTagName('title')[0];

if (html && title && app) {
  
  angular.element(html).ready(function() {
    
    var name = app.name;
    
    html.setAttribute('data-ng-app',name);
    title.setAttribute('data-ng-bind','title');
    
    App.init();
    
    //OwlCarousel.initOwlCarousel();    
    //OwlRecentWorks.initOwlRecentWorksV2();

    angular.bootstrap(html,[name]);
  });
}