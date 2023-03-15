const Horse = require('../models/horse'),
    moment = require('moment')

const horseController = {
    update: (opts, callback) => {
        return new Promise((resolve, reject) => {
            let data = {};
            opts.id ? data.id = opts.id : ''
            if (opts.active != undefined)
                data.active = opts.active
            opts.user ? data.user = opts.user : ''
            opts.gender ? data.gender = opts.gender : ''
            opts.height ? data.height = opts.height : ''
            opts.name ? data.name = opts.name : ''
            opts.pregnant ? data.pregnant = opts.pregnant : ''
            opts.race ? data.race = opts.race : ''
            opts.stable ? data.stable = opts.stable : ''
            opts.weight ? data.weight = opts.weight : ''
            opts.work ? data.work = opts.work : ''
            opts.workType ? data.workType = opts.workType : ''
            opts.year ? data.year = moment(opts.year).format('YYYY-MM-DD') : ''
            opts.color ? data.color = opts.color : ''
            opts.primaryImage ? data.primaryImage = opts.primaryImage : ''
            opts.secondImage ? data.secondImage = opts.secondImage : ''
            opts.thirdImage ? data.thirdImage = opts.thirdImage : ''


            Horse.update(data).then((result) => {
                return resolve({ id: opts.id || result.insertId, })
            }).catch((err) => {
                console.log(err)
                return reject({ err: true, message: 'Błąd zapisu' })
            })
        })
    },
    get: (opts) => {
        return new Promise((resolve, reject) => {
            Horse.get({ id: opts.id, all: opts.all, user: opts.user }).then(async (horses) => {
                // for (h of horses) {
                //     h.dates = await eventController.getDatesForSpecificEvents({ horse: h.id })
                // }
                return resolve(horses)
            }).catch((err) => {
                console.log(err)
                return reject(err)
            })
        })
    },
    getAttachedUsers: (opts) => {
        return new Promise((resolve, reject) => {
            Horse.getAttachedUsers({ id: opts.id, all: opts.all, user: opts.user, horse: opts.horse }).then((horses) => {
                return resolve(horses)
            }).catch((err) => {
                console.log(err)
                return reject(err)
            })
        })
    },
   
}

module.exports = horseController;