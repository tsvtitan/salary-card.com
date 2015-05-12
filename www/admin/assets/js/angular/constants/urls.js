var adminHome = '/admin';

app.constant('Urls',{
  
  init: adminHome.concat('/api/init'),
  
  authLogin: adminHome.concat('/api/login'),
  authLogout: adminHome.concat('/api/logout'),
  
  captchaLoginUrl: adminHome.concat('/captcha/login')
  
});


