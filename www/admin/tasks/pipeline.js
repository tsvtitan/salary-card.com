/**
 * grunt/pipeline.js
 *
 * The order in which your css, javascript, and template files should be
 * compiled and linked from your views and static HTML files.
 *
 * (Note that you can take advantage of Grunt-style wildcard/glob/splat expressions
 * for matching multiple files.)
 */


// CSS files to inject in order
//
// (if you're using LESS with the built-in default config, you'll want
//  to change `assets/styles/importer.less` instead.)
var cssFilesToInject = [
  'styles/animate.css',
  'styles/bootstrap.css',
  'styles/font-awesome.min.css',
  'styles/ladda-themeless.min.css',
  'styles/ag-grid.css',
  'styles/nv.d3.css',
  'styles/theme-fresh.css',
  'styles/toastr.css',
  'styles/inspinia.css',
  'styles/**/*.css'
];


// Client-side javascript files to inject in order
// (uses Grunt-style wildcard/glob/splat expressions)
var jsFilesToInject = [

  'js/dependencies/underscore.js',
  'js/dependencies/_.escape.js',
  'js/dependencies/sprintf.js',
  
  // Load sails.io before everything else
  'js/dependencies/sails.io.js',

  'js/dependencies/jquery.js',
  'js/dependencies/jquery.metisMenu.js',
  'js/dependencies/jquery.slimscroll.js',
  
  'js/dependencies/moment.js',
  'js/dependencies/moment-duration-format.js',
  
  'js/dependencies/angular.js',
  
  'js/dependencies/bootstrap.js',
  
  'js/dependencies/d3.js',
  'js/dependencies/nv.d3.js',
  
  'js/dependencies/spin.min.js',
  'js/dependencies/ladda.min.js',
  'js/dependencies/inspinia.js',
  
  'js/angular/modules/ui-bootstrap-tpls.js',
  'js/angular/modules/*.js',
  'js/angular/app.js',
  'js/angular/providers/*.js',
  'js/angular/constants/*.js',
  'js/angular/configs/*.js',
  'js/angular/services/*.js',
  'js/angular/factories/*.js',
  'js/angular/directives/*.js',
  'js/angular/controllers/**/*.js',
  'js/angular/ready.js',
  
  // All of the rest of your client-side js files
  // will be injected here in no particular order.
  'js/**/*.js'
];


// Client-side HTML templates are injected using the sources below
// The ordering of these templates shouldn't matter.
// (uses Grunt-style wildcard/glob/splat expressions)
//
// By default, Sails uses JST templates and precompiles them into
// functions for you.  If you want to use jade, handlebars, dust, etc.,
// with the linker, no problem-- you'll just want to make sure the precompiled
// templates get spit out to the same file.  Be sure and check out `tasks/README.md`
// for information on customizing and installing new tasks.
var templateFilesToInject = [
  'templates/**/*.html'
];


// Prefix relative paths to source files so they point to the proper locations
// (i.e. where the other Grunt tasks spit them out, or in some cases, where
// they reside in the first place)
module.exports.cssFilesToInject = cssFilesToInject.map(function(path) {
  return '.tmp/public/admin/' + path;
});
module.exports.jsFilesToInject = jsFilesToInject.map(function(path) {
  return '.tmp/public/admin/' + path;
});
module.exports.templateFilesToInject = templateFilesToInject.map(function(path) {
  return 'assets/' + path;
});
