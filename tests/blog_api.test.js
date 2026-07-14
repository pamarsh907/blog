const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('../utils/list_helper')
const bcrypt = require('bcryptjs')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})
  await Blog.deleteMany({})

  const passwordHash = await bcrypt.hash('password', 10)

  const user = new User({
    username: 'bobby',
    name: 'Bob',
    passwordHash,
    blogs: []
  })

  await user.save()

  const blog1 = new Blog({
    title: 'First blog',
    author: 'Bob',
    url: 'http://first.com',
    likes: 1,
    user: user._id
  })

  const blog2 = new Blog({
    title: 'Second blog',
    author: 'Bob',
    url: 'http://second.com',
    likes: 5,
    user: user._id
  })

  const initialBlogs = [
    {
      blog1
    },
    {
      blog2
    }
  ]

  const savedBlog1 = await blog1.save()
  const savedBlog2 = await blog2.save()

  user.blogs = [savedBlog1._id, savedBlog2._id]
  await user.save()
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

  const user = {
    username: 'bobby',
    password: 'password'
  }

  const response = await api
    .post('/api/login')
    .send(user)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const token = response.body.token
  console.debug('token :', token)

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)
  console.debug('third')
  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, 3)

  const title = blogsAtEnd.map(n => n.title)
  assert(title.includes('best sandwich in the world'))
})

test('likes defaults to zero ', async () => {
  const user = {
    username: 'bobby',
    password: 'password'
  }

  const response = await api
    .post('/api/login')
    .send(user)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const token = response.body.token

  const newBlog = {
    title: 'best sandwich in the world',
    author: 'joey triviani',
    url: 'blah.what.com',
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .set('Authorization', `Bearer ${token}`)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blog = await Blog.findOne({title: 'best sandwich in the world'})
  assert.strictEqual(blog.likes, 0)
})

test('if title is missing return 400 Bad Reqeust', async () => {
  const user = {
    username: 'bobby',
    password: 'password'
  }

  const loginResponse = await api
    .post('/api/login')
    .send(user)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const token = loginResponse.body.token

  const blogNoTitle = {
    author: 'joey triviani',
    url: 'blah.what.com',
    likes: 5
  }

  const response = await api
    .post('/api/blogs')
    .send(blogNoTitle)
    .set('Authorization', `Bearer ${token}`)
  
  assert.strictEqual(response.status, 400)
})

test('if url is missing return 400 Bad Reqeust', async () => {
  const user = {
    username: 'bobby',
    password: 'password'
  }

  const loginResponse = await api
    .post('/api/login')
    .send(user)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const token = loginResponse.body.token

  const blogNoUrl = {
    title: 'new blog',
    author: 'joey triviani',
    likes: 5
  }

  const response = await api
    .post('/api/blogs')
    .send(blogNoUrl)
    .set('Authorization', `Bearer ${token}`)

  assert.strictEqual(response.status, 400)
})

describe('deletion of a blog', () => {  
  test('succeeds with status code 204 if id is valid', async () => {
    const user = {
      username: 'bobby',
      password: 'password'
    }

    const response = await api
      .post('/api/login')
      .send(user)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const token = response.body.token

    const blogsAtStart = await helper.blogsInDb()
    //get bobbys blog
    const blogToDelete = await Blog.findOne({title: 'First blog'})

    await api.delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)
      .set('Authorization', `Bearer ${token}`)
    const blogsAtEnd = await helper.blogsInDb()

    const ids = blogsAtEnd.map(n => n.id)
    assert(!ids.includes(blogToDelete.id))

    assert.strictEqual(blogsAtEnd.length, 1)
  })
})

describe('updating likes', () => {
  test('succeeds if able to update likes', async () => {
    //get blog post
    const originalBlog = await helper.getOneBlog()

    const newBlog = {
      title: originalBlog.title,
      author: originalBlog.author,
      url: originalBlog.url,
      likes: originalBlog.likes + 1
    }

    //update blog likes by 1
    await api.put(`/api/blogs/${originalBlog.id}`)
      .send(newBlog)

    //get blog post again
    const updatedBlog = await helper.getOneBlog()

    assert.strictEqual(originalBlog.likes + 1, updatedBlog.likes)
    assert.notStrictEqual(originalBlog.likes, updatedBlog.likes)
  })
})


after(async () => {
  await mongoose.connection.close()
})