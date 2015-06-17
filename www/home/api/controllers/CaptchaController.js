// CaptchaController

var captcha = require('canvas-captcha');

module.exports = {

  login: function(req,res) {
    
    var chars = 'abcdefghijklmnopqrstuvwxyz';
    var nums = '1234567890';
    
    var options = {
      
      charPool: (chars + chars.toUpperCase() + nums).split(''),
      size: {
        width: 146,
        height: 30
      },
      textPos: {
        left: 30,
        top: 26
      },
      rotate: 0.0,
      charLength: 6,
      font: '22px Arial',
      strokeStyle: '#bbb',
      bgColor: '#fff',
      confusion: true,
      cFont: '24px Arial',
      cStrokeStyle: '#ddd',
      cRotate: 0.0
    }
    
    captcha(options,function(err,data){
      
      if(err) res.serverError(err);
      else {
        
        setTimeout(function(){
          req.session.loginCaptcha = data.captchaStr;
          res.end(data.captchaImg);
        },500);
      }
      
    });
    
  }
}