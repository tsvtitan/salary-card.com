
var html = document.getElementsByTagName('html')[0];
var title = document.getElementsByTagName('title')[0];
if (html && title) {
  
  angular.element(html).ready(function() {
    html.setAttribute('data-ng-app',app.name);
    title.setAttribute('data-ng-bind','title');
    angular.bootstrap(html,[app.name]);
  });
}



