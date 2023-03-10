const { BadRequestError } = require('../expressError')

/*  Takes object data and converts it to sanitized SQL.
    Helper to make updates selectively

    Takes data to update and javascript to be updated to SQL naming as params

    If object has no keys, meaning data is empty, throws an error.

    Returns object with key and value converted to SQL.
    Returns {setCols, values}

    Used to update a model with partial information
*/
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
	const keys = Object.keys(dataToUpdate)
	if (keys.length === 0) throw new BadRequestError('No data')

	// {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
	const cols = keys.map(
		(colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
	)

	return {
		setCols: cols.join(', '),
		values: Object.values(dataToUpdate),
	}
}

module.exports = { sqlForPartialUpdate }
