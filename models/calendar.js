const db = require(__dirname + '/../mysql')

const calendarModel = {
    get: function (opts) {
        return new Promise(function (resolve, reject) {
            let query = `SELECT c.*, u.active userActive FROM Calendars c
            LEFT JOIN Users u ON u.id = c.elementId AND c.type = 'USER' AND u.active = 1
            where c.user = ${db.escape(opts.user)} AND c.active = 1`

            if(opts.all)
                query = `SELECT c.*, u.active userActive FROM Calendars c
                LEFT JOIN Users u ON u.id = c.elementId AND c.type = 'USER' AND u.active = 1
                where c.active = 1`

            if(opts.all && opts.horse)
                query += ` AND elementId = ${db.escape(opts.horse)}`

            db.query(query, function (err, doc) {
                if (err) {
                    console.log(err)
                    return reject({ err: 'Błąd bazy danych.' })
                }

                doc = doc.filter(x => {
                    if (x.type == 'USER'){
                        if (x.userActive == 1)
                            return true
                        else return false
                    }
                    else
                        return true
                })

                return resolve(doc)
            })
        })
    },
    update: function (opts) {
        return new Promise(function (resolve, reject) {
            let query = `INSERT INTO Calendars SET ? `
            if (opts.id)
                query = `UPDATE Calendars SET ? WHERE id = ${db.escape(opts.id)}`

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
}

module.exports = calendarModel