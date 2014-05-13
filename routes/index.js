
/*
 * GET home page.
 */

/*exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};*/
var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');
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