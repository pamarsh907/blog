const Blog = require('../models/blog')
const User = require('../models/user')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
    let likes = 0
    blogs.forEach(blog => likes+=blog.likes)

    return likes
}

const favoriteBlog = (blogs) => {
    return blogs.reduce((max, current) => current.likes > max.likes ? current : max)
}

const initialBlogs = [
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'blog 1',
    author: 'Edsger W. Dijkstra',
    url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
    likes: 5,
    __v: 0
  },
  {
    _id: '6a4dc518bd2308d36ae157e6',
    title: 'blog 2',
    author: 'Edsger W. Dijkstra',
    url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
    likes: 3,
    __v: 0
  },
  {
    _id: '7b5ed608bd2308d36ae157e6',
    title: 'blog 3',
    author: 'Edsger W. Dijkstra',
    url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
    likes: 8,
    __v: 0
  }
]

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const getOneBlog = async () => {
  const blog = await Blog.findOne({title: 'blog 1'})
  return blog.toJSON()
}

const blogsInDbLean = async () => {
  const blogs = await Blog.find({}).lean()
  return blogs
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  initialBlogs,
  blogsInDb,
  blogsInDbLean,
  getOneBlog,
  usersInDb
}