const Raport = require('../models/report.js'),
    moment = require('moment'),
    mailer = require('../utils/mailer'),
    horseController = require('./horse'),
    userController = require('./user')


const raportController = {
    get: (opts) => {
        return new Promise((resolve, reject) => {
            Raport.get({ email: opts.email, all: opts.all }).then(async (user) => {
                for (u of user)
                    u.horses = await horseController.get({ user: u.id })
                return resolve(user)
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
            if (opts.active != undefined)
                opts.active ? data.active = opts.active : ''
            opts.type ? data.type = opts.type : ''
            opts.message ? data.message = opts.message : ''
            opts.user ? data.user = opts.user : ''
            opts.read ? data.read = opts.read : ''
            opts.horse ? data.horse = opts.horse : ''

            Raport.update(data).then(async (user) => {
                // jezeli było to nowo utworzone zgłoszenie to wyślij powiadomienie do administratorów
                if (!opts.update) {
                    const admins = await userController.get({ admin: true })
                    for (admin of admins) {
                        mailer.new_report(admin, opts.userName, data)
                    }
                }
                return resolve(user)
            }).catch((err) => {
                console.log(err)
                return reject(err)
            })
        })
    },
    get: (opts) => {
        return new Promise((resolve, reject) => {
            Raport.get(opts).then(async (reports) => {
                for (var r of reports) {
                    r.user = await userController.get({ id: r.user })
                    if (r.user.length > 0)
                        r.user = r.user[0]
                }
                return resolve(reports)
            }).catch((err) => {
                console.log(err)
                return reject(err)
            })
        })
    }
}

module.exports = raportController