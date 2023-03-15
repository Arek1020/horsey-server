const nodemailer = require('nodemailer'),
    //   utils = require(__dirname + '/../utils/index'),
    moment = require('moment')

var config = {
    host: process.env.MAILERSMTP,
    port: process.env.MAILERPORT,
    secure: true,
    auth: {
        user: process.env.MAILERUSER,
        pass: process.env.MAILERPASS
    }
},
    mailer = nodemailer.createTransport(config)

mailer.new_account = function (data) {
    let url = `${process.env.SERVER_URL}activate?id=${data.id}&token=${data.emailToken}`
    let mailoptions = {
        from: `Horsey.pl <${process.env.MAILERUSER}>`,
        to: '<' + data.email + '>',
        subject: "Horsey :: Weryfikacja konta",
    }
    mailoptions.attachments = [{
        path: process.env.dirname + '/public/images/iconBlue.png',
        cid: 'unique_id_fi'
    }]
    mailoptions.html = `Szanowni Państwo, 
        weryfikacja jest ostatnim etapem tworzenia nowego konta w serwisie Horsey. 
        Otrzymaliśmy prośbę o rejestrację użytkownika: ${data.name}
        Aby ukończyć proces rejestracji kliknij poniższy link (lub skopiuj go i wklej do przeglądarki internetowej w polu adresu):
        ${url}
        Jeśli prośba nie została wysłana przez Ciebie, zignoruj tę wiadomość. 
        Dziękujemy za korzystanie z naszego systemu.
        Z poważaniem, 
        Zespół serwisu Horsey
        <p>Wiadomość została wygenerowana automatycznie z serwisu Horsey (<a href="${process.env.SERVER_URL}">${process.env.SERVER_URL}</a>)<br>
        Proszę nie odpowiadać na tę korespondencję. Jeśli mają Państwo dodatkowe pytania dotyczące serwisu, prosimy o przesłanie wiadomości na adres: <a href="mailto:${process.env.MAILTOCONTACT}">${process.env.MAILTOCONTACT}</a>
        </p>
        `


    //
    mailer.sendMail(mailoptions, (err, info) => {
        if (err) console.log(err)
        console.log(info)
    })
}

