const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

require('node:dns/promises').setServers(['1.1.1.1', '8.8.8.8'])

blogsRouter.get('/', (request, response) => {
  Blog.find({}).then((blogs) => {
    response.json(blogs)
  })
})

blogsRouter.post('/', (request, response) => {
  const blog = new Blog(request.body)

  blog.save().then((result) => {
    response.status(201).json(result)
  })
})

module.exports = blogsRouter