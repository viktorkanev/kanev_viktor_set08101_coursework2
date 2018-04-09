var mongoose = require('mongoose');

// Comment Schema
var commentSchema = mongoose.Schema({
  body:{
    type: String,
    required: true
  },
  author:{
    type: String,
    required: true
  }//,
  //articleId:{
  //  type: String,
 //  required: true
 // }
});

var Comment = module.exports = mongoose.model('Comment', commentSchema);