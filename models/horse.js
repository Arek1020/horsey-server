const db = require(__dirname + '/../mysql')

const horseModel = {
    get: function (opts) {
        return new Promise(function (resolve, reject) {
            let query = `SELECT * FROM Horses where id = ${db.escape(opts.id)} AND active = 1`
            if (opts.all)
                query = `SELECT * FROM Horses WHERE active = 1;`
            if (opts.user)
                query = `SELECT h.*, u.name ownerName FROM Horses h
                LEFT JOIN Users u ON u.id = h.user
                WHERE h.user = ${db.escape(opts.user)} AND h.active = 1;`
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
            let query = `INSERT INTO Horses SET ? `
            if (opts.id)
                query = `UPDATE Horses SET ? WHERE id = ${db.escape(opts.id)}`

            if (opts.id) //nie mozna zmienic wlasciciela utworzonego konia!!!
                delete opts.user

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
    getAttachedUsers: function (opts) {
        return new Promise(function (resolve, reject) {
            let query = `SELECT  DISTINCT u.*, u.id userId, uh.id id, u.color personalColor, uh.color color,
                uh.permissions permissions, uh.type type
                FROM Users u
                LEFT JOIN UserHorse uh ON u.id = uh.user AND uh.active = 1
                where horse = ${db.escape(opts.horse)} AND u.active = 1
                ${opts.user ? 'AND user = ' + opts.user : ''}
                `
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

module.exports = horseModel;