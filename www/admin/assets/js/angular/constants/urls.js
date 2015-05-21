var root = '/admin';
var images = root.concat('/images');
var userImages = images.concat('/users/{id}');

app.constant('Urls',{
  
  root: root,
  init: root.concat('/api/init'),
  
  authLogin: root.concat('/api/login'),
  authLogout: root.concat('/api/logout'),
  
  captchaLogin: root.concat('/captcha/login'),
  
  userProfileSmallImage: userImages.concat('/profile_small.jpg')
  
});


