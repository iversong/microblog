
/*
 * GET home page.
 */

/*exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};*/
var http = require('http');
var crypto = require('crypto');
var cheerio = require('cheerio');
var User = require('../models/user.js');
var Post = require('../models/post.js');
var Youdao = require('../models/youdao.js');
var Content = require('../models/content.js');
module.exports = function(app) {
	app.get('/', function(req, res) {
    //throw new Error('An error for test purposes.');
      /*Post.get(null, function(err, posts) {
        if (err) {
          posts = [];
        }
        console.log(posts);
        res.render('index', {
          title: '首页',
          posts: posts,
        });
      });*/
	  //判断是否是第一页，并把请求的页数转换成 number 类型
	  var page = req.query.p ? parseInt(req.query.p) : 1;
	  //查询并返回第 page 页的 10 篇文章
	  Post.findPagination(null, page, function (err, posts, total) {
	    if (err) {
	      posts = [];
	    } 
	    //console.log(posts);
	    res.render('index', {
	      title: '主页',
	      posts: posts,
	      page: page,
	      total: total,
	      isFirstPage: (page - 1) == 0,
	      isLastPage: ((page - 1) * 10 + posts.length) == total,
	      user: req.session.user,
	      success: req.flash('success').toString(),
	      error: req.flash('error').toString()
	    });
	  });
    });

	//app.get('/reg', checkNotLogin);
	app.get('/reg', function(req, res) {
		res.render('reg', {
      		title: '用户注册',
    	});
  	});

  	//app.post('/reg', checkNotLogin);
  	app.post('/reg', function(req, res) {
	    //檢驗用戶兩次輸入的口令是否一致
	    if (req.body['password-repeat'] != req.body['password']) {
	      req.flash('error', '兩次輸入的口令不一致');
	      return res.redirect('/reg');
	    }

	    //生成口令的散列值
	    var md5 = crypto.createHash('md5');
	    var password = md5.update(req.body.password).digest('base64');
	    var newUser = new User({
	      name: req.body.username,
	      password: password,
	    });

	    //檢查用戶名是否已經存在
	    User.get(newUser.name, function(err, user) {
	      if (user)
	        err = 'Username already exists.';
	      if (err) {
	        req.flash('error', err);
	        return res.redirect('/reg');
	      }
	      //如果不存在則新增用戶
	      newUser.save(function(err) {
	        if (err) {
	          req.flash('error', err);
	          return res.redirect('/reg');
	        }
	        req.session.user = newUser;
	        req.flash('success', '註冊成功');
	        res.redirect('/');
	      });
	    });
    });

    //登陆页
    app.get('/login', checkNotLogin);
	app.get('/login', function(req, res) {
	    res.render('login', {
	      title: '用戶登入',
	    });
	});

	//登陆操作
	app.post('/login', checkNotLogin);
	app.post('/login', function(req, res) {
	    //生成口令的散列值
	    var md5 = crypto.createHash('md5');
	    var password = md5.update(req.body.password).digest('base64');

	    User.get(req.body.username, function(err, user) {
	      if (!user) {
	        req.flash('error', '用戶不存在');
	        return res.redirect('/login');
	      }
	      if (user.password != password) {
	        req.flash('error', '用户口令错误');
	        return res.redirect('/login');
	      }
	      req.session.user = user;
	      req.flash('success', '登入成功');
	      res.redirect('/');
	    });
	});


    //登出
    app.get('/logout', checkLogin);
	app.get('/logout', function(req, res) {
    	req.session.user = null;
    	req.flash('success', '登出成功');
    	res.redirect('/');
	});

	app.get('/u/:user', function(req, res) {
	    User.get(req.params.user, function(err, user) {
	    	if (!user) {
	        	req.flash('error', '用戶不存在');
	        	return res.redirect('/');
	      	}
	     	/*Post.get(user.name, function(err, posts) {
		        if (err) {
		          req.flash('error', err);
		          return res.redirect('/');
		        }
		        res.render('user', {
		          title: user.name,
		          posts: posts,
		        });
	      	});*/
	    	var page = req.query.p ? parseInt(req.query.p) : 1;
	    	Post.findPagination(user.name, page, function (err, posts, total) {
			    if (err) {
			      req.flash('error', err);
		          return res.redirect('/');
			    } 
			    res.render('index', {
			      title: '主页',
			      posts: posts,
			      page: page,
			      total: total,
			      isFirstPage: (page - 1) == 0,
			      isLastPage: ((page - 1) * 10 + posts.length) == total,
			      user: req.session.user,
			      success: req.flash('success').toString(),
			      error: req.flash('error').toString()
			    });
			});
	    });
  	});

  	app.post('/post', checkLogin);
  	app.post('/post', function(req, res) {
	    var currentUser = req.session.user;
	    var post = new Post(currentUser.name, req.body.post);
	    //console.log(req.body);
	    //console.log(req.body.post);
	    //return;
	    post.save(function(err) {
	    	if (err) {
	        	req.flash('error', err);
	        	return res.redirect('/');
	      	}
	      	//console.log('success');
	     	req.flash('success', '发表成功');
	      	res.redirect('/u/' + currentUser.name);
	    });
	});

	//
	app.get('/article', checkLogin);
	app.get('/article',function(req,res){
		res.render('article', {
      		title: '文档列表',
    	});
		var currentUser = req.session.user;
		var article = new Content();
		var json = {author:currentUser.name,title:'标题测试',text:'哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈'};
		article.save(json,function(err){
			if (err) {
				req.flash('error', '保存失败');
				res.redirect('/');
			} else {
				req.flash('success', '发表成功');
	      		res.redirect('/article');
			}
		});
		/*Content.get(article,function(err,contents){
			console.log(contents);
		});*/
	});

	app.get('/creeper', function(req,res){
		var base_url = "http://xue.youdao.com/w?page=";

		var doUrls = new Urls(base_url);
		console.info('do here');
		// doUrls.hasNext(function(err,res){

		// });
		// 
		doUrls.next(function(error,curr_link){
				console.log('link:',curr_link);
			});
		/*while(){
			
		}*/
		
		/*http.get(url, function(res_du) {
		    var source = "";
		    //通过 get 请求获取网页代码 source
		    res_du.on('data', function(data) {
		        source += data;
		    });
		    //获取到数据 source，我们可以对数据进行操作了!
		    res_du.on('end', function() {
		        //console.log(source);
		        if (source.length > 0) {
		        	var $ = cheerio.load(source);
		        	var title = $('.current-data').find('.trans').text();
		        	var dataList = $('.data-list ul>li');
		        	var content = [];
		        	var items = {};
		        	var doYoudao = new Youdao();
		        	console.log(dataList.length);
		        	dataList.each(function(i, elem) {
		        		items.date = $(this).find('h2').text();
		        		items.content_en = $(this).find('.sen').text();
		        		items.content_zn = $(this).find('.trans').text();
		        		items.imgurl = $(this).find('.pic-show img').attr('src');
						content[i] = items;
						doYoudao.save(items,function(err){
							if (err) {
								console.log(err);
							}
						});
					});
		        	console.log(content);
		        	//var title = dataList.children('.content.trans').text();
		        	//console.log(title);
		        	res.send(title);
		        	//req.flash('success', '抓取数据成功!');
	      			//res.redirect('/');
		        };
		        //这将输出很多的 html 代码
		    });
		}).on('error', function() {
		    console.log("获取数据出现错误");
		});*/
	});
}

