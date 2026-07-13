const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')
const Blog = require('../models/blog')
const helper = require('../utils/list_helper')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})

  await Blog.insertMany(helper.initialBlogs)
})

test.only('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test.only('blog identifier is name id', async () => {
  const blog = await helper.getOneBlog()
  const fieldNames = Object.keys(blog)

  assert.strictEqual(fieldNames.includes("id"), true)
  assert.strictEqual(fieldNames.includes("_id"), false)
})

test('a valid blog can be added ', async () => {
  const newBlog = {
    title: 'best sandwich in the world',
    author: 'joey triviani',
    url: 'blah.what.com',
    likes: 2
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

  const title = blogsAtEnd.map(n => n.title)
  assert(title.includes('best sandwich in the world'))
})

test('likes defaults to zero ', async () => {
  const newBlog = {
    title: 'best sandwich in the world',
    author: 'joey triviani',
    url: 'blah.what.com',
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blog = await Blog.findOne({title: 'best sandwich in the world'})
  assert.strictEqual(blog.likes, 0)
})

test('if title is missing return 400 Bad Reqeust', async () => {

  const blogNoTitle = {
    author: 'joey triviani',
    url: 'blah.what.com',
    likes: 5
  }

  const response = await api
    .post('/api/blogs')
    .send(blogNoTitle)
  
  assert.strictEqual(response.status, 400)
})

test('if url is missing return 400 Bad Reqeust', async () => {
  const blogNoUrl = {
    title: 'new blog',
    author: 'joey triviani',
    likes: 5
  }

  const response = await api
    .post('/api/blogs')
    .send(blogNoUrl)

  assert.strictEqual(response.status, 400)
})

after(async () => {
  await mongoose.connection.close()
})