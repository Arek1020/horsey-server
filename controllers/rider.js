const Rider = require('../models/rider.js'),
    moment = require('moment'),
    mailer = require('../utils/mailer'),
    horseController = require('./horse'),
    userController = require('./user')


const riderController = {
    get: (opts) => {
        return new Promise((resolve, reject) => {
            Rider.get(opts).then(async (rider) => {
               
                return resolve(rider)
            }).catch((err) => {
                console.log(err)
                return reject(err)
            })
        })
    },
    update: (opts) => {
        return new Promise((resolve, reject) => {
            let data = {};
            opts.id ? data.id = opts.id : ''
            if(opts.active != undefined)
                opts.active ? data.active = opts.active : ''
            opts.type ? data.type = opts.type : ''
            opts.message ? data.message = opts.message : ''
            opts.user ? data.user = opts.user : ''
           
            Rider.update(data).then((user) => {
                return resolve(user)
            }).catch((err) => {
                console.log(err)
                return reject(err)
            })
        })
    }
}

module.exports = riderController