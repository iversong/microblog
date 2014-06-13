
/*
 * GET users listing.
 */
var mongoose = require('./newdb');

var ContentSchema = mongoose.Schema({
  date: String,
  content_en: String,
  content_zh: String,
  imgurl: String
});
ContentSchema.methods.speak = function () {
  var greeting = this.author ? "Meow name is " + this.author : "I don't have a name";
  console.log(greeting);
}

var ContentModel = mongoose.model('youdao', ContentSchema);

var ContentDO = function(){

};

module.exports = ContentDO;

ContentDO.prototype.save = function(obj,callback){
  var instance = new ContentModel(obj);
  instance.save(function(err){
   if (err) return callback(err);
  });
}

ContentDO.get = function(db,callback){
  db.find(function(err,doc){
    if (err) {
      return callback(err);
    }
    return callback(err,doc);
  });
}