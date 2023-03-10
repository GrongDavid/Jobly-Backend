'use strict'

const jwt = require('jsonwebtoken')
const { UnauthorizedError } = require('../expressError')
const {
	authenticateJWT,
	ensureLoggedIn,
	checkAdmin,
	ensureUserOrAdmin,
} = require('./auth')

const { SECRET_KEY } = require('../config')
const testJwt = jwt.sign({ username: 'test', isAdmin: false }, SECRET_KEY)
const badJwt = jwt.sign({ username: 'test', isAdmin: false }, 'wrong')

describe('authenticateJWT', function () {
	test('works: via header', function () {
		expect.assertions(2)
		const req = { headers: { authorization: `Bearer ${testJwt}` } }
		const res = { locals: {} }
		const next = function (err) {
			expect(err).toBeFalsy()
		}
		authenticateJWT(req, res, next)
		expect(res.locals).toEqual({
			user: {
				iat: expect.any(Number),
				username: 'test',
				isAdmin: false,
			},
		})
	})

	test('works: no header', function () {
		expect.assertions(2)
		const req = {}
		const res = { locals: {} }
		const next = function (err) {
			expect(err).toBeFalsy()
		}
		authenticateJWT(req, res, next)
		expect(res.locals).toEqual({})
	})

	test('works: invalid token', function () {
		expect.assertions(2)
		const req = { headers: { authorization: `Bearer ${badJwt}` } }
		const res = { locals: {} }
		const next = function (err) {
			expect(err).toBeFalsy()
		}
		authenticateJWT(req, res, next)
		expect(res.locals).toEqual({})
	})
})

describe('ensureLoggedIn', function () {
	test('works', function () {
		expect.assertions(1)
		const req = {}
		const res = { locals: { user: { username: 'test', is_admin: false } } }
		const next = function (err) {
			expect(err).toBeFalsy()
		}
		ensureLoggedIn(req, res, next)
	})

	test('unauth if no login', function () {
		expect.assertions(1)
		const req = {}
		const res = { locals: {} }
		const next = function (err) {
			expect(err instanceof UnauthorizedError).toBeTruthy()
		}
		ensureLoggedIn(req, res, next)
	})
})

describe('checkAdmin', function () {
	test('user is admin, authorized', function () {
		const req = {}
		const res = { locals: { user: { username: 'test', isAdmin: true } } }
		const next = function (err) {
			expect(err).toBeFalsy()
		}
		checkAdmin(req, res, next)
	})

	test('unauth if not admin', function () {
		const req = {}
		const res = { locals: { user: { username: 'test', isAdmin: false } } }
		const next = function (err) {
			expect(err instanceof UnauthorizedError).toBeTruthy()
		}
		checkAdmin(req, res, next)
	})

	test('unauth if not logged in', function () {
		const req = {}
		const res = { locals: {} }
		const next = function (err) {
			expect(err instanceof UnauthorizedError).toBeTruthy()
		}
		checkAdmin(req, res, next)
	})
})

describe('ensureUserOrAdmin', function () {
	test('user is admin, authorized', function () {
		const req = { params: { username: 'test' } }
		const res = { locals: { user: { username: 'adminTest', isAdmin: true } } }
		const next = function (err) {
			expect(err).toBeFalsy()
		}
		ensureUserOrAdmin(req, res, next)
	})

	test('user is correct user but not admin', function () {
		const req = { params: { username: 'test' } }
		const res = { locals: { user: { username: 'test', isAdmin: false } } }
		const next = function (err) {
			expect(err).toBeFalsy()
		}
		ensureUserOrAdmin(req, res, next)
	})

	test('user is neither correct nor admin', function () {
		const req = { params: { username: 'test' } }
		const res = { locals: { user: { username: 'notTest', isAdmin: false } } }
		const next = function (err) {
			expect(err instanceof UnauthorizedError).toBeTruthy()
		}
		ensureUserOrAdmin(req, res, next)
	})
})
