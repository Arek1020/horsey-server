const db = require(__dirname + '/../mysql')

const userModel = {
    get: function (opts) {
        return new Promise(function (resolve, reject) {
            let query = `SELECT * FROM Users 
            where email = ${db.escape(opts.email)} AND active = 1`
            if (opts.id)
                query = `SELECT * FROM Users 
                    where id = ${db.escape(opts.id)} AND active = 1`
            if (opts.all)
                query = `SELECT * FROM Users WHERE active = 1
                ${opts.push ? ' AND pushToken IS NOT NULL AND autoReminder = 1' : ''}
                `
            if (opts.all && opts.force)
                query = `SELECT * FROM Users;`

            if (opts.admin)
                query = `SELECT * FROM Users 
                where admin = 1 AND active = 1`

            if (opts.horse)
                query = `SELECT u.* FROM Users u
                INNER JOIN Horses h ON h.user = u.id AND h.active
                where u.active = 1 AND h.id = ${opts.horse}`

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
            let query = `INSERT INTO Users SET ?; `
            if (opts.id)
                query = `UPDATE Users SET ? WHERE id = ${db.escape(opts.id)};`

            if (opts.get)
                query += `SELECT * FROM Users WHERE id = ${db.escape(opts.id)}`

            delete opts.id
            delete opts.get

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

    },
    attachHorse: function (opts) {
        return new Promise(async function (resolve, reject) {

            let query = `INSERT INTO UserHorse SET ?`
            if (opts.update) {
                if (opts.color != undefined)
                    query = `UPDATE UserHorse uh SET color=${db.escape(opts.color)} 
                    WHERE uh.user=${db.escape(opts.user)} AND uh.horse=${db.escape(opts.horse)}`
                if (opts.active != undefined)
                    query = `UPDATE UserHorse uh SET active=${db.escape(opts.active)} 
                    WHERE uh.user=${db.escape(opts.user)} AND uh.horse=${db.escape(opts.horse)}`
                if (opts.permissions != undefined)
                    query = `UPDATE UserHorse uh SET permissions=${db.escape(opts.permissions)} 
                    WHERE uh.user=${db.escape(opts.user)} AND uh.horse=${db.escape(opts.horse)}`
            }
            db.query(query, opts, function (err, doc) {
                if (err) {
                    console.log(err)
                    return reject({ err: 'Błąd bazy danych.' })
                }
                return resolve(doc)
            })
        })

    },
    getAttachedHorses: function (opts) {
        return new Promise(function (resolve, reject) {
            let query = `SELECT h.*, uh.permissions permissions, u.name ownerName FROM UserHorse uh
            INNER JOIN Horses h ON h.id = uh.horse AND h.active
            LEFT JOIN Users u ON u.id = h.user AND u.active
            where uh.user = ${db.escape(opts.user)} AND uh.active = 1`


            db.query(query, function (err, doc) {
                if (err) {
                    console.log(err)
                    return reject({ err: 'Błąd bazy danych.' })
                }

                return resolve(doc)
            })
        })
    },
}

module.exports = userModel