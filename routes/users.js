const mongoose=require('mongoose')
var passportLocalMongoose=require('passport-local-mongoose');
mongoose.connect('mongodb://localhost/passs3')
var userSchema=mongoose.Schema({
  name: String,
  profilepic: {
    type: String,
    default:'24-248729_stockvader-predicted-adig-user-profile-image-png-transparent.png'
  },
  username:String,
  password:String,
  posts:[
    {type:mongoose.Schema.Types.ObjectId,ref:"post"}
  ]
})
userSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model('user',userSchema)