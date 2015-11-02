var root = '/admin';

var api = root.concat('/api');
var apiPage = api.concat('/page');
var apiTables = api.concat('/tables');
var apiGraphs = api.concat('/graphs');

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
  
  graphsGet: apiGraphs.concat('/get'),
  graphsAction: apiGraphs.concat('/action'),
  
  captchaLogin: root.concat('/captcha/login'),
  
  userProfileSmallImage: userImages.concat('/profile_small.jpg')
  
  
  
});


