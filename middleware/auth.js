'use strict'

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require('jsonwebtoken')
const { SECRET_KEY } = require('../config')
const { UnauthorizedError } = require('../expressError')

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
	debugger
	try {
		const authHeader = req.headers && req.headers.authorization
		if (authHeader) {
			const token = authHeader.replace(/^[Bb]earer /, '').trim()
			res.locals.user = jwt.verify(token, SECRET_KEY)
		}
		return next()
	} catch (err) {
		return next()
	}
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
	try {
		if (!res.locals.user) throw new UnauthorizedError()
		return next()
	} catch (err) {
		return next(err)
	}
}

function checkAdmin(req, res, next) {
	try {
		if (!res.locals.user || !res.locals.user.isAdmin) {
			throw new UnauthorizedError(
				'You must be logged in and an admin to access this'
			)
		}
		return next()
	} catch (error) {
		return next(error)
	}
}

function ensureUserOrAdmin(req, res, next) {
	try {
		const user = res.locals.user
		if (user.username === req.params.username || user.isAdmin) {
			return next()
		}
		throw new UnauthorizedError(
			'You must be the correct user or admin to access'
		)
	} catch (error) {
		return next(error)
	}
}

module.exports = {
	authenticateJWT,
	ensureLoggedIn,
	checkAdmin,
	ensureUserOrAdmin,
}
