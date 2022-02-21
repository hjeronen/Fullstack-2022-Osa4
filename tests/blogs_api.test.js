const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

beforeEach(async () => {
	await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs
    .map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

describe('when getting all blogs', () => {
	test('blogs are returned as json', async () => {
		await api
			.get('/api/blogs')
			.expect(200)
			.expect('Content-Type', /application\/json/)
	})
	
	test('all blogs are returned', async () => {
		const response = await api.get('/api/blogs')
	
		expect(response.body).toHaveLength(helper.initialBlogs.length)
	})
})

describe('when getting one blog', () => {
	test('blog id field is named id', async () => {
		const blogId = helper.initialBlogs[0]._id
		const response = await api.get('/api/blogs/' + blogId)
	
		expect(response.body["id"]).toBeDefined()
	})
})


describe('when adding new blog', () => {
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
	
		const blogs = await helper.blogsInDb()
		expect(blogs).toHaveLength(helper.initialBlogs.length + 1)
	
		const titles = blogs.map(r => r.title)
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
	
		const blogs = await helper.blogsInDb()
	
		const blog = blogs[blogs.length - 1]
	
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
})

describe('when deleting a blog', () => {

	test('if successful statuscode 204 is returned', async () => {
		const id = helper.initialBlogs[0]['_id']

		await api
			.delete('/api/blogs/' + id)
			.expect(204)
	})

	test('if successful list length is reduced by one', async () => {
		const id = helper.initialBlogs[0]['_id']
		const initialLength = helper.initialBlogs.length

		await api
			.delete('/api/blogs/' + id)
			.expect(204)
		
		const blogs = await helper.blogsInDb()
		
		expect(blogs.length).toBe(initialLength - 1)
	})

	test('the deleted blog is not in the database anymore', async () => {
		const id = helper.initialBlogs[0]['_id']
		const title = helper.initialBlogs[0]['title']

		await api
			.delete('/api/blogs/' + id)
			.expect(204)
		
		const blogs = await helper.blogsInDb()
		const titles = blogs.map(r => r.title)

		expect(titles).not.toContain(title)
	})
})

describe('when updating blog', () => {
	test('the information is updated', async () => {
		const id = helper.initialBlogs[0]['_id']
		const newInfo = {
			title: "Type wars",
			author: "Robert C. Martin",
			url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
			likes: 2
		}

		await api
			.put('/api/blogs/' + id)
			.send(newInfo)
			.expect(200)
			.expect('Content-Type', /application\/json/)

		const blogs = await helper.blogsInDb()
		const updatedBlog = blogs.filter(blog => blog.id === id)[0]

		expect(updatedBlog.id).toBe(id)
		expect(updatedBlog.title).toBe(newInfo.title)
		expect(updatedBlog.author).toBe(newInfo.author)
		expect(updatedBlog.url).toBe(newInfo.url)
		expect(updatedBlog.likes).toBe(newInfo.likes)
	})
})


afterAll(() => {
	mongoose.connection.close()
})