mailer.password_reset = function (data) {
    // let url = `${process.env.SERVER_URL}activate?id=${data.id}&token=${data.emailToken}`
    let mailoptions = {
        from: `Horsey.pl <${process.env.MAILERUSER}>`,
        to: '<' + data.email + '>',
        subject: "Horsey :: Reset hasła",
    }
    mailoptions.attachments = [{
        path: process.env.dirname + '/public/images/iconBlue.png',
        cid: 'unique_id_fi'
    }]
    mailoptions.html = `
        <p>Szanowni Państwo, </p>
        <p>Otrzymaliśmy prośbę o zresetowanie hasła dla użytkownika: <span style="display: none;">'</span><strong>${data.email}</strong><span style="display: none;">'</span></p>
        <p>Oto tymczasowe hasło wygenerowane przez system: <b> ${data.password} </b>.</p>
        <p>Prosimy o zmianę tego hasła w ustawieniach aplikacji.</p>
        <p>Jeśli prośba nie została wysłana przez Ciebie, zignoruj tę wiadomość.<br>
        Dziękujemy za korzystanie z naszego systemu.</p>
        <p>Z poważaniem, <br>
        Zespół serwisu Horsey</p>
        <img width=50 style="height: 50px; width: 50px;" src="cid:unique_id_fi"/>

        <p>Wiadomość została wygenerowana automatycznie z serwisu Horsey (<a href="${process.env.SERVER_URL}">${process.env.SERVER_URL}</a>)<br>
        Proszę nie odpowiadać na tę korespondencję. Jeśli mają Państwo dodatkowe pytania dotyczące serwisu, prosimy o przesłanie wiadomości na adres: <a href="mailto:${process.env.MAILTOCONTACT}">${process.env.MAILTOCONTACT}</a>
        </p>
        `
    mailer.sendMail(mailoptions, (err, info) => {
        if (err) console.log(err)
        console.log(info)
    })
}
mailer.password_create = function (data) {
    // let url = `${process.env.SERVER_URL}activate?id=${data.id}&token=${data.emailToken}`
    let mailoptions = {
        from: `Horsey.pl <${process.env.MAILERUSER}>`,
        to: '<' + data.email + '>',
        subject: "Horsey :: Reset hasła",
    }
    mailoptions.attachments = [{
        path: process.env.dirname + '/public/images/iconBlue.png',
        cid: 'unique_id_fi'
    }]
    mailoptions.html = `
        <p>Szanowni Państwo, </p>
        <p>Utworzyliśmy tymczasowe hasło dla użytkownika: <span style="display: none;">'</span><strong>${data.email}</strong><span style="display: none;">'</span></p>
        <p>Oto tymczasowe hasło wygenerowane przez system: <b> ${data.password} </b>.</p>
        <p>Prosimy o zmianę tego hasła w ustawieniach aplikacji.</p>
        <p>Jeśli prośba nie została wysłana przez Ciebie, zignoruj tę wiadomość.<br>
        Dziękujemy za korzystanie z naszego systemu.</p>
        <p>Z poważaniem, <br>
        Zespół serwisu Horsey</p>
        <img width=50 style="height: 50px; width: 50px;" src="cid:unique_id_fi"/>

        <p>Wiadomość została wygenerowana automatycznie z serwisu Horsey (<a href="${process.env.SERVER_URL}">${process.env.SERVER_URL}</a>)<br>
        Proszę nie odpowiadać na tę korespondencję. Jeśli mają Państwo dodatkowe pytania dotyczące serwisu, prosimy o przesłanie wiadomości na adres: <a href="mailto:${process.env.MAILTOCONTACT}">${process.env.MAILTOCONTACT}</a>
        </p>
        `
    mailer.sendMail(mailoptions, (err, info) => {
        if (err) console.log(err)
        console.log(info)
    })
}
mailer.password_change = function (data) {
    // let url = `${process.env.SERVER_URL}activate?id=${data.id}&token=${data.emailToken}`
    let mailoptions = {
        from: `Horsey.pl <${process.env.MAILERUSER}>`,
        to: '<' + data.email + '>',
        subject: "Horsey :: Zmiana hasła",
    }
    mailoptions.attachments = [{
        path: process.env.dirname + '/public/images/iconBlue.png',
        cid: 'unique_id_fi'
    }]
    mailoptions.html = `
        <p>Szanowni Państwo, </p>
        <p>Zostało zmienione hasło dla użytkownika: <span style="display: none;">'</span><strong>${data.email}</strong><span style="display: none;">'</span></p>
        <p>Jeśli prośba nie została wysłana przez Ciebie, 
        prosimy o sprawdzenie danych dostępowych dla Państwa konta w serwisie Horsey 
        lub zignorwanie tej wiadomość jeżeli wszystko jest w porządku.<br></p>
        <p>Z poważaniem, <br>
        Zespół serwisu Horsey</p>
        <img width=50 style="height: 50px; width: 50px;" src="cid:unique_id_fi"/>
        
        <p>Wiadomość została wygenerowana automatycznie z serwisu Horsey (<a href="${process.env.SERVER_URL}">${process.env.SERVER_URL}</a>)<br>
        Proszę nie odpowiadać na tę korespondencję. Jeśli mają Państwo dodatkowe pytania dotyczące serwisu, prosimy o przesłanie wiadomości na adres: <a href="mailto:${process.env.MAILTOCONTACT}">${process.env.MAILTOCONTACT}</a>
        </p>
        `
    mailer.sendMail(mailoptions, (err, info) => {
        if (err) console.log(err)
        console.log(info)
    })
},

    mailer.user_attached = function (data) {
        // let url = `${process.env.SERVER_URL}activate?id=${data.id}&token=${data.emailToken}`
        let mailoptions = {
            from: `Horsey.pl <${process.env.MAILERUSER}>`,
            to: '<' + data.email + '>',
            subject: "Horsey :: Powiadomienie",
        }
        mailoptions.attachments = [{
            path: process.env.dirname + '/public/images/iconBlue.png',
            cid: 'unique_id_fi'
        }]
        mailoptions.html = `
        <p>Szanowni Państwo, </p>
        <p>Informujemy, że Państwa konto zostało dodane jako ${data?.type} dla konia: <span style="display: none;">'</span><strong>${data.horse.name}</strong><span style="display: none;">'</span></p>
        <p>Właścicielem konia jest: <b> ${data.horseOwner.name} </b>.</p>
        <p>E-mail kontaktowy do właściciela: <b>${data.horseOwner.email}</b></p>
        <p>Jeśli ta wiadomość jest dla Państwa nie jasna prosimy wysłać zapytanie na powyższego maila.</p>
        <br>
        <p>Dziękujemy za korzystanie z naszego systemu.</p>
        <p>Z poważaniem, <br>
        Zespół serwisu Horsey</p>
        <img width=50 style="height: 50px; width: 50px;" src="cid:unique_id_fi"/>

        <p>Wiadomość została wygenerowana automatycznie z serwisu Horsey (<a href="${process.env.SERVER_URL}">${process.env.SERVER_URL}</a>)<br>
        Proszę nie odpowiadać na tę korespondencję. Jeśli mają Państwo dodatkowe pytania dotyczące serwisu, prosimy o przesłanie wiadomości na adres: <a href="mailto:${process.env.MAILTOCONTACT}">${process.env.MAILTOCONTACT}</a>
        </p>
        `
        mailer.sendMail(mailoptions, (err, info) => {
            if (err) console.log(err)
            console.log(info)
        })
    }


