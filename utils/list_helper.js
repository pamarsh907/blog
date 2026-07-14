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

// const hashedPassword = await bcrypt.hash('password', 10);

// const initialUsers = [
//   {
//     username: 'bobby',
//     name: 'bob',
//     password: hashedPassword,
//     blogs: []
//   },
//   {
//     username: 'jimbo',
//     name: 'jim',
//     password: hashedPassword,
//     blogs: []
//   },
//   {
//     username: 'pete',
//     name: 'peter',
//     password: hashedPassword,
//     blogs: []
//   },
// ]


const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const getOneBlog = async () => {
  const blog = await Blog.findOne({title: 'First blog'})
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

const tokenExtractor = (request) => {
  const authorization = request.get('Authorization')
  console.log('Authorization :', authorization)
  if (authorization && authorization.startsWith('Bearer ')) {
    console.debug('inside extractor if: ', authorization)
    const token = authorization.replace('Bearer ', '')
    console.log('token :', token)
    return token
  } else {
    console.debug('false branch of if')
    return null
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  initialBlogs,
  blogsInDb,
  blogsInDbLean,
  getOneBlog,
  usersInDb,
  tokenExtractor
}