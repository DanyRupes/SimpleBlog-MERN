const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const Blog = mongoose.model('Blog');
    
const redis = require('redis')
const redisUrl = 'redis://127.0.0.1:6379'
const client = redis.createClient(redisUrl)
const util = require('util') // it gice sure guranty for get a promise

const cleanCache = require('../middlewares/cleanCache')

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    });
    
    res.send(blog);
  });
  
  app.get('/api/blogs', requireLogin, async (req, res) => {

    const blogs = await 
    Blog.find({ _user: req.user.id })
    .cache({key : req.user.id});
    
    res.send(blogs);
    
    
  });


  app.post('/api/blogs', requireLogin, cleanCache,async (req, res) => {
    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
      _user: req.user.id
    });

    try {
      await blog.save();
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }

  });



};




  // app.get('/api/blogs', requireLogin, async (req, res) => {

    
  //   client.get = util.promisify(client.get) //overwritting existing one
    
    
  //   // check is already  redis have   data .if yes respond data return
  //   const cachedBlogs = await client.get(req.user.id)

  //   if(cachedBlogs){
  //     console.log("serving from cached")
  //     return res.send(JSON.parse(cachedBlogs))
  //   } 
    
  //   console.log("serving from mongodb")
  //   //if do not have any cachedBlogs . // no: store data to store
  //   const blogs = await Blog.find({ _user: req.user.id });
    
  //   res.send(blogs);
    
  //   client.set(req.user.id, JSON.stringify(blogs))
    
  // });