function checkLogin(req, res, next) {
  if (!req.session.user) {
    req.flash('error', '未登入');
    return res.redirect('/login');
  }
  next();
}

function checkNotLogin(req, res, next) {
  if (req.session.user) {
    req.flash('error', '已登入');
    return res.redirect('/');
  }
  next();
}


var BASE_URL = 'http://xue.youdao.com/w';
var scrapy = {}
/**
 * Get page from url.
 *
 * Examples:
 *
 * scrapy.get('http://www.baidu.com', cb);
 * // => 'baidu page html
 * 
 * @interface
 * @param {String} url:ex http://www.baidu.com
 * @param {Function} cb
 * @private
 */
scrapy.get = function(url, cb){
  http.get(url, function(res) {

    var size = 0;
    var chunks = [];

    res.on('data', function(chunk){
      size += chunk.length;
      chunks.push(chunk);
    });

    res.on('end', function(){
      var data = Buffer.concat(chunks, size);
      cb(null, data);
    });

  }).on('error', function(e) {
    cb(e, null);
  });
}

var Urls = function(startUrl){
  this.startUrl = startUrl;
  this.page = 0;
}

Urls.prototype.next = function(cb){
  var self = this;
  
  console.info(self.hasNextM());
  
  /*for (var i = 0; i < 180; i++) {
  	 self.hasNext(function(err,bret){
  		if (bret) {
  			console.log('current_page:' + self.page);
  		};
  		self.page += 1;
  		//return false;
 	 });
  };*/
  /*self.hasNext(function(err, bRet){
  	console.log(22222222);
    if(!bRet){
    	console.log('no next-page');
      	return null;
    }
    self.page += 1;
    var curr_link = self.startUrl + self.page + '&type=all';
    cb(null,curr_link);
    // self.homeParse(function(err, topics){
    //   self.page += 1;
    //   cb(null, topics);
    // })
  })*/
}

Urls.prototype.hasNext = function(cb){
  var self = this;
  var url = self.startUrl + self.page + '&type=all';
  //return 222;
  scrapy.get(url, function(err, data){
    $ = cheerio.load(data);
    var next_page = $('.turn-num a').hasClass('next-page');
    //console.log(next_page);
    if(!next_page){
      return cb(null,false);
    }
    return cb(null,true);

  });
};

Urls.prototype.hasNextM = function(){
  var self = this;
  var url = self.startUrl + self.page + '&type=all';
  //return 222;
  scrapy.get(url, function(err, data){
    $ = cheerio.load(data);
    var next_page = $('.turn-num a').hasClass('next-page');
    //console.log(next_page);
    if(!next_page){
    	consoel.log('no no no ');
      return false;
    }
    return url;

  });
};

/*Urls.prototype.homeParse = function(cb){
  var self = this;
  var topics = [];

  async.filter(self.homePage, function(i, cb){
    var url = BASE_URL + self.homePage[i].attribs['href']
    scrapy.get(url, function(err, topic){
      topics.push(topic.toString());
      cb(null);
    })

  },function(err){
    cb(err, topics);
  });
}*/

Urls.prototype.parseData = function(html){
  var self = this;
  var url = this.startUrl + this.page + '&type=all';

  var $ = cheerio.load(html);
  var title = $('.current-data').find('.trans').text();
  var dataList = $('.data-list ul>li');
  var content = [];
  var items = {};
  dataList.each(function(i, elem) {
	items.date = $(this).find('h2').text();
	items.content_en = $(this).find('.sen').text();
	items.content_zn = $(this).find('.trans').text();
	items.imgurl = $(this).find('.pic-show img').attr('src');
	content[i] = items;
  });
  return content;
}