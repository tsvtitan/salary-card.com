// TestController

var moment = require('moment');

module.exports = {
  
  req: function(req,res) {
    
    var log = this.log;
    
    console.log('Test/req');
    
    /*var recipients = [];
    
    var maxCount = 1;
    
    for (var i=0; i<maxCount; i++) {
      
      recipients.push({
        name: Utils.format('имя #%s',[i+1]),
        contact: 'test7@ufs-gold.com',
        fio: 'Some Name',
        param: 'Параметр'
      });
    }*/
    
    /*var message = {
      
      creator: 'tsv',
      sender: {
        name: 'Рассыльщик)',
        //contact: 'tsv@sandboxe8d94397545446aebd4fa664f4accf84.mailgun.org'
        //contact: 'tsv@salary-card.com'
        contact: 'mailer@lists.ufs-financial.ch'
      },
      //begin: moment().toDate(),
      //end: moment().add({minutes:10}).toDate(),
      delay: 1,
      duration: 15,
      recipients: recipients,
      /*recipients: [
        { name: 'Name1', contact: 'tsv@ufsic.com', fio: 'Some Name' },
        { name: 'Сергей', contact: 'tsv.titan@gmail.com', surname: 'Томилов', patronymic: 'Вячеславович' }
      ],*/
      //recipient: { name: 'Name1', contact: 'tsv@ufsic.com', fio: 'Some Name', param: 'Параметр' },
      /*subject: '!!! Тема письма: {name}, {contact}',
      headers: {'QQQ-WWW-EEE':'RRR-TTT-YYY'},
      attachments: [
        {
          filename: '{name}_{fio}_{contact}_license.txt',
          content: 'aGVsbG8gd29ybGQh',
          encoding: 'base64'
        },
        {
          filename: '{param}_{fio}_{contact}_license.txt',
          path: 'https://raw.github.com/andris9/Nodemailer/master/LICENSE'
        }
      ],
      text: '<h3>{fio}</h3>',
      view: 'mailer/test',
      //channel: 'MailgunOutgoing',
      //channel: 'GMailOutgoing',
      channel: 'ExchangeOutgoing',
      priority: 12
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
        
    });*/
    
    var table = {
      "zoom": {
        "enabled": true,
        "scaleExtent": [
         1,
         10
        ],
        "useFixedDomain": false,
        "useNiceScale": false,
        "horizontalOff": false,
        "verticalOff": true,
        "unzoomEventType": "dblclick.zoom"
      }
    };
    
    var fields = {zoom:1,enabled:1,scaleExtent:1};
    
    table = Utils.remainKeys(table,fields);
    
    log.debug(table);
    
    res.json(table);
  }
  
}