mailer.account_create = function (data) {
    // let url = `${process.env.SERVER_URL}activate?id=${data.id}&token=${data.emailToken}`
    let mailoptions = {
        from: `Horsey.pl <${process.env.MAILERUSER}>`,
        to: '<' + data.email + '>',
        subject: "Horsey :: Utworzenie konta",
    }
    mailoptions.attachments = [{
        path: process.env.DIRNAME + '/public/images/iconBlue.png',
        cid: 'unique_id_fi'
    }]
    mailoptions.attachments = [{
        path: process.env.dirname + '/public/images/iconBlue.png',
        cid: 'unique_id_fi'
    }]
    mailoptions.html = `
        <p>Szanowni Państwo, </p>
        <p>Informujemy, że zostało utworzone konto na podanego maila: <span style="display: none;">'</span><strong>${data.email}</strong><span style="display: none;">'</span></p>
        <p>Twórcą państwa konta jest: <b> ${data.creator.name} </b> (<b> ${data.creator.email} </b>).</p>
        <p>Aby aktywować konto należy w aplkacji Horsey kliknąć przycisk <b>Przypomnij hasło</b>, a następnie podać adres e-mail na który zostało utworzone konto (<b> ${data.email} </b>).</p>
        <p>Jeśli ta wiadamość jest dla Państwa nie jasna prosimy wysłać zapytanie do twórcy Państwa konta.</p>
        <br>
        <p>Dziękujemy za korzystanie z naszego systemu.</p>
        <p>Z poważaniem, <br>
        Zespół serwisu Horsey</p>
        <img width=50 style="height: 50px; width: 50px;" src="cid:unique_id_fi"/>

        <p>Wiadomość została wygenerowana automatycznie z serwisu Horsey (<a href="${process.env.SERVER_URL}">${process.env.SERVER_URL}</a>)<br>
        Proszę nie odpowiadać na tę korespondencję. Jeśli mają Państwo dodatkowe pytania dotyczące serwisu, prosimy o przesłanie wiadomości na adres: <a href="mailto:${process.env.MAILTOCONTACT}">${process.env.MAILTOCONTACT}</a>
        </p>
        `
    mailer.sendMail(mailoptions, (err, info) => {
        if (err) console.log(err)
        console.log(info)
    })
}


mailer.new_report = function (admin, userName, data) {
    let mailoptions = {
        from: `Horsey.pl <${process.env.MAILERUSER}>`,
        to: '<' + admin.email + '>',
        subject: "Horsey :: Zgłoszenie",
    }
    mailoptions.attachments = [{
        path: process.env.dirname + '/public/images/iconBlue.png',
        cid: 'unique_id_fi'
    }]
    mailoptions.html = `
        <p>Szanowni Państwo, </p>
        <p>Informujemy, że zostało wysłane zgłoszenie od użytkownika <b>${userName}</b></p>
        <p>Typ: <b>${data.type}</b></p>
        <p>Wiadomość: <b>${data.message}</b></p>
        <br>
        <p>Dziękujemy za korzystanie z naszego systemu.</p>
        <p>Z poważaniem, <br>
        Zespół serwisu Horsey</p>
        <img width=50 style="height: 50px; width: 50px;" src="cid:unique_id_fi"/>

        <p>Wiadomość została wygenerowana automatycznie z serwisu Horsey (<a href="${process.env.SERVER_URL}">${process.env.SERVER_URL}</a>)<br>
        Proszę nie odpowiadać na tę korespondencję. Jeśli mają Państwo dodatkowe pytania dotyczące serwisu, prosimy o przesłanie wiadomości na adres: <a href="mailto:${process.env.MAILTOCONTACT}">${process.env.MAILTOCONTACT}</a>
        </p>
        `
    mailer.sendMail(mailoptions, (err, info) => {
        if (err) console.log(err)
        console.log(info)
    })
}

module.exports = mailer