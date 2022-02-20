const _ = require('lodash')

const dummy = (blogs) => {
	return 1
}

const totalLikes = (blogs) => {
	return blogs.reduce((initial, blog) => {
		return (initial + blog.likes)
	}, 0)
}

const favoriteBlog = (blogs) => {
	const reducer = (initial, blog) => {
		if (initial.likes < blog.likes) {
			initial = blog
		}
		return initial
	}

	return blogs.length === 0
	? null
	: blogs.reduce(reducer, blogs[0])
}

const mostBlogs = (blogs) => {
	if (blogs.length === 0) {
		return null
	}
	const bloggers = _(blogs).countBy('author').toPairs().sortBy(1).reverse().take().value()[0]
	const result = { 'author': bloggers[0], 'blogs': bloggers[1]}

	return result
}

module.exports = {
	dummy,
	totalLikes,
	favoriteBlog,
	mostBlogs
}