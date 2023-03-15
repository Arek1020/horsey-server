const db = require(__dirname + '/../mysql')

const nutritionModel = {
    get: function (opts) {
        return new Promise(function (resolve, reject) {
            let query = `SELECT * FROM Nutrition where horse = ${db.escape(opts.horse)} AND active = 1`

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
            let query = `INSERT INTO Nutrition SET ? `
            if (opts.id)
                query = `UPDATE Nutrition SET ? WHERE id = ${db.escape(opts.id)}`

          
            db.query(query, opts, function (err, doc) {
                if (err) {
                    console.log(err)
                    return reject({ err: 'Błąd bazy danych.' })
                }

                return resolve(doc)
            })
        })
    },
    updateFoodDose: function (opts) {
        return new Promise(function (resolve, reject) {
            let query = `INSERT INTO Nutrition SET ? `
            if (opts.id)
                query = `UPDATE Nutrition SET ? WHERE id = ${db.escape(opts.id)}`

            if (opts.foodDose)
                query = `INSERT INTO FoodDoses SET ? `


            delete opts.foodDose
            db.query(query, opts, function (err, doc) {
                if (err) {
                    console.log(err)
                    return reject({ err: 'Błąd bazy danych.' })
                }

                return resolve(doc)
            })
        })
    },
    getFoodDose: function (opts) {
        return new Promise(function (resolve, reject) {
            let query = `SELECT * FROM FoodDoses WHERE horse = ${db.escape(opts.horse)} AND active = 1 order by id desc limit 1;`


            if (opts.id)
                query = `SELECT * FROM FoodDose where id = ${db.escape(opts.id)} AND active = 1`


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

module.exports = nutritionModel;