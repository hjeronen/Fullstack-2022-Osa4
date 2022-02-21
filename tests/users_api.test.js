const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')
const User = require('../models/user')

describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

	test('creation fails if username is taken', async () => {
		const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Root Groot',
      password: 'galaxy',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400, {"error":"username must be unique"})

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
	})
})

describe('when the db is empty', () => {

	test('creation fails if password is missing', async () => {
		const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'rogue',
      name: 'Rogue'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400, {"error":"password is missing"})

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
	})

	test('creation fails if password is too short', async () => {
		const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'rogue',
      name: 'Rogue',
			password: 'q'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400, {"error":"password is too short"})

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
	})

	test('creation fails if username is missing', async () => {
		const usersAtStart = await helper.usersInDb()

    const newUser = {
      name: 'Rogue',
			password: 'queen'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400, {"error":"username is missing"})

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
	})

	test('creation fails if username is too short', async () => {
		const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'r',
      name: 'Rogue',
			password: 'queen'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400, {"error":"username is too short"})

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
	})
})