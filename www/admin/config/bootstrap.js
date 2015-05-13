/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.bootstrap.html
 */

var util = require('util'),
    moment = require('moment'),
    Parser = require('ua-parser-js'),
    includeAll	= require('include-all'),
    path = require('path'),
    Agenda = require('agenda'),
    stackTrace = require('stack-trace'),
    NRP = require('node-redis-pubsub');

function initMoment() {
  global['moment'] = moment;
}

function initUtils() {
  
  var utils = {
    
     format: function(s,values) {

      function formatObj(s,values) {
        if (values) {
          values = typeof(values) === 'object' ? values : Array.prototype.slice.call(arguments, 1);

          if (typeof(s)==='string') {
            return s.replace(/\{\{|\}\}|\{(\w+)\}/g, function (m, n) {
                if (m == "{{") { return "{"; }
                if (m == "}}") { return "}"; }
                return values[n];
            });
          } else return s;
        } else return s;
      }
      
      if (util.isArray(values)) {
        var arr = _.clone(values);
        arr.unshift(s);
        for (var i in arr) {
          if (typeof(arr[i]) === 'object') {
            arr[i] = JSON.stringify(arr[i],null,' ');
          }
        }
        return util.format.apply(util,arr);
      } else {
        return formatObj(s,values);
      }
    },
    
    path2obj: function(obj,path,delim) {
      var items = path.split(delim);
      for (var i in items) {
        var o = obj[items[i]];
        if (o) {
          obj = o;
        } else {
          obj = null;
          break;
        }
      }
      return obj;
    },

    clone: function(obj) {
      return _.clone(obj);
    },

    extend: function(obj1,obj2) {
      return _.extend(obj1,obj2);
    },

    reject: function(item,result) {
      return _.reject(item,result);
    },

    filter: function(arr,result){
      return _.filter(arr,result);
    },
    
    forEach: function(arr,result) {
      return _.forEach(arr,result);
    },
    
    isObject: function(obj) {
      return _.isObject(obj);
    },
    
    isArray: function(obj) {
      return _.isArray(obj);
    },
    
    isFunction: function(obj) {
      return _.isFunction(obj);
    },
    
    isDefined: function(obj) {
      return !_.isUndefined(obj);
    },
    
    isNumber: function(obj) {
      return _.isNumber(obj);
    },
    
    isString: function(obj) {
      return _.isString(obj);
    }
    
  }
  
  global['Utils'] = utils;
}

function initLog() {
  
  var log = {
    
    info: function(s,values) {
      sails.log.info(Utils.format(s,values));
    },

    error: function(s,values) {
      sails.log.error(Utils.format(s,values));
    },

    warn: function(s,values) {
      sails.log.warn(Utils.format(s,values));
    },

    debug: function(s,values) {
      sails.log.debug(Utils.format(s,values));
    },

    exception: function(e) {
      sails.log.error(e.message);
    }
  }
  
  global['Log'] = log;
}

function extendUpToLog(obj,prefix,name,suffix,method) {
  
  if (obj.log) {
    return obj;
  }
  
  var n = (name)?name:obj.constructor.name;
  
  function removePhrase(s,phrase) {
    var s1 = s.substring(0,phrase.length);
    if (s1===phrase) {
      return s.substring(s1.length);
    } else return s;
  }
  
  function getTrace(traces,index,module) {
    
    var ret = '';
    var exp1 = new RegExp('^'+sails.config.appPath+'+');
    var exp2 = new RegExp('^'+sails.config.appPath+'/node_modules+');
    for (var i=index; i<traces.length; i++) {
      var t = traces[i];
      if (t) {
        var f = (t.methodName)?t.methodName:t.functionName;
        if (exp1.test(t.fileName) && !exp2.test(t.fileName) && f) {
          f = removePhrase(f,'module.exports.');
          ret = (!module)?Utils.format('.%s',[f]):Utils.format('.%s (%s, %d)',[f,t.fileName,t.lineNumber]);
          break;
        }
      }
    } 
    return ret;
  }
  
  function prepare(s,values,module,offset) {
    var pr = (prefix)?prefix+'/':'';
    var sf = (suffix)?suffix:'';
    var t = '';
    var traces = stackTrace.parse(new Error());
    if (method && traces && traces.length>(2+offset)) {
      offset = (offset)?offset:0;
      t = getTrace(traces,2+offset,module);
    }
    return Utils.format('[%s%s%s%s] => %s',[pr,n,sf,t,Utils.format(s,values)]);
  }
  
  var ext = {
    
    log: {
    
      debug: function(s,values,offset) {
        Log.debug(prepare(s,values,false,offset));
      },

      error: function(s,values,offset) {
        Log.error(prepare(s,values,false,offset));
      },

      info: function(s,values,offset) {
        Log.info(prepare(s,values,false,offset));
      },

      warn: function(s,values,offset) {
        Log.warn(prepare(s,values,false,offset));
      },

      exception: function(e) {
        Log.warn(prepare(e.message,null,true));
      }
    }
  }
  
  return Utils.extend(obj,ext);
}

