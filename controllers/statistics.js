const Stats = require('../models/statistics'),
    moment = require('moment')


const statisticsController = {
    newUsersPerMonths: async (opts) => {

        let users = await Stats.newUsersPerMonths({ dateFrom: moment().add(-12, 'months').format('YYYY-MM-DD'), dateTo: moment().add(1, 'day').format('YYYY-MM-DD') })
        let stats = []
        for (let i = 1; i < 13; i++) {
            stats.push({ month: i, amount: users.find(x => x.month == i)?.amount || 0 })
        }

        return stats;

    },
    usersActivityPerDays: async (opts) => {
        let data = await Stats.usersActivityPerDays({ dateFrom: moment().add(-1, 'months').format('YYYY-MM-DD'), dateTo: moment().add(1, 'day').format('YYYY-MM-DD') })
        
        data = data.map(d => {return {date: moment(d.date).format('MM.DD'), amount: d.amount}})

        let stats = []

        let daysAmount = moment(moment().add(1, 'day')).diff(moment().add(-1, 'months'), 'day')
        for (let i = 1; i < daysAmount; i++) {
            stats.push({ 
                date: moment().add(-1, 'months').add(i, 'day').format('MM.DD'), 
                amount: data.filter(x => moment().add(-1, 'months').add(i, 'day').format('MM.DD') == x.date)?.length || 0 
            })
        }
        return stats;

    },
    usersType: async (opts) => {

        let users = await Stats.usersType()
        users = users[0].concat(users[1])

        return users;

    }
}

module.exports = statisticsController