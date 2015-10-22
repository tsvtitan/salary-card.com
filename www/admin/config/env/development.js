/**
 * Development environment settings
 *
 * This file can include shared settings for a development team,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {

  /***************************************************************************
   * Set the default database connection for models in the development       *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/
  port: process.env.PORT || 1337,
  environment: process.env.NODE_ENV || 'development',
  
  connections: {
    
    workConnection: {
      adapter: 'sails-mongo',
      host: 'localhost',
      port: 27017,
      database: 'admin'
    }
  },
  
  models: {
    connection: 'workConnection',
    migrate: 'alter'
  },
  
  session: {
    adapter: 'redis',
    host: 'localhost',
    db: 1
  },
  
  sockets: {
    adapter: 'socket.io-redis',
    host: 'localhost'
  },
  
  cors: {
    allRoutes: true
  },
  
  jobs: {
    
    disabled: false,
    
    db: {
      address: 'localhost:27017/admin',
      collection: 'jobs'
    },
    
    mailer: {
      
      Outgoing: {
        disabled: true,
        interval: '30 seconds',
        event: true
      }
      
    }
  },
  
  events: {
    
    disable: false,
    
    host: 'localhost',
    scope: 'admin'
    
  },
  
  channels: {
    
    disable: false,
    outgoingLimit: 5,
    
    GMailOutgoing: {
      disabled: false
    },
    
    MailgunOutgoing: {
      disabled: false
    },
    
    SendGridOutgoing: {
      disabled: true
    },
    
    ExchangeOutgoing: {
      disabled: false
    }
  },
  
  mailerService: {
    url: 'http://localhost:1337/admin/api/mailer',
    auth: {
      login: 'tsv'
    }
  }
  
};
