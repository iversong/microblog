
/*
 * MongoDB Post Methord.
 */
var mongodb = require('./db');
var moment = require('moment');

function Post(username, post, time) {
  this.user = username;
  this.post = post;
  if (time) {
    this.time = time;
  } else {
    //this.time = new Date();
    this.time = new Date();
  }
};
module.exports = Post;

Post.prototype.save = function save(callback) {
  // 存入 Mongodb 的文檔
  var post = {
    user: this.user,
    post: this.post,
    time: this.time,
    c_time: moment().format('YYYY-MM-DD H:mm:ss',this.time),
  };
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    // 讀取 posts 集合
    db.collection('posts', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      // 爲 user 屬性添加索引
      collection.ensureIndex('user');
      // 寫入 post 文檔
      collection.insert(post, {safe: true}, function(err, post) {
        mongodb.close();
        callback(err, post);
      });
    });
  });
};

Post.get = function get(username, callback) {
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    // 讀取 posts 集合
    db.collection('posts', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      // 查找 user 屬性爲 username 的文檔，如果 username 是 null 則匹配全部
      var query = {};
      if (username) {
        query.user = username;
      }
      collection.find(query).sort({time: -1}).toArray(function(err, docs) {
        mongodb.close();
        if (err) {
          callback(err, null);
        }
        // 封裝 posts 爲 Post 對象
        var posts = [];
        docs.forEach(function(doc, index) {
          var post = new Post(doc.user, doc.post, doc.c_time);
          posts.push(post);
        });
        callback(null, posts);
      });
    });
  });
};

//分页查询
Post.findPagination = function(name,page,callback){
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    //读取 posts 集合
    db.collection('posts', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      var query = {};
      if (name) {
        query.user = name;
      }
      //使用 count 返回特定查询的文档数 total
      collection.count(query, function (err, total) {
        //根据 query 对象查询，并跳过前 (page-1)*10 个结果，返回之后的 10 个结果
        collection.find(query,{skip: (page - 1)*10,limit: 10}).sort({time: -1}).toArray(function(err, docs) {
          mongodb.close();
          if (err) {
            return callback(err);
          }
          //解析 markdown 为 html
          var posts = [];
          docs.forEach(function (doc) {
            var post = new Post(doc.user, doc.post, doc.c_time);
            posts.push(post);
            //doc.post = markdown.toHTML(doc.post);
          });  
          callback(null, docs, total);
        });
      });
    });
  });
}