function initEvents() {
  
  function Events() {
    
    this.name = 'Events';
    this.files = {};
    this.nrp = new NRP(sails.config.events);
  }
  
  Events.prototype = {
    
    setFile: function(name,file) {
      this.files[name] = file;
    },
    
    on: function(event,result) {
      this.nrp.on(event,function(data){
        this.log = extendUpToLog({},null,event).log;
        this.log.debug('Data: %s',[data]);
        result(data);
      });
      this.log.debug('%s is on',[event]);
    },

    off: function(event,result) {
      this.nrp.off(event,result);
      this.log.debug('%s is off',[event]);
    },

    emit: function(event,data) {
      this.nrp.emit(event,data || {});
    },

    quit: function() {
      this.nrp.quit();
    },

    end: function() {
      this.nrp.end();
    }
  }
  
  function loadEvents(dir) {
    
    dir = path.resolve(sails.config.appPath,dir);
    return includeAll({
			dirname: dir,
			filter: /(.+)\.js$/,
      excludeDirs : /^\.(git|svn)$/,
      optional: true,
      keepDirectoryPath: true,
      flattenDirectories: true
		}) || {};
	}
  
  function setOptions(file) {
    
    if (sails.config.events) {
      
      var opts = Utils.path2obj(sails.config.events,file.name,'/');
      file.disabled = (opts && Utils.isDefined(opts.disabled))?opts.disabled:file.disabled;
    }
    
    if (Config.events) {
      
      var opts = Utils.path2obj(Config.events,file.name,'/');
      file.disabled = (Utils.isDefined(opts))?!opts:file.disabled;
    }
  }
  
  function registerEvents(events,dir,prefix) {
    
    var log = events.log;
    var files = loadEvents(dir);
    if (files) {
      
      for (var i in files) {
        
        var file = files[i];
        
        if (file) {
          
          file.name = (file.name)?file.name:i.toString();
          file.name = (prefix)?prefix+file.name:file.name;
          
          setOptions(file);
          
          if (!file.disabled) {
          
            events.setFile(file.name,file);

            log.debug('{name} is loading...',file);

            for (var j in file) {
              var fn = file[j];
              if (Utils.isFunction(fn)) {
                events.on(Utils.format('%s/%s.%s',[events.name.toLowerCase(),file.name,j]),fn);
              }
            }
          }
        }
      }
    }
  }
  
  var events = new Events();
  events.name = sails.config.events.globalId;
  events = extendUpToLog(events,null,events.name);
  
  global[events.name] = events;
  
  var need = Config.events || (!Config.events && !sails.config.events.disabled);
  if (need) registerEvents(events,sails.config.events.directory);
}

function initServices() {
  
  Utils.forEach(sails.services,function(service){
    service = extendUpToLog(service,'services',service.globalId,null,true);
  });
}

function initModels() {
  
  Utils.forEach(sails.models,function(model){
    model = extendUpToLog(model,'models',model.globalId,null,true);
  });
}

function initControllers() {
  
  Utils.forEach(sails.controllers,function(controller){
    controller = extendUpToLog(controller,'controllers',controller.globalId,null,true);
  });
}

