const Event = require('../models/event.js'),
    moment = require('moment'),
    horseController = require('./horse'),
    riderController = require('./rider'),
    calendarController = require('./calendar'),
    User = require('../models/user.js'),
    notification = require('../utils/notification')


const eventController = {

    get: (opts) => {
        return new Promise(async (resolve, reject) => {
            let calendarsEvents = [];

            //pobiera kalendarze uzytkownika
            let calendars = await calendarController.get({
                user: opts.user,
                all: opts.all,
                horse: opts.horse
            })

            for (calendar of calendars) {

                if (calendar.visible != 1 && !opts.reminder)
                    continue

                calendar.dateFrom = opts.dateFrom
                calendar.dateTo = opts.dateTo

                //wyciąga wydarzenia dla danego kalendarza
                var events = await Event.get({
                    ...calendar,
                    eventType: opts.eventType
                })

                //wyciąga wydarzenia cykliczne dla danego kaledarza
                let eventsFromCycles = await eventController.getEventsFromCycle({
                    ...calendar,
                    horse: calendar.elementId,
                    cycle: 1,
                    eventType: opts.eventType
                })

                //łączy wszystkie wydarzenia
                events = events.concat(eventsFromCycles)

                if (!opts.eventsOnly) //mozliwość pominięcia ładowania danych użytkownika i konia 
                    for (e of events) {
                        if (e.horse) {
                            let horse = await horseController.get({ id: e.horse })
                            e.horse = horse[0]
                        }

                        if (e.attachedUser)
                            e.attachedUser = await eventController.getAttachedUser(e)
                    }

                if (!opts.all) {
                    //
                    var attachedUser = await horseController.getAttachedUsers({
                        user: calendar?.user,
                        horse: calendar?.elementId
                    })

                    if (attachedUser.length > 0 && attachedUser[0].permissions) {

                        events = await eventController.filterPermissions({
                            user: opts.user,
                            events,
                            horse: calendar.horse,
                            attachedUser: attachedUser[0]
                        })
                    }
                }

                // laczy date z godzina startu wydarzenia
                for (let e of events) {
                    e.date = moment(moment(e.date).format('YYYY-MM-DD') + ' ' + moment(e.start).format('HH:mm'))
                }

                calendarsEvents = calendarsEvents.concat(events)

            }

            //sortuje wzgledem daty rosnaco
            calendarEvents = calendarsEvents.sort((a, b) => { if (moment(a.date).isAfter(b.date)) return 1; else return -1; })
            return resolve(calendarsEvents)

        })
    },
    update: (opts) => {
        return new Promise((resolve, reject) => {
            let data = {};
            opts.id ? data.id = opts.id : ''
            data.active = opts.active
            opts.user ? data.user = opts.user : ''
            opts.eventType ? data.eventType = opts.eventType : ''
            opts.description ? data.description = opts.description : ''
            opts.additionalDescription ? data.additionalDescription = opts.additionalDescription : ''
            opts.horse ? data.horse = opts.horse : ''
            opts.attachedUser ? data.attachedUser = opts.attachedUser : ''
            opts.date ? data.date = moment(moment(opts.date).format('YYYY-MM-DD') + ' ' + moment(opts.start).format('HH:mm')).format('YYYY-MM-DD HH:mm') : ''
            opts.start ? data.start = moment(opts.start).format('YYYY-MM-DD HH:mm') : ''
            opts.end ? data.end = moment(opts.end).format('YYYY-MM-DD HH:mm') : ''
            if (opts.cycle != undefined)
                opts.cycle ? data.cycle = 1 : data.cycle = 0
            if (opts.cycle) {
                opts.cycleEnd ? data.cycleEnd = moment(opts.cycleEnd).format('YYYY-MM-DD') : ''
                opts.interval ? data.interval = opts.interval : ''
                opts.intervalValue ? data.intervalValue = opts.intervalValue : ''
            }

            Event.update(data).then((user) => {
                return resolve(user)
            }).catch((err) => {
                console.log(err)
                return reject(err)
            })
        })
    },
    getAttachedUser: async (e) => {
        let attachedUser;
        if (e.attachedUser?.id == e.horse.user || e.attachedUser == e.horse.user) //jeżeli podpięty użytkownik jest właścicielem
            attachedUser = await User.get({
                user: e.attachedUser?.id || e.attachedUser,
                horse: e.horse?.id || e.horse
            })
        else
            attachedUser = await riderController.get({
                user: e.attachedUser?.id || e.attachedUser,
                horse: e.horse?.id || e.horse
            })
        attachedUser = attachedUser.length ? attachedUser[0] : attachedUser
        return attachedUser;
    },
    filter: (opts) => {
        return new Promise(async (resolve, reject) => {
            let calendars = await calendarController.get({ user: opts.user })
            let calendarsEvents = [];
            for (e of opts.events) {
                if (e.horse) {
                    let calendar = calendars.find(x => { if (x.type == 'HORSE' && x.elementId == e.horse?.id) return true; else return false; })
                    if (calendar.visible == 1)
                        calendarsEvents.push(e)
                }
                else {
                    let calendar = calendars.find(x => { if (x.type == 'USER' && x.elementId == e.user) return true; else return false; })
                    if (calendar.visible == 1)
                        calendarsEvents.push(e)
                }
            }
            return resolve(calendarsEvents)
        })
    },
    filterPermissions: async (opts) => {
        var permissions = JSON.parse(opts.attachedUser.permissions) || null

        permissions = {
            horse: permissions.find(x => x.value == 'terminarz koń'),
            rider: permissions.find(x => x.value == 'terminarz jeździec'),
            training: permissions.find(x => x.value == 'terminarz treningi'),
        }

        if (!permissions.horse)
            opts.events = opts.events.filter(x => x.eventType != 'Wydarzenie (koń)')

        if (!permissions.rider)
            opts.events = opts.events.filter(x => x.eventType != 'Wydarzenie (jeździec)')

        if (!permissions.training)
            opts.events = opts.events.filter(x => x.eventType != 'Treningi')

        if (permissions.rider) //w terminarzu jezdzca pokazuje tylko wydarzenia zwiazane z konkretnym jezdzcem
            for (let e of opts.events) {
                if (e.eventType == 'Wydarzenie (jeździec)' && e.attachedUser?.id != opts.attachedUser?.id)
                    opts.events = opts.events.filter(x => x?.id != e?.id)
            }
        // opts.events = opts.events.filter(x => x.eventType == 'Wydarzenie (jeździec)' )

        return opts.events;
    },
    getEventsFromCycle: (opts) => {
        return new Promise((resolve, reject) => {
            var events = []

            Event.get(opts).then(async (cycles) => {
                for (cycle of cycles) {
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
            }).catch((err) => { console.log(err) })

        })

    },
    getDatesForSpecificEvents: async (opts) => {
        const specificEvents = [
            { name: "Odrobaczanie", date: '' },
            { name: "Wizyta kowala", date: '' },
            { name: "Zęby", date: '' },
            { name: "Szczepienie na grypę", date: '' },
            { name: "Szczepienia inne", date: '' },
            { name: "Wizyty weterynarza", date: '' },
            { name: "Wizyta fizjoterapeuty", date: '' }
        ]

        var allEvents = await eventController.get({
            ...opts,
            dateFrom: moment().subtract(1, 'days').format('YYYY-MM-DD'),
            dateTo: moment().add(1, 'year').format('YYYY-MM-DD'),
            eventsOnly: true,
            all: true,
            // horse
        })

        for (se of specificEvents) {
            let filteredEvents = allEvents.filter(x => x.description == se.name)
            if (filteredEvents.length > 0) {
                filteredEvents = filteredEvents.sort((a, b) => { if (moment(a.date).isAfter(b.date)) return 1; else return -1 })
                se.date = filteredEvents[0].date ? moment(filteredEvents[0].date).format('YYYY.MM.DD') : ''
            }
        }
        return specificEvents;
    },
    getDatesForSpecificEventsForRider: async (opts) => {
        const specificEvents = [
            { name: "Badania lekarskie", date: '' },
            { name: "Ubezpieczenie", date: '' },
            { name: "Składka członkowska przynależności klubowej", date: '' },
            { name: "Licencja PZJ", date: '' },
            { name: "Psycholog sportowy", date: '' },
            { name: "Wizyta fizjoterapeuty", date: '' },
        ]

        var allEvents = await eventController.get({
            ...opts,
            dateFrom: moment().subtract(1, 'days').format('YYYY-MM-DD'),
            dateTo: moment().add(1, 'year').format('YYYY-MM-DD'),
            eventsOnly: true,
            reminder: true,
            eventType: 'Wydarzenie (jeźdźiec)'
            // horse
        })

        for (se of specificEvents) {
            let filteredEvents = allEvents.filter(x => x.description == se.name)
            if (filteredEvents.length > 0) {
                filteredEvents = filteredEvents.sort((a, b) => { if (moment(a.date).isAfter(b.date)) return 1; else return -1 })
                se.date = filteredEvents[0].date ? moment(filteredEvents[0].date).format('YYYY.MM.DD') : ''
            }
        }
        return specificEvents;
    },
    autoReminder: async () => {
   
        const users = await User.get({ all: true, push: true })
        for (let u of users) {
            let events = await Event.getForTomorrow({
                dateFrom: moment().add(1, 'day').format('YYYY-MM-DD'),
                // dateTo: moment().add(2, 'day').format('YYYY-MM-DD'),
                reminder: true,
                eventsOnly: true,
                user: u.id
            })
           
            for (let e of events) {
                e.user = u
                if (e.attachedUser) {
                    let attachedUser = await riderController.get({ id: e.attachedUser })
                    e.attachedUser = attachedUser[0]
                }
                if (e.user && e.user?.pushToken) {
                    console.log('ppp', e)
                    notification.send({ 
                        pushTokens: [e.user.pushToken], 
                        body: `Przypomnienie o nadchodzącym wydarzeniu: ${e.description}` 
                    })
                }
                if (e.attachedUser && e.attachedUser?.pushToken) {

                    notification.send({ 
                        pushTokens: [e.attachedUser.pushToken], 
                        body: `Przypomnienie o nadchodzącym wydarzeniu: ${e.description}` 
                    })
                }
            }
        }

        // //usupełnianie danych uzytkownika
        // for (let e of events) {
        //     e.user = (await User.get({ id: e.user }))[0]
        //     if (e.attachedUser) {
        //         let attachedUser = await riderController.get({ id: e.attachedUser })
        //         e.attachedUser = attachedUser[0]
        //     }
        // }
        // console.log('auto', events.length)

        // for (let e of events) {
        //     if (e.user, e.user?.pushToken)
        //         notification.send({ pushTokens: [e.user.pushToken], body: `Przypomnienie o nadchodzącym wydarzeniu: ${e.description}` })
        //     if (e.attachedUser, e.attachedUser?.pushToken)
        //         notification.send({ pushTokens: [e.attachedUser.pushToken], body: `Przypomnienie o nadchodzącym wydarzeniu: ${e.description}` })

        // }
    }
}

module.exports = eventController