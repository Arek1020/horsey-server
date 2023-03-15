const db = require(__dirname + '/../mysql')

const reportModel = {
    get: function (opts) {
        return new Promise(function (resolve, reject) {
            let query = `SELECT * FROM Users 
            where email = ${db.escape(opts.email)} AND active = 1`
            if (opts.id)
                query = `SELECT * FROM Users 
                    where id = ${db.escape(opts.id)} AND active = 1`
            if (opts.all)
                query = `SELECT * FROM Users WHERE active = 1;`
            if (opts.all && opts.force)
                query = `SELECT * FROM Users;`

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
            let query = `INSERT INTO Reports SET ? `
            if (opts.id)
                query = `UPDATE Reports SET ? WHERE id = ${db.escape(opts.id)}`
            delete opts.id
            db.query(query, opts, function (err, doc) {
                if (err) {
                    console.log(err)
                    return reject({ err: 'Błąd bazy danych.' })
                }
                return resolve(doc)
            })
        })

    },
    get: function (opts) {
        return new Promise(function (resolve, reject) {
            let query = `SELECT * FROM Reports WHERE active = 1; `
           
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

module.exports = reportModel