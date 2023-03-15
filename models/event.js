const db = require(__dirname + '/../mysql')

const eventModel = {
    get: function (opts) {
        return new Promise(function (resolve, reject) {
            let query = `SELECT * FROM Events 
            where active = 1`

            if (opts.user)
                query = `SELECT * FROM Events 
                where user = ${db.escape(opts.user)}  AND active = 1
                ${opts?.eventType ? 'AND eventType = ' + db.escape(opts.eventType) : ''}`

            if (opts.dateFrom && opts.dateTo && opts.elementId && opts.type == 'HORSE')
                query = `SELECT * FROM Events 
                where horse = ${db.escape(opts.elementId)} 
                AND eventType != 'Wydarzenie (jeździec)' 
                AND date BETWEEN ${db.escape(opts.dateFrom)} AND ${db.escape(opts.dateTo)}
                AND (cycle IS NULL OR cycle = 0)
                AND active = 1
                ${opts?.eventType ? 'AND eventType = ' + db.escape(opts.eventType) : ''}`

            if (opts.dateFrom && opts.dateTo && opts.type == 'RIDER')
                query = `SELECT * FROM Events 
                where attachedUser = ${db.escape(opts.elementId)}
                AND eventType = 'Wydarzenie (jeździec)'
                AND date BETWEEN ${db.escape(opts.dateFrom)} AND ${db.escape(opts.dateTo)}
                AND (cycle IS NULL OR cycle = 0)
                AND active = 1
                ${opts?.eventType ? 'AND eventType = ' + db.escape(opts.eventType) : ''}`

            if (opts.dateFrom && opts.dateTo && !opts.user)
                query = `SELECT * FROM Events 
                where horse = ${db.escape(opts.elementId)} 
                AND date BETWEEN ${db.escape(opts.dateFrom)} AND ${db.escape(opts.dateTo)}
                AND (cycle IS NULL OR cycle = 0)
                AND active = 1
                ${opts?.eventType ? 'AND eventType = ' + db.escape(opts.eventType) : ''}`

            // if (opts.cycle) {
            //     query = `SELECT * FROM Events 
            //     where horse = ${db.escape(opts.horse)} 
            //     AND date < ${db.escape(moment(opts.dateFrom).endOf('month').format('YYYY-MM-DD'))} 
            //     AND cycleEnd > ${db.escape(moment(opts.dateTo).startOf('month').format('YYYY-MM-DD'))}
            //     AND cycle = 1  
            //     AND active = 1`
            // }
            if (opts.cycle) {
                query = `SELECT * FROM Events 
                where horse = ${db.escape(opts.horse)} 
                AND eventType != 'Wydarzenie (jeździec)'
                AND DATE(date) <= ${db.escape(moment(opts.dateTo).format('YYYY-MM-DD'))} 
                AND DATE(cycleEnd) >= ${db.escape(moment(opts.dateFrom).format('YYYY-MM-DD'))} 
                AND cycle = 1  
                AND active = 1
                ${opts?.eventType ? 'AND eventType = ' + db.escape(opts.eventType) : ''}`
            }
            if (opts.cycle && opts.type == 'RIDER') {
                query = `SELECT * FROM Events 
                where attachedUser = ${db.escape(opts.elementId)}
                AND eventType = 'Wydarzenie (jeździec)'
                AND DATE(date) <= ${db.escape(moment(opts.dateTo).format('YYYY-MM-DD'))} 
                AND DATE(cycleEnd) >= ${db.escape(moment(opts.dateFrom).format('YYYY-MM-DD'))} 
                AND cycle = 1  
                AND active = 1
                ${opts?.eventType ? 'AND eventType = ' + db.escape(opts.eventType) : ''}`
            }

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
            let query = `INSERT INTO Events SET ? `
            if (opts.id)
                query = `UPDATE Events SET ? WHERE id = ${db.escape(opts.id)}`
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
    getForTomorrow: function (opts) {
        return new Promise(function (resolve, reject) {
            let query = `
            SELECT * FROM Events e WHERE  
            DATE(e.date) = ${db.escape(opts.dateFrom)}
            AND e.active = 1 AND e.cycle = 0 
            AND (e.user=${db.escape(opts.user)} OR e.attachedUser=${db.escape(opts.user)});

            SELECT * FROM Events ee WHERE
            ${db.escape(opts.dateFrom)} BETWEEN DATE(ee.date) AND DATE(ee.cycleEnd)
            AND ee.active=1 AND ee.cycle=1
            AND (ee.user=${db.escape(opts.user)} OR ee.attachedUser=${db.escape(opts.user)});
          `

            db.query(query, opts, function (err, doc) {
                if (err) {
                    console.log(err)
                    return reject({ err: 'Błąd bazy danych.' })
                }

                let events = doc[0]

                for (cycle of doc[1]) {
                    let currentDate = moment(cycle.date)
                    //dodaj pierwsze wywołanie cyklu
                    if (currentDate.isBefore(cycle.cycleEnd) && moment(currentDate).isAfter(moment(opts.dateFrom)) && moment(currentDate).isBefore(moment(opts.dateTo)))
                        events.push({
                            ...cycle,
                            date: currentDate.format('YYYY-MM-DD')
                        })

                    do {
                        if (cycle.interval == 'dzień')
                            currentDate = moment(currentDate).add(cycle.intervalValue, 'day')
                        if (cycle.interval == 'miesiąc')
                            currentDate = moment(currentDate).add(cycle.intervalValue, 'month')
                        if (cycle.interval == 'rok')
                            currentDate = moment(currentDate).add(cycle.intervalValue, 'year')

                        if (currentDate.isBefore(cycle.cycleEnd) && moment(currentDate).isAfter(opts.dateFrom) && moment(currentDate).isBefore(opts.dateTo))
                            events.push({
                                ...cycle,
                                date: currentDate.format('YYYY-MM-DD')
                            })
                    } while (moment(currentDate).isBefore(opts.dateTo))
                }
                return resolve(events)

            })
        })

    },
}

module.exports = eventModel