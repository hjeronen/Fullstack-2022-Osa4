const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

const initialBlogs = [
	{
		_id: "5a422a851b54a676234d17f7",
		title: "React patterns",
		author: "Michael Chan",
		url: "https://reactpatterns.com/",
		likes: 7,
		__v: 0
	},
	{
		_id: "5a422aa71b54a676234d17f8",
		title: "Go To Statement Considered Harmful",
		author: "Edsger W. Dijkstra",
		url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
		likes: 5,
		__v: 0
	},
	{
		_id: "5a422b3a1b54a676234d17f9",
		title: "Canonical string reduction",
		author: "Edsger W. Dijkstra",
		url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
		likes: 12,
		__v: 0
	},
	{
		_id: "5a422b891b54a676234d17fa",
		title: "First class tests",
		author: "Robert C. Martin",
		url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
		likes: 10,
		__v: 0
	}
]

beforeEach(async () => {
	await Blog.deleteMany({})
	let blogObject = new Blog(initialBlogs[0])
	await blogObject.save()
	blogObject = new Blog(initialBlogs[1])
	await blogObject.save()
	blogObject = new Blog(initialBlogs[2])
	await blogObject.save()
	blogObject = new Blog(initialBlogs[3])
	await blogObject.save()
})

test('blogs are returned as json', async () => {
	await api
		.get('/api/blogs')
		.expect(200)
		.expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
	const response = await api.get('/api/blogs')

	expect(response.body).toHaveLength(initialBlogs.length)
})

test('blog id field is named id', async () => {
	const blogId = initialBlogs[0]._id
	const response = await api.get('/api/blogs/' + blogId)

	expect(response.body["id"]).toBeDefined()
})


test('new blog is added', async () => {
	const newBlog = {
		title: 'Go To Statement Considered Harmful',
		author: 'Edsger W. Dijkstra',
		url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
		likes: 5
	}

	await api
		.post('/api/blogs')
		.send(newBlog)
		.expect(201)
		.expect('Content-Type', /application\/json/)

	const response = await api.get('/api/blogs')

	const titles = response.body.map(r => r.title)

	expect(response.body).toHaveLength(initialBlogs.length + 1)
	expect(titles).toContain(
    'Go To Statement Considered Harmful'
  )
})

test('if likes is not defined it is set to zero', async () => {
	const newBlog = {
		title: 'Go To Statement Considered Harmful',
		author: 'Edsger W. Dijkstra',
		url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html'
	}

	await api
		.post('/api/blogs')
		.send(newBlog)
		.expect(201)
		.expect('Content-Type', /application\/json/)

	const response = await api.get('/api/blogs')

	const blog = response.body[initialBlogs.length]

	expect(blog.likes).toBe(0)
})

test('if title is not defined return statuscode 400', async () => {
	const newBlog = {
		author: 'Edsger W. Dijkstra',
		url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
		likes: 5
	}

	await api
		.post('/api/blogs')
		.send(newBlog)
		.expect(400)
})

test('if url is not defined return statuscode 400', async () => {
	const newBlog = {
		title: 'Go To Statement Considered Harmful',
		author: 'Edsger W. Dijkstra'
	}

	await api
		.post('/api/blogs')
		.send(newBlog)
		.expect(400)
})

afterAll(() => {
	mongoose.connection.close()
})