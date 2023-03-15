const db = require(__dirname + '/../mysql')


const statisticsModel = {
    newUsersPerMonths: function (opts) {
        return new Promise(function (resolve, reject) {
            let query = `SELECT MONTH(date) month, COUNT(id) amount FROM Users 
            where date BETWEEN ${db.escape(opts.dateFrom)} AND ${db.escape(opts.dateTo)}
            GROUP BY MONTH(date);`

            db.query(query, function (err, doc) {
                if (err) {
                    console.log(err)
                    return reject({ err: 'Błąd bazy danych.' })
                }

                return resolve(doc)
            })
        })
    },
    usersActivityPerDays: function (opts) {
        return new Promise(function (resolve, reject) {
            let query = `SELECT *  FROM ActivityHistory 
            where date BETWEEN ${db.escape(opts.dateFrom)} AND ${db.escape(opts.dateTo)}
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
    usersType: function (opts) {
        return new Promise(function (resolve, reject) {
            let query = `SELECT COUNT(uh.id) value, uh.type name
            FROM UserHorse uh
            GROUP BY uh.type;

            SELECT COUNT(DISTINCT h.user) value, 'właściciel' name
            FROM Horses h;`

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


module.exports = statisticsModel
