//  OpenShift sample Node application
var express = require('express'),
    app     = express(),
    morgan  = require('morgan');
var bodyParser = require('body-parser');
Object.assign=require('object-assign');

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 9000,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
      mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

  }
}
var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};

//app.use(express.static('views'));
app.get('/', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  
  console.log("db log = ", db)
  
  if (db) {
    var col = db.collection('counts');
    // Create a document with request IP and current time of request
    col.insert({ip: req.ip, date: Date.now()});
    col.count(function(err, count){
      if (err) {
        console.log('Error running count. Message:\n'+err);
      }
//      console.log("[info] db is not null")
      res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
    });
  } else {
//    console.log("[info] db is null")
    res.render('index.html', { pageCountMessage : null});
  }
});

app.get('/pagecount', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    db.collection('counts').count(function(err, count ){
      res.send('{ pageCount: ' + count + '}');
    });
  } else {
    res.send('{ pageCount: -1 }');
  }
});

app.get('/pagetest', function (req, res) {
  if (!db) { initDb(function(err){}); }
  if (db) {
    db.collection('counts').count(function(err, count ){
      res.status(200).send('{ pageCount: ' + count + '}');
    });
  } else {
    res.send('{ pageCount: -1 }');
  }
});

app.post('/import_sensor_data', function (req, res) {

  // 初期化
  if (!db) {
    initDb(function(err){});
  }
  
  // レコード挿入
  if (db) {
    if(req.body != null && req.body != "" && req.body != {} && req.body != []) {
      
      // 現在日時を取得
      var nowDate = new Date();
      nowDate.setHours(nowDate.getHours()+9);
      var yy = nowDate.getFullYear();
      var mm = nowDate.getMonth();
      var dd = nowDate.getDate();
      var hh = nowDate.getHours();
      var mi = nowDate.getMinutes();
      var ss = nowDate.getSeconds();
      
      // body内の情報に現在日時情報を追加
      req.body['year'] = Number(yy);
      req.body['month'] = Number(mm) + 1;
      req.body['day'] = Number(dd);
      req.body['hour'] = Number(hh);
      req.body['minute'] = Number(mi);
      req.body['second'] = Number(ss);
      
      // レコード挿入
      var col = db.collection('sensor_datas');
      col.insert(req.body);

      // bodyに含まれる気温と湿度を取り出す。
      var temperture = req.body.temperture;
      var humidity = req.body.humidity;

      // 不快度指数を計算
      var discomfortIdx = getDiscomfortIdx(temperture, humidity);
      
      // 不快度指数を返す
      res.json({ discomfort_index : discomfortIdx });
    }
    else {
      // レコード挿入失敗
      res.json({ discomfort_index: -1 });
    }
  }
  else {
    // レコード挿入失敗
    res.json({ discomfort_index: -1 });
  }
});

app.get('/get_discomfort_index_kind1', function (req, res) {
  if(req.query != null && req.query != "" && req.query != {} && req.query != []) {
    if(!db) {
      initDb(function(err){});
    }
    
    if(db) {
      
      // 検索対象
      var findQuery = { id: 0 };
      findQuery['id'] = Number(req.query.id);

      // 並び順
      var sortQuery = { _id: -1 };

      // 実行
      var col = db.collection('sensor_datas');
      var arr = col.find(findQuery).sort(sortQuery).limit(1).toArray((error, documents) => {

        // 気温と湿度を取り出す。
        var document = documents[0];
        var temperture = Number(document.temperture);
        var humidity = Number(document.humidity);

        // 不快度指数を計算
        var discomfortIdx = getDiscomfortIdx(temperture, humidity);
        
        // 不快度指数を返す
        res.json({ discomfort_index : discomfortIdx });
      });
    }
    else {
      res.json({ discomfort_index: -1 });
    }
  }
  else {
    res.json({ discomfort_index: -1 });
  }

});

app.get('/get_sensor_datas_all', function (req, res) {
  if(!db) {
    initDb(function(err){});
  }
  
  if(db) {
    var col = db.collection('sensor_datas');
    var getQuery = {};
    var arr = col.find(getQuery).toArray((error, documents) => {
      console.log('OK');
      res.status(200).json(documents);
    });
  }
  else {
    res.status(500).send("UnknownError");
  }
});

app.post('/remove_sensor_datas', function (req, res) {
  // コレクション削除
  if(db) {
    var col = db.collection('sensor_datas');
    col.deleteMany({});

    var findQuery = {};
    var arr = col.find(findQuery).toArray((error, documents) => {
      console.log('OK');
      res.status(200).json(documents);
    });
  }
  else {
    res.status(500).send("UnknownError");
  }
});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;

// 不快度指数計算
function getDiscomfortIdx(temperture, humidity) {
  return (0.81 * temperture + 0.01 * humidity * (0.99 * temperture-14.3) + 46.3);
}
