const db = require(__dirname + '/../mysql')

const riderModel = {
    get: function (opts) {
        return new Promise(function (resolve, reject) {
            let query = `SELECT DISTINCT u.*, u.id userId, uh.id id, u.color personalColor, uh.color color,
            uh.permissions permissions, uh.type type
            FROM Users u
            INNER JOIN UserHorse uh ON  uh.user = u.id AND uh.active
            where uh.horse = ${db.escape(opts.horse)} AND u.active = 1`

            if (opts.id)
                query = `SELECT DISTINCT u.*, u.id userId, uh.id id, u.color personalColor, uh.color color
                FROM Users u
                    LEFT JOIN UserHorse uh ON  uh.user = u.id AND uh.active
                    where uh.id = ${db.escape(opts.id)} AND u.active = 1`

            if (opts.user && opts.horse)
                query = `SELECT DISTINCT u.*, u.id userId, uh.id id, u.color personalColor, uh.color color
                    FROM Users u
                    LEFT JOIN UserHorse uh ON  uh.user = u.id AND uh.active
                    where uh.user = ${db.escape(opts.user)}
                    AND uh.horse = ${db.escape(opts.horse)} AND u.active = 1`


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
            let query = `INSERT INTO Riders SET ? `
            if (opts.id)
                query = `UPDATE Riders SET ? WHERE id = ${db.escape(opts.id)}`
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
    activateAccount: function (data) {
        return new Promise(function (resolve, reject) {
            let query = `UPDATE Users SET emailToken = null WHERE emailToken = ${db.escape(data.token)} AND id = ${db.escape(data.id)}`
            db.query(query, data, function (err, doc) {
                if (err) {
                    console.log(err)
                    return reject({ err: 'Błąd bazy danych.' })
                }
                return resolve(doc)
            })
        })

    }
}

module.exports = riderModel