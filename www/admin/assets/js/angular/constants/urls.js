var root = '/admin';

var api = root.concat('/api');
var apiPage = api.concat('/page');
var apiTables = api.concat('/tables');
var apiCharts = api.concat('/charts');
var apiForms = api.concat('/forms');

var images = root.concat('/images');
var userImages = images.concat('/users/{id}');

app.constant('Urls',{
  
  whiteList: [
    'self'/*,
    'https://salary-card.com/**'*/
  ],
  
  root: root,
  init: api.concat('/init'),
  
  authLogin: api.concat('/login'),
  authLogout: api.concat('/logout'),
  pageFrames: apiPage.concat('/frames'),
  
  tablesGet: apiTables.concat('/get'),
  tablesAction: apiTables.concat('/action'),
  
  chartsGet: apiCharts.concat('/get'),
  chartsAction: apiCharts.concat('/action'),
  
  formsGet: apiForms.concat('/get'),
  
  captchaLogin: root.concat('/captcha/login'),
  
  userProfileSmallImage: userImages.concat('/profile_small.jpg')
  
  
  
});


