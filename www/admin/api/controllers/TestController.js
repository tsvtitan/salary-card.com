// TestController

var moment = require('moment');

module.exports = {
  
  req: function(req,res) {
    
    console.log('Test/req');
    
    var recipients = [];
    
    var maxCount = 1500;
    
    for (var i=0; i<maxCount; i++) {
      
      recipients.push({
        name: Utils.format('имя #%s',[i+1]),
        contact: 'test7@ufs-gold.com'
      });
    }
    
    var message = {
      
      creator: 'tsv',
      sender: {
        name: 'Рассыльщик)',
        //contact: 'tsv@sandboxe8d94397545446aebd4fa664f4accf84.mailgun.org'
        //contact: 'tsv@salary-card.com'
        contact: 'mailer@lists.ufs-financial.ch'
      },
      recipients: recipients,
      /*recipients: [
        { name: 'Name1', contact: 'tsv@ufsic.com', fio: 'Some Name' },
        { name: 'Сергей', contact: 'tsv.titan@gmail.com', surname: 'Томилов', patronymic: 'Вячеславович' }
      ],*/
      //recipient: { name: 'Name1', contact: 'tsv@ufsic.com', fio: 'Some Name' },
      subject: '!!! Тема письма: {name}, {contact}',
      headers: {'QQQ-WWW-EEE':'RRR-TTT-YYY'},
      attachments: [
        
      ],
      view: 'mailer/test',
      //channel: 'MailgunOutgoing',
      //channel: 'GMailOutgoing',
      channel: 'ExchangeOutgoing',
      priority: 12,
      delay: 10,
      duration: 5
    };
    
    
    MailerService.send(message,function(err,response){
      
      res.json({
        route: req.route,
        param: req.param(),
        path: req.path,
        method: req.method,
        url: req.url,
        ip: req.ip,
        options: req.options,
        locals: res.locals
         
        //sample1: res.i18n("back.mailings.HH:mm:ss YYYY-MM-DD"),
        //sample2: res.dic('User is not found'),
        //sample3: res.i18n('back.mailings.Mailings are not found'),
        //userAgent: req.userAgent,
        //statues: statuses
      });
        
    });
  }
  
}

