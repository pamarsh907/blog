const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const middleware = require('../utils/middleware')

require('node:dns/promises').setServers(['1.1.1.1', '8.8.8.8'])

blogsRouter.get('/', (request, response) => {
  Blog.find({})
    .populate('user', {
      username: 1,
      name: 1,
      id: 1
    })
    .then((blogs) => {
      response.json(blogs)
    })
})

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const body = request.body
  const user = request.user

  if (!user) {
    return response.status(400).json({ error: 'userId missing or not valid' })
  }

  if (!body.title || !body.url) {
    return response.status(400).end()
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  Blog.findById(savedBlog._id)
  .populate('user', {
    username: 1,
    name: 1,
    id: 1
  })
  .then((savedBlog) => {
    response.status(201).json(savedBlog)
  })
})


blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id).populate('user', {
    username: 1,
    name: 1,
    id: 1
  })
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const user = request.user

  if (!user) {
    return response.status(400).json({ error: 'userId missing or not valid' })
  }

  const blog = await Blog.findById(request.params.id).populate('user', {
    id: 1
  })

  if (blog.user.id.toString() === user.id.toString()) {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } else {
    return response.status(400).json({ error: 'invalid user, cannot delete' })
  }
})

blogsRouter.put('/:id', middleware.userExtractor, async (request, response, next) => {
  const { user, title, author, url, likes } = request.body

  if (!user) {
    return response.status(400).json({ error: 'userId missing or not valid' })
  }

  const blog = await Blog.findById(request.params.id).populate('user', {
    id: 1
  })

  blog.user = user,
  blog.title = title,
  blog.author = author,
  blog.url = url,
  blog.likes = likes

  return blog.save().then((updatedBlog) => {
    response.json(updatedBlog)
  })
    .catch(error => next(error))
})

module.exports = blogsRouter