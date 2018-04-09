var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
var helpers = require('handlebars-helpers');
var comparison = helpers.comparison();


mongoose.connect('mongodb://localhost/blog');
var db = mongoose.connection;

// Bring in Models
var Article = require('./models/article');
var Comment = require('./models/comment');

// Check connection
db.once('open', function(){
  console.log('Connected to MongoDB');
});

// Check for DB errors
db.on('error', function(err){
  console.log(err);
});

var routes = require('./routes/index');
var users = require('./routes/users');

// Init App
var app = express();

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

//Add new article
app.post('/articles/add', function(req, res){

  //Validation
  req.checkBody('title', 'Title is required').notEmpty();
  req.checkBody('author', 'Author is required').notEmpty();
  req.checkBody('body', 'Body is required').notEmpty();

  var errors = req.validationErrors();

  if(errors){
    res.render('addpost',{
      errors:errors
    });
  }else{
    let article = new Article();
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;
  
    article.save(function(err){
      if(err){
        console.log(err);
        return;
      }else{
        res.redirect('/');
      }
    });
  }

});

//Add comment
app.post('/articles/comment', function(req, res){
  req.checkBody('comment', 'Comment is required').notEmpty();
  var errors = req.validationErrors();
  if(errors){
    res.redirect('/');
  }else{
    let comment = new Comment();
    comment.body = req.body.comment;
    comment.author = req.user._id;
    //comment.articleId = req.article._id;

    comment.save(function(err){
      if(err){
        console.log(err);
        return;
      }else{
        res.redirect('/singlepost')
      }
    })

  }
})

//Edit article
app.post('/articles/edit/:id', function(req, res){
  let article = {};
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  let query = {_id:req.params.id}

  Article.update(query, article, function(err){
    if(err){
      console.log(err);
      return;
    }else{
      res.redirect('/');
    }
  });
});


app.use('/', routes);
app.use('/users', users);
app.use('/addpost', routes);
app.use('/singlepost', routes);

// Set Port
app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function(){
	console.log('Server started on port '+app.get('port'));
});