function initJobs() {
  
  function Jobs() {
    
    this.name = 'Jobs';
    this.files = {};
    
    var agenda = new Agenda(sails.config.jobs);
    this.agenda = agenda;
    
    agenda.name('bootstrap');
    
    var self = this;
    
    agenda.on('start',function(job) {
      job.name = job.attrs.name;
      job.stop = function(){
        job.forced = true;
        self.log.debug('{name} is stopping...',job);
        self.stop(job.attrs.name);
      }
      self.log.debug('{name} is starting...',job);
    });

    agenda.on('success',function(job) {
      self.log.debug('{name} finished {reason}',{name:job.name,reason:(job.forced)?'forcedly':'successfully'});
    });

    agenda.on('fail',function(err,job) {
      self.log.error('{name} finished with error: {error}',{name:job.name,error:err});
    });
    
    agenda.start();
  }
  
  Jobs.prototype = {
    
    setFile: function(name,file) {
      this.files[name] = file;
    },
    
    define: function(name,result) {
      var f = this.files[name];
      if (f && f.event) {
        
        var self = this;
        var n = Utils.format('%s/%s',[self.name.toLowerCase(),name]);
        
        Events.on(n,function(data){
          
          var job = n.slice(self.name.length+1);
          self.start(job,null,data);
        });
      }
      this.agenda.define(name,result);
    },
    
    start: function(name,interval,data,result) {
    
      var ret = false;
      var log = this.log;
      
      try {
        
        var dataIsFunc = Utils.isFunction(data);
        var needDefine = (result || dataIsFunc);
        
        if (needDefine) {      
          
          this.stop(name);
          
          this.agenda.define(name,function(job,done){
            if (dataIsFunc) {
              data(job,done);
            } else result(job,done);
          });
        }
        
        var flag = true;
        var file = this.files[name];
        if (!interval && file) {
          interval = file.interval;
          flag = (!interval);
        }
        if (interval) {
          this.agenda.every(interval,name,(!dataIsFunc)?data:null);
          if (flag && file) {
            file.interval = interval;
          }
        }
        
        ret = true;

      } catch(e) {
        log.exception(e);
      } finally {
        return ret;
      }
    },
    
    stop: function(name) {
      var log = this.log;
      this.agenda.cancel({name:name},function(err){
        if (err) log.error(err);
      }); 
    }
  }
  
  function loadJobs(dir) {
    
    dir = path.resolve(sails.config.appPath,dir);
    return includeAll({
			dirname: dir,
			filter: /(.+)\.js$/,
      excludeDirs : /^\.(git|svn)$/,
      optional: true,
      keepDirectoryPath: true,
      flattenDirectories: true
		}) || {};
	}
  
  function setOptions(file) {
    
    if (sails.config.jobs) {
      
      var opts = Utils.path2obj(sails.config.jobs,file.name,'/');
      file.disabled = (opts && Utils.isDefined(opts.disabled))?opts.disabled:file.disabled;
      file.interval = (opts && Utils.isDefined(opts.interval))?opts.interval:file.interval;
      file.options = (opts && Utils.isDefined(opts.options))?opts.options:file.options;
    }
    
    if (Config.jobs) {
      
      var opts = Utils.path2obj(Config.jobs,file.name,'/');
      file.disabled = (Utils.isDefined(opts))?!opts:file.disabled;
    }
  }
  
  function registerJobs(jobs,dir,prefix) {
    
    var log = jobs.log;
    var files = loadJobs(dir);
    if (files) {
      
      for (var i in files) {
        
        var file = files[i];
        
        if (file) {
          
          file.name = (file.name)?file.name:i.toString();
          file.name = (prefix)?prefix+file.name:file.name;

          setOptions(file);

          if (!file.disabled && file.execute) {

            jobs.setFile(file.name,file);

            log.debug('{name} is loading...',file);

            file = extendUpToLog(file,jobs.name.toLowerCase(),file.name,null,true);

            jobs.define(file.name,function(job,done){

              var f = jobs.files[job.name];
              if (f) {
                f.execute(job,done);
              } else done();
            });

            if (file.interval) {
              if (file.autoStart) jobs.start(file.name,file.interval,file.data);
            }
          }
        }
      }
    }
  }
  
  var jobs = new Jobs();
  jobs.name = sails.config.jobs.globalId;
  jobs = extendUpToLog(jobs,null,jobs.name);        
  
  global[jobs.name] = jobs;
  
  var need = Config.jobs || (!Config.jobs && !sails.config.jobs.disabled);
  if (need) registerJobs(jobs,sails.config.jobs.directory);
  
  return jobs; 
}

module.exports.bootstrap = function(cb) {

  global['Config'] = (process.env.CONFIG)?JSON.parse(process.env.CONFIG):{};
  
  initMoment();
  initUtils();
  initLog();
  
  Log.debug('Bootstraping...');
  Log.debug('Config: %s',[Config]);
  
  initEvents();
  initServices();
  initModels();
  initControllers();
  
  var jobs = initJobs();
  
  function processStop() {
    Events.end();
    jobs.stop(function() {
      process.exit(0);
    });
  }
  
  process.on('SIGTERM',processStop);
  process.on('SIGINT', processStop);
  
  sails.on('router:route', function(requestState) {
    
    var req = requestState.req;
    var res = requestState.res;
    
    if (!res.fmt && !res.dic) {
      
      req.fmt = res.fmt = Utils.format;

      var delim = sails.config.i18n.objectNotation;
      if (typeof(delim)==='boolean' && delim) {
        delim = '.';
      }

      function getDic(arr,name,values) {

        if (util.isArray(arr) && arr.length>0) {

          var s1 = arr.join(delim)+delim+name;
          var s2 = res.i18n(s1);

          if (s1!==s2) {
            return Utils.format(s2,values);
          } else {
            arr.pop();
            return getDic(arr,name,values);
          }
        } return res.i18n(Utils.format(name,values));

      }

      req.dic = function(name,values) {
        return getDic(['back',req.options.controller || req.options.view || res.locals.view],name,values);
      }
      res.dic = req.dic;
      res.locals.dic = res.dic;
    }
    
    if (res.view && Utils.isFunction(res.view) && !res.oldView) {
      res.oldView = res.view;
      res.view = function(name,values,result) {
        return res.oldView(name,Utils.extend(values,{view:name}),result);
      }
    }
    
    if (!req.userAgent) req.userAgent = new Parser().setUA(req.headers['user-agent']).getResult();
    
    if (req.session) {
      req.session.payload = (req.body && req.body.payload)?req.body.payload:false;
    } 
    
    req.options.jsonp = req.wantsJSON && /callback=/.test(req.url);
  });
  
  
  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  cb();
};
