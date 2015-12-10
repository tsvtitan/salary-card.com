var root = '/admin';

var api = root.concat('/api');
var apiPage = api.concat('/page');
var apiTable = api.concat('/table');
var apiChart = api.concat('/chart');
var apiForm = api.concat('/form');
var apiFrame = api.concat('/frame');

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
  pageFrame: apiPage.concat('/frame'),
  
  tableGet: apiTable.concat('/get'),
  tableAction: apiTable.concat('/action'),
  
  chartGet: apiChart.concat('/get'),
  chartAction: apiChart.concat('/action'),
  
  formGet: apiForm.concat('/get'),
  
  frameGet: apiFrame.concat('/frame'),
  
  captchaLogin: root.concat('/captcha/login'),
  
  userProfileSmallImage: userImages.concat('/profile_small.jpg')
  
  
  
});


