const mongoose = require('mongoose');


const postSchema = mongoose.Schema({
  post1: String,
  userid:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user'
  },
  likes:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user'
  }],
  comments:[
    {type:mongoose.Schema.Types.Mixed},
    
  ]
})

module.exports = mongoose.model('post', postSchema)