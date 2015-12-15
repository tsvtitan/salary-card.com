// mailer/Outgoing

module.exports = {
  
  disabled: true,
  interval: '30 * * * *',
  autoStart: true,
  event: true,
  options: {
    limit: 2
  },
  data: {},
  
  execute: function(job,done) {
    
    var log = this.log;
    try {
      
      var options = Utils.extendSeries([this.data,job.attrs.data,this.options]);
      
      options.creator = job.name;
      
      log.debug('Options: %s',[options]);
      
      async.waterfall([

        function find(result){
          
          var where = {
            or: [
              {
                begin: [null,undefined,false],
                end: [null,undefined,false],
                sent: [null,undefined,false],
                locked: [null,undefined,false]
              },
              {
                begin:{'<=':moment().toDate()},
                end:{'>':moment().toDate()},
                sent: [null,undefined,false],
                locked: [null,undefined,false]
              }
            ]
          };
          
          if (options.id) {
            where = Utils.extend(where,{id:options.id});
          }
          
          var sort = {
            created: -1,
            priority: 1
          };
          
          var fields = {
            id: 1,
            created: 1,
            sender: 1,
            recipient: 1,
            recipients: 1,
            channel: 1,
            subject: 1,
            text: 1,
            view: 1,
            headers: 1,
            attachments: 1
          };
          
          MessagesModel.find({where:where,sort:sort,limit:options.limit},{fields:fields},
                             function(err,msgs){
                          
            //console.log(msgs);
            result(err,msgs);
          });
        },
        
        function lock(msgs,result){
          
          if (!Utils.isEmpty(msgs)) {
            
            var locked = new Date();
            
            async.map(msgs,function(m,ret){
              
              MessagesModel.update({id:m.id},{locked:locked},function(err,updated){
                
                if (!err && updated) {
                  m.locked = locked;
                  ret(null,m);
                } else ret(err,m);
                
              });
              
            },function(err,rets){
              
              result(err,(!err)?Utils.concat(rets):[]);
            });
                    
          } else result(null,[]);
        },
        
        function send(msgs,result){

          if (!Utils.isEmpty(msgs)) {
            
            msgs = Utils.reject(msgs,function(m) {
              return !Utils.isDefined(m.locked);
            });
            
            Channels.send(msgs,function(err){
              
              result(err,msgs);
            });
            
          } else result(null,msgs);
        },
        
        function unlock(msgs,result){
          
          if (!Utils.isEmpty(msgs)) {
            
            async.map(msgs,function(m,ret){
              
              var obj = {
                locked: null,
                sent: (m.sent)?m.sent:null,
                error: (m.error)?m.error:null,
                allCount: (m.allCount)?m.allCount:null,
                sentCount: (m.sentCount)?m.sentCount:null,
                errorCount: (m.errorCount)?m.errorCount:null
              };
              
              MessagesModel.update({id:m.id},obj,function(err,updated){
                
                ret(err,{id:m.id,updated:updated});
              });
              
            },function(err,rets){
              
              var count = 0;
              if (!err) {
                for (var i in rets) {
                  count = count + (rets[i].updated)?1:0;
                }
              }
              result(err,false);
            });
            
          } else result(null,false);
        }
        

      ],function(err,stop) {
        if (err) log.error(err);
        else if (stop) {
          job.stop();
        }
        done();
      });
      
    } catch(e) {
      log.exception(e);
      done();
    }
  }
}