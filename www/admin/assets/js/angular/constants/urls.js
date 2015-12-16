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
  
  tableData: apiTable.concat('/data'),
  tableAction: apiTable.concat('/action'),
  
  chartData: apiChart.concat('/data'),
  chartAction: apiChart.concat('/action'),
  
  formGet: apiForm.concat('/get'),
  formAction: apiForm.concat('/action'),
  
  frameGet: apiFrame.concat('/get'),
  
  captchaLogin: root.concat('/captcha/login'),
  
  userProfileSmallImage: userImages.concat('/profile_small.jpg')
  
  
  
});


