var express = require('express');
var router = express.Router();

var Article = require('../models/article');
var User = require('../models/user');
var Comment = require('../models/comment');

// Get Single Article by ID
router.get('/article/:id', function(req, res){
	Article.findById(req.params.id, function(err, article){
		if(err){
			console.log(err);
		}else{
			res.render('singlepost', {
				article:article
			  });
		}		
	});
  });

// Load edit form
router.get('/article/edit/:id', function(req, res){
	Article.findById(req.params.id, function(err, article){
		res.render('editpost', {
			article:article
		});
	});
	});
	
	// Delete Article
router.delete('/article/:id', function(req, res){
  let query = {_id:req.params.id}

  Article.findById(req.params.id, function(err, article){
    if(err){
      console.log(err);
    } else {
      Article.remove(query, function(err){
        if(err){
          console.log(err);
        }
        res.send('Success');
      });
    }
  });
});

//Get homepage
router.get('/', function(req, res){
	Article.find({}, function(err, articles){
	  if(err){
		console.log(err);
	  } else {
		res.render('index', {
		  articles: articles
		});
	  }
	});
  });

//Get register page
router.get('/users/register', ensureNotAuthenticated, function(req, res){
	res.render('register');
});

//Get login page
router.get('/users/login', ensureNotAuthenticated, function(req, res){
	res.render('login');
});

//Get add post page
router.get('/users/addpost', isNotAdmin, ensureAuthenticated, function(req, res){
	res.render('addpost');
});


//Check if user is authenticated
function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
}



//Check if user is not authenticated
function ensureNotAuthenticated(req, res, next){
	if(!req.isAuthenticated()){
		return next();
	} else {
		req.flash('error_msg','You are already registered and logged in!');
		res.redirect('/');
	}
}

//Check if user is admin
function isNotAdmin(req, res, next){
	if(req.user.permission == 'admin'){
		return next();
	}else{
		req.flash('error_msg', 'Not authorised.');
		res.redirect('/');
	}
}


module.exports = router;