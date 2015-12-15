/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  'get /': '/admin',
  
  'get /admin/403': {view:'403',locals:{layout:'layouts/stylesOnly'}},
  'get /admin/404': {view:'404',locals:{layout:'layouts/stylesOnly'}},
  'get /admin/500': {view:'500',locals:{layout:'layouts/stylesOnly'}},
  
  'get /admin':  {view:'index'},

  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  *  If a request to a URL doesn't match any of the custom routes above, it  *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/

  'get /admin/cookie': 'CookieController.get', 
  'get /admin/captcha/login': 'CaptchaController.login',
  
  'post /admin/api/init': 'InitController.get',
 
  'post /admin/api/login': 'AuthController.login',
  'post /admin/api/logout': {controller:'AuthController', action:'logout', policy:'sessionAuth'},
  
  '/admin/api/page': {controller:'PageController', action:'index', policy:'accessGranted'},
  'post /admin/api/page/frames': {controller:'PageController', action:'frames', policy:'accessGranted'},
  'post /admin/api/page/frame': {controller:'PageController', action:'frame', policy:'accessGranted'},
  
  '/admin/api/table': {controller:'TableController', action:'index', policy:'accessGranted'},
  'post /admin/api/table/data': {controller:'TableController', action:'data', policy:'accessGranted'},
  'post /admin/api/table/action': {controller:'TableController', action:'action', policy:'accessGranted'},

  '/admin/api/chart': {controller:'ChartController', action:'index', policy:'accessGranted'},
  'post /admin/api/chart/data': {controller:'ChartController', action:'data', policy:'accessGranted'},
  'post /admin/api/chart/action': {controller:'ChartController', action:'action', policy:'accessGranted'},
  
  '/admin/api/form': {controller:'FormController', action:'index', policy:'accessGranted'},
  'post /admin/api/form/get': {controller:'FormController', action:'get', policy:'accessGranted'},
  'post /admin/api/form/action': {controller:'FormController', action:'action', policy:'accessGranted'},
  
  '/admin/api/frame': {controller:'FrameController', action:'index', policy:'accessGranted'},
  'post /admin/api/frame/get': {controller:'FrameController', action:'get', policy:'accessGranted'},
  
  

  '/admin/api/mailer': {controller:'MailerController', action:'index', policy:'accessGranted'},
  'post /admin/api/mailer/send': {controller:'MailerController', action:'send', policy:'accessGranted'},
 
  '/test': {view:'test',locals:{layout:'layouts/test'}},
  '/test/default': {view:'test',locals:{layout:'layouts/default'}},
  
  '/test/req': {controller:'TestController', action:'req'/*, policy:'accessGranted'*/}
          
};
 
