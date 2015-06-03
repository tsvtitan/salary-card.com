var root = '/admin';
var api = root.concat('/api');
var images = root.concat('/images');
var apiPage = api.concat('/page');
var userImages = images.concat('/users/{id}');

app.constant('Urls',{
  
  root: root,
  init: api.concat('/init'),
  
  authLogin: api.concat('/login'),
  authLogout: api.concat('/logout'),
  
  captchaLogin: root.concat('/captcha/login'),
  
  userProfileSmallImage: userImages.concat('/profile_small.jpg'),
  
  pageFrames: apiPage.concat('/frames')
  
});


