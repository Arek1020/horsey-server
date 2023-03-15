const Calendar = require('../models/calendar.js'),
    moment = require('moment'),
    mailer = require('../utils/mailer'),
    // horseController = require('./horse'),
    userController = require('./user')


const calendarController = {
    sync: (opts) => {
        return new Promise((resolve, reject) => {
            calendarController.get(opts).then(async (calendars) => {
                var calendarsList = [];
                var calendarsToRemove = [];
                var allNeededCalendars = []

                var user = await userController.get({ ...opts, id: opts.user })
                var horses = user[0]?.horses
                var riders = user[0]?.attachedUsers.filter(x => x.type == 'jeździec')
                // if (!calendars.find(x => x.elementId == user[0].id))
                //     calendarsList.push({ name: user[0].name, user: user[0].id, elementId: user[0].id, color: user[0].color, visible: true, type: 'USER', active: 1 })

                allNeededCalendars.push({ name: user[0].name, user: user[0].id, elementId: user[0].id, color: user[0].color, visible: true, type: 'USER', active: 1 })

                for (h of horses) {
                    allNeededCalendars.push({ name: h.name, user: user[0].id, elementId: h.id, color: h.color, visible: true, type: 'HORSE', active: 1 })

                    let cal = calendars.find(x => (x.elementId == h.id && x.type == 'HORSE'))
                    if (!cal)
                        calendarsList.push({ name: h.name, user: user[0].id, elementId: h.id, color: h.color, visible: true, type: 'HORSE', active: 1 })
                    else if (cal?.color != h.color)
                        calendarsList.push({ id: cal?.id, name: h.name, user: user[0].id, elementId: h.id, color: h.color, visible: true, type: 'HORSE', active: 1 })
                }

                //dodaje kalendarze dla podpiętych jeźdźców
                // for (r of riders) {
                //     allNeededCalendars.push({ name: r.name, user: user[0].id, elementId: r.userId, color: r.color, visible: true, type: 'RIDER', active: 1 })

                //     let cal = calendars.find(x => (x.elementId == r.userId && x.type == 'RIDER' && x.user == user[0].id))
                //     if (!cal)
                //         calendarsList.push({ name: r.name, user: user[0].id, elementId: r.userId, color: r.color, visible: true, type: 'RIDER', active: 1 })
                //     else if (cal?.color != r.color)
                //         calendarsList.push({ id: cal.id, name: r.name, user: user[0].id, elementId: r.userId, color: r.color, visible: true, type: 'RIDER', active: 1 })
                // }

                //dodawanie własnego kalendarza jeźdźca
                allNeededCalendars.push({ name: user[0].name, user: user[0].id, elementId: user[0].id, color: user[0].color, visible: true, type: 'RIDER', active: 1 })
                let cal = calendars.find(x => (x.elementId == user[0].id && x.type == 'RIDER' && x.user == user[0].id))
                if (!cal)
                    calendarsList.push({ name: user[0].name, user: user[0].id, elementId: user[0].id, color: user[0].color, visible: true, type: 'RIDER', active: 1 })
                else if (cal?.color != user[0].color)
                    calendarsList.push({ id: cal.id, name: user[0].name, user: user[0].id, elementId: user[0].id, color: user[0].color, visible: true, type: 'RIDER', active: 1 })

                for (cal of calendars) {
                    if (!allNeededCalendars.find(x => x.elementId == cal.elementId && x.type == cal.type))
                        calendarsToRemove.push({ id: cal.id, active: 0 })

                }

                if (calendarsList.length > 0)
                    for (cList of calendarsList)
                        await Calendar.update(cList)

                if (calendarsToRemove.length > 0)
                    for (cList of calendarsToRemove)
                        await Calendar.update(cList)

                return resolve(calendars)
            }).catch((err) => {
                console.log(err)
                return reject(err)
            })
        })
    },
    get: (opts) => {
        return new Promise((resolve, reject) => {
            Calendar.get(opts).then(async (calendars) => {

                return resolve(calendars)
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
            // data.active = opts.active
            opts.user ? data.user = opts.user : ''
            opts.name ? data.name = opts.name : ''
            data.visible = opts.visible

            Calendar.update(data).then((user) => {
                return resolve(user)
            }).catch((err) => {
                console.log(err)
                return reject(err)
            })
        })
    }
}

module.exports = calendarController