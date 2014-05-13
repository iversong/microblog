
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var partials = require('express-partials');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(partials());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());

var flash = require('connect-flash');
app.use(flash());
// 必须放在 app.use(app.router); 之前
app.use(function(req, res, next){
    res.locals.user = req.session.user;
    //req.flash('error')执行一次就会消失,先赋给变量
    var err = req.flash('error');
    var succ = req.flash('success');
    res.locals.error = err.length ? err : null;
    res.locals.success = succ.length ? succ : null;
    next();
});

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

routes(app);
/*app.get('/', routes.index);
app.get('/users', user.list);*/

//app.get('port')
http.createServer(app).listen(app.get('port'), "192.168.56.128", function(){
  console.log('Express server listening on port ' + app.get('port'));
});
