var express = require('express');
var router = express.Router();
var mongo=require('./users')
var mongopost=require('./post')
var passport = require('passport');
var passportLocal=require('passport-local');
const { render } = require('express/lib/response');
// const res = require('express/lib/response');
passport.use(new passportLocal(mongo.authenticate()))
const multer = require('multer');
const res = require('express/lib/response');
router.use(express.static(__dirname + "./public/"))

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/upload')
  },
  filename: function (req, file, cb) {
   const uniq = Date.now() + Math.floor(Math.random() *10000) + file.originalname
    cb(null, uniq)
  }
})

const upload = multer({ storage: storage, fileFilter: fileFilter })


function fileFilter (req, file, cb) {

  if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "video/mp4" || file.mimetype == "image/jpeg" ) {
    cb(null, true)
  }
  else {
    cb(null, false)
    return cb(new Error("only .png , .jpg ,and .jpeg format "))
  }

}


router.post('/register',function(req,res){
  var userdata=new mongo({
    name:req.body.name,
    username:req.body.username
  })
  mongo.register(userdata,req.body.password)
  .then(function(u){
    passport.authenticate('local')(req,res,function(){
      res.redirect('/profile')
    })
  })
  .catch(function (err) {
    res.send(err)
  })
})

 router.post('/login',passport.authenticate('local',{
   successRedirect:'/profile',
   failureRedirect:'/'
 }),function(req,res){})

 router.get('/profile',isLoggedIn,function(req,res){
  mongo.findOne({username:req.session.passport.user})
  .populate('posts')
    .then(function (loggedinuser) {
     console.log(loggedinuser)
     res.render('profile',{loggedinuser})
  })
 })

router.post('/upload', isLoggedIn,upload.single('image'), function (req, res, next) {
  mongo.findOne({ username: req.session.passport.user })
    .then(function (loginuser) {
      loginuser.profilepic = req.file.filename
      loginuser.save()
        .then(function () {
          res.redirect('/profile')
        })
  })

})

 function isLoggedIn(req,res,next)
 {if(req.isAuthenticated()){
   return next();
 }
else{
  res.redirect('/')
}}

router.post('/createpost',isLoggedIn,function(req,res){
  mongo.findOne({username:req.session.passport.user})
  .then(function(loggedinuser){
    mongopost.create({
      post1:req.body.newpost,
      userid:loggedinuser._id
    }).then(function(createdpost){
      loggedinuser.posts.push(createdpost._id);
      loggedinuser.save()
      .then(function(aa){
        res.redirect('/profile')
      })
    })
  })
})

router.get('/like/:id',isLoggedIn,function(req,res){
  mongo.findOne({username:req.session.passport.user})
  .then(function(founduser){
    mongopost.findOne({_id:req.params.id})
    .then(function(foundpost){
      if(foundpost.likes.indexOf(founduser._id)=== -1){
        foundpost.likes.push(founduser._id);
      }
      else{
        var kuchtoh=foundpost.likes.indexOf(founduser._id);
        foundpost.likes.splice(kuchtoh,1);
      }
      foundpost.save()
      .then(function(as){
        res.redirect(req.headers.referer)
      })
    })
  })
})

router.post('/comment/:id',isLoggedIn,function(req,res){
  mongo.findOne({username:req.session.passport.user})
  .then(function(foundcommentuser){
    mongopost.findOne({_id:req.params.id})
    .then(function(foundcommentpost){
      foundcommentpost.comments.push({username:foundcommentuser.username,comm:req.body.comment});
      foundcommentpost.save()
        .then(function (cc) {
        console.log(cc)
        res.redirect(req.headers.referer)
      })
    })
  })
})

router.get('/allpost',isLoggedIn,function(req,res){
  mongopost.find()
  .populate('userid')
    .then(function (saarepost) {
    console.log(req)
    res.render('allpost',{saarepost})
  })
})

router.get('/logout',function(req,res,next){
  req.logout();
  res.redirect('/');
})

module.exports = router;
