const User = require('../models/user.js'),
    Activity = require('../models/activity.js'),
    moment = require('moment'),
    horseController = require('./horse'),
    riderController = require('./rider')


const userController = {
    get: (opts) => {
        return new Promise((resolve, reject) => {
            User.get({ email: opts.email, all: opts.all, id: opts.id, admin: opts.admin, push: opts.push }).then(async (user) => {
                for (let u of user) {

                    u.horses = await horseController.get({ user: u.id })
                    u.horses = u.horses || []

                    let attachedHorses = await User.getAttachedHorses({ user: u.id })
                    if (attachedHorses.length)
                        u.horses = u.horses.concat(attachedHorses)

                    u.attachedUsers = []
                    if (u.horses)
                        for (let h of u.horses) {
                            //dodaj jeźdzców jezeli jezeli uztykownik jest wlascicielem konia
                            if (h.user == u.id) {
                                h.attachedUsers = await riderController.get({ horse: h.id })
                                if (h.attachedUsers?.length)
                                    u.attachedUsers = u.attachedUsers.concat(h.attachedUsers)
                            }
                        }
                }
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
            opts.email ? data.email = opts.email : ''
            opts.password ? data.password = opts.password : ''
            opts.name ? data.name = opts.name : ''
            opts.surname ? data.surname = opts.surname : ''
            opts.emailToken ? data.emailToken = opts.emailToken : ''
            opts.logo ? data.logo = opts.logo : ''
            opts.phone ? data.phone = opts.phone : ''
            opts.color ? data.color = opts.color : ''
            opts.pushToken ? data.pushToken = opts.pushToken : ''
            opts.get ? data.get = opts.get : ''
            opts.lastActivity ? data.lastActivity = opts.lastActivity : ''
            if (opts.autoReminder != undefined)
                opts.autoReminder ? data.autoReminder = 1 : data.autoReminder = 0
                
            User.update(data).then((user) => {
                return resolve(user)
            }).catch((err) => {
                console.log(err)
                return reject(err)
            })
        })
    },
    createUser: (opts) => {
        return new Promise((resolve, reject) => {
            let data = {};
            // opts.id ? data.id = opts.id : ''
            if (opts.active != undefined)
                opts.active ? data.active = opts.active : ''
            // opts.password ? data.password = opts.password : ''
            opts.name ? data.name = opts.name : ''
            opts.email ? data.email = opts.email : ''
            opts.phone ? data.phone = opts.phone : ''

            userController.update(data).then(async (user) => {
                user = await userController.get({ email: opts.email })
                return resolve(user)
            }).catch((err) => {
                console.log(err)
                return reject(err)
            })
        })
    },
    attachHorse: (opts) => {
        return new Promise(async (resolve, reject) => {
            let data = {};
            opts.id ? data.id = opts.id : ''
            if (opts.active != undefined)
                data.active = opts.active
            opts.user ? data.user = opts.user : ''
            opts.horse ? data.horse = opts.horse : ''
            opts.type ? data.type = opts.type : ''
            opts.color ? data.color = opts.color : ''
            opts.update ? data.update = opts.update : ''
            opts.permissions ? data.permissions = opts.permissions : ''



            User.attachHorse(data).then((user) => {

                return resolve(user)
            }).catch((err) => {
                console.log(err)
                return reject(err)
            })
        })
    },
    updateActivity: (opts) => {
        return new Promise(async (resolve, reject) => {
            let data = {};
            opts.id ? data.id = opts.id : ''
            if (opts.active != undefined)
                opts.active ? data.active = opts.active : ''
            opts.date ? data.date = opts.date : ''
            opts.type ? data.type = opts.type : ''
            opts.user ? data.user = opts.user : ''

            if (data.type == 'APP_FOREGROUND') {
                let activity = await Activity.get({ user: data.user, limit: 1 })

                if (activity.length) {
                    activity = activity[0]
                    if (moment(activity.date).isSame(data.date, "day"))
                        data.id = activity.id
                }

            }

            Activity.update(data).then((user) => {
                return resolve(user)
            }).catch((err) => {
                console.log(err)
                return reject(err)
            })
        })
    },
}

module.exports = userController