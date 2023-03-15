const Nutrition = require('../models/nutrition'),
    moment = require('moment')

const nutritionController = {
    update: (opts, callback) => {
        return new Promise(async (resolve, reject) => {
            let dbNutrition = await nutritionController.get({ horse: opts.horse })
            if (!opts?.id && dbNutrition.length > 0)
                opts.id = dbNutrition[0].id

            let data = {};
            opts.id ? data.id = opts.id : ''
            if (opts.active != undefined)
                data.active = opts.active
            opts.horse ? data.horse = opts.horse : ''
            opts.basics ? data.basics = opts.basics : ''
            opts.fodder ? data.fodder = opts.fodder : ''
            opts.otherInfo ? data.otherInfo = opts.otherInfo : ''
            opts.otherInfo2 ? data.otherInfo2 = opts.otherInfo2 : ''

            if (opts.foodDose) { // jezeli jest to edycja dawki pokarmowej to zapisuje do tabeli z całą historia
                nutritionController.updateFoodDose(opts).then((result) => {
                    return resolve({ id: opts.id || result.insertId, })
                }).catch((err) => {
                    console.log(err)
                    return reject({ err: true, message: 'Błąd zapisu' })
                })
                return
            }

            Nutrition.update(data).then((result) => {
                return resolve({ id: opts.id || result.insertId, })
            }).catch((err) => {
                console.log(err)
                return reject({ err: true, message: 'Błąd zapisu' })
            })
        })
    },
    updateFoodDose: (opts, callback) => {
        return new Promise(async (resolve, reject) => {
            var dbFoodDose = await Nutrition.getFoodDose({ horse: opts.horse })
            dbFoodDose = JSON.parse(dbFoodDose[0]?.data || '[]')

            var newFoodDose = JSON.parse(opts.foodDose)

            let update = false;
            // for (var meal of newFoodDose) {
            //     for(var i = 0; i < meal.list.length; i++)
            //         if (meal.list[i] != dbFoodDose.list[i])
            //             update = true;
            // }
            if (JSON.stringify(newFoodDose) != JSON.stringify(dbFoodDose))
                update = true

            if (update) {
                let data = {
                    user: opts.user,
                    horse: opts.horse,
                    date: moment().format('YYYY-MM-DD HH:mm'),
                    data: opts.foodDose,
                    foodDose: true
                }
                Nutrition.updateFoodDose(data).then((result) => {
                    return resolve({ id: opts.id || result.insertId, })
                }).catch((err) => {
                    console.log(err)
                    return reject({ err: true, message: 'Błąd zapisu' })
                })
            }


        })
    },
    get: (opts) => {
        return new Promise((resolve, reject) => {
            Nutrition.get({ horse: opts.horse }).then(async (nutrition) => {
                // let foodDose = Nutrition.getFoodDose({horse: opts.horse})
                for (let n of nutrition) {
                    let foodDose = await Nutrition.getFoodDose({ horse: n.horse })
                    n.foodDose = foodDose;
                }
                return resolve(nutrition)
            }).catch((err) => {
                console.log(err)
                return reject(err)
            })
        })
    },

}

module.exports = nutritionController;