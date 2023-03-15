const db = require(__dirname + '/../mysql')

const activityModel = {
    get: function (opts) {
        return new Promise(function (resolve, reject) {
            let query = `SELECT * FROM ActivityHistory `
            if (opts.user) {
                query = `SELECT * FROM ActivityHistory WHERE user=${db.escape(opts.user)}`

            }
            if (opts.limit)
                query += ` ORDER BY date DESC LIMIT ${opts.limit}`

            // if (opts.type == 'APP_FOREGROUND')
            //     query = `UPDATE ActivityHistory SET date = ${db.escape(opts.date)}
            //      WHERE id = ${db.escape(opts.id)};`

            db.query(query, function (err, doc) {
                if (err) {
                    console.log(err)
                    return reject({ err: 'Błąd bazy danych.' })
                }

                return resolve(doc)
            })
        })
    },
    update: function (opts) {
        return new Promise(function (resolve, reject) {
            let query = `INSERT INTO ActivityHistory SET ?; `
            if (opts.id)
                query = `UPDATE ActivityHistory SET ? WHERE id = ${db.escape(opts.id)};`

            db.query(query, opts, function (err, doc) {
                if (err) {
                    console.log(err)
                    return reject({ err: 'Błąd bazy danych.' })
                }

                return resolve(doc)
            })
        })
    },
}
module.exports = activityModel;