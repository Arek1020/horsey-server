const bcrypt = require('bcryptjs'),
    jwt = require('jsonwebtoken'),
    User = require('../models/user.js'),
    userController = require('./user')
emailValidator = require("email-validator"),
    passwordValidator = require('password-validator'),
    crypto = require('crypto'),
    moment = require('moment'),
    mailer = require('../utils/mailer')


var passwordSchema = new passwordValidator();



const accountController = {
    signup: (opts, callback) => {
        var passwordValidationResult = validatePassword(opts.password)

        if (!opts.email || !emailValidator.validate(opts.email))
            return callback({ err: true, message: 'Nieprawidłowy adres e-mail' })
        if (!opts.password === opts.repeatPassword)
            return callback({ err: true, message: 'Podane hasła są różne' })
        if (!opts.password || passwordValidationResult.err)
            return callback(passwordValidationResult)


        opts.email = opts.email.trim();

        User.get({ email: opts.email }).then(dbUser => {
            dbUser = dbUser[0]
            if (dbUser) {
                return callback({ err: true, message: "Konto z takim adresem e-mail juz istnieje" });
            } else if (opts.email && opts.password) {
                bcrypt.hash(opts.password, 12, (err, passwordHash) => {
                    if (err) {
                        return callback({ err: true, message: "Błąd zapisu hasła" });
                    } else if (passwordHash) {
                        var emailToken = crypto.createHash('md5').update(moment().format('x'), 'utf-8').digest('hex')
                        var userData = {
                            email: opts.email,
                            name: opts.name,
                            password: passwordHash,
                            phone: opts.phone,
                            emailToken: emailToken
                        }
                        User.update((userData))
                            .then((result) => {
                                userData.id = result.insertId
                                mailer.new_account(userData)
                                return callback({ message: "Pomyślnie utworzono użytkownika. Aby aktywować konto kliknij w link wysłany na podanego maila." });
                            })
                            .catch(err => {
                                console.log(err);
                                return callback({ err: true, message: "error while creating the user" });
                            });
                    };
                });
            };
        })
            .catch(err => {
                console.log('error', err);
            });
    },
    mobileSignUp: async (opts, callback) => {
        if (opts.stage == 1) {
            if (!opts.name)
                return callback({ err: true, message: 'Nieprawidłowa nazwa uzytkownika' })
            if (!opts.email || !emailValidator.validate(opts.email))
                return callback({ err: true, message: 'Nieprawidłowy adres e-mail' })

            opts.email = opts.email.trim();

            var user = await User.get({ email: opts.email })
            if (user?.length)
                if (user[0]?.password)
                    return callback({ err: true, message: "Konto z takim adresem e-mail juz istnieje" });

            var userData = {
                id: user[0]?.id,
                email: opts.email,
                name: opts.name,
                phone: opts.phone,
                date: moment().format('YYYY-MM-DD HH:mm:ss'),
            }
            User.update(userData)
                .then((result) => {
                    return callback({ message: "Pomyślnie utworzono uzytkownika.", userID: result.insertId || user[0]?.id });
                })
                .catch(err => {
                    console.log(err);
                    return callback({ err: true, message: "Wystąpił błąd podczas tworzenia uzytkownika." });
                });
        }
        else if (opts.stage == 2) {
            var passwordValidationResult = validatePassword(opts.password)

            if (!opts.id)
                return callback({ err: true, message: 'Brak ID uzytkownika' })
            if (opts.password !== opts.passwordClone)
                return callback({ err: true, message: 'Podane hasła są różne' })
            if (!opts.password || passwordValidationResult.err)
                return callback(passwordValidationResult)

            bcrypt.hash(opts.password, 12, (err, passwordHash) => {
                if (err) {
                    return callback({ err: true, message: "Błąd zapisu hasła" });
                } else if (passwordHash) {
                    var userData = {
                        id: opts.id,
                        password: passwordHash,
                        emailToken: crypto.createHash('md5').update(moment().format('x'), 'utf-8').digest('hex'),
                        get: true
                    }
                    userController.update(userData)
                        .then((result) => {
                            userData.email = result[1][0]?.email
                            userData.name = result[1][0]?.name
                            mailer.new_account(userData)
                            return callback({ message: "Pomyślnie utworzono uzytkownika.", userID: opts.id });
                        })
                        .catch(err => {
                            console.log(err);
                            return callback({ err: true, message: "Wystąpił błąd podczas tworzenia uzytkownika." });
                        });
                }
            })

        }
        else {

        }

    },
    signin: (opts, callback) => {
        return new Promise((resolve, reject) => {
            if (!opts.email)
                return reject({ message: 'Brak adresu e-mail' })
            if (!opts.password)
                return reject({ message: 'Brak hasła' })

            opts.email = opts.email.trim();

            User.get(opts)
                .then(dbUser => {
                    if (!dbUser.length) {
                        return reject({ message: "Nie znaleziono takiego użytkownika" });
                    } else {
                        // password hash
                        dbUser = dbUser[0];
                        if (opts.adminPanel && !dbUser.admin)
                            return reject({ message: "Brak uprawnień", err: true });

                        if (dbUser.emailToken)
                            return reject({ message: "Konto nieaktywne", err: true });

                        bcrypt.compare(opts.password, dbUser.password, (err, compareRes) => {
                            if (err) { // error while comparing
                                return reject({ message: "Błąd logowania", err });
                            } else if (compareRes) { // password match
                                const token = jwt.sign({ email: opts.email, id: dbUser?.id }, process.env.SECRET, { expiresIn: process.env.TOKEN_EXPIRATION + ' days' });
                                delete dbUser.password;
                                return resolve({ message: "Zalogowano pomyślnie", "token": token, user: JSON.stringify(dbUser) });
                            } else { // password doesnt match
                                return reject({ message: "Nieprawidłowe dane logowania" });
                            };
                        });
                    };
                })
                .catch(err => {
                    console.log('error', err);
                });
        })
    },
    activate: (opts, callback) => {
        if (!opts.id)
            return callback({ err: 'Brak ID' })
        if (!opts.token)
            return callback({ err: 'Brak tokenu' })

        User.activateAccount(opts).then((result) => {
            if (result.affectedRows > 0)
                return callback({ success: 'Pomyślnie aktywowano konto' })
            else
                return callback({ error: 'Konto zostało już aktywowane lub podany link jest błędny.' })

        }).catch((err) => { return callback({ err }) })

    },
    changePassword: async (opts, callback) => {
        var user = await User.get(opts)

        if (!user.length)
            return callback({ err: true, message: 'Nieprawidłowy adres e-mail' })

        user = user[0];

        bcrypt.compare(opts.password, user.password, (err, compareRes) => {
            if (err) { // error while comparing
                return callback({ err: true, message: "Nieprawidłowe hasło" });
            } else if (compareRes) { // password match

                // sprawdz poprawność nowego hasła
                var passwordValidationResult = validatePassword(opts.newPassword)
                if (!opts.newPassword === opts.newPasswordClone)
                    return callback({ err: true, message: 'Podane hasła są różne' })
                if (!opts.password || passwordValidationResult.err)
                    return callback(passwordValidationResult)

                //wygeneruj i zapisz nowe hasło
                bcrypt.hash(opts.newPassword, 12, (err, passwordHash) => {
                    if (err) {
                        return callback({ err: true, message: "Błąd zapisu hasła" });
                    } else if (passwordHash) {
                        User.update({ id: user.id, password: passwordHash }).then(() => {
                            mailer.password_change({ email: user.email, password: passwordHash });
                            return callback({ message: 'Pomyślnie zresetowano hasło' })
                        }).catch(err => {
                            console.log(err);
                            return callback({ err: true, message: "Błąd resetowania hasła" });
                        });
                    }
                })

            } else { // password doesnt match
                return callback({ err: true, message: "Nieprawidłowe hasło" });
            };
        });



    },
    resetPassword: async (opts, callback) => {
        if (!opts.email || !emailValidator.validate(opts.email))
            return callback({ err: true, message: 'Nieprawidłowy adres e-mail' })

        var user = await User.get(opts)

        if (!user.length)
            return callback({ err: true, message: 'Nieprawidłowy adres e-mail' })

        user = user[0]

        var newPassword = crypto.createHash('md5').update(moment().format('x'), 'utf-8').digest('hex').substring(0, 10)

        console.log({ err: true, message: 'New password: ' + newPassword, user })

        bcrypt.hash(newPassword, 12, (err, passwordHash) => {
            if (err) {
                return callback({ err: true, message: "Błąd zapisu hasła" });
            } else if (passwordHash) {
                User.update({ id: user.id, password: passwordHash }).then(() => {
                    if (opts.create)
                        mailer.password_create({ email: user.email, password: newPassword });
                    else
                        mailer.password_reset({ email: user.email, password: newPassword });

                    return callback({ message: 'Pomyślnie zresetowano hasło' })
                }).catch(err => {
                    console.log(err);
                    return callback({ err: true, message: "Błąd resetowania hasła" });
                });
            }
        })


    }
}


const validatePassword = (password) => {
    passwordSchema
        .is().min(8)                                    // Minimum length 8
        .is().max(100)                                  // Maximum length 100
        .has().uppercase()                              // Must have uppercase letters
        .has().lowercase()                              // Must have lowercase letters
        // .has().digits(2)                                // Must have at least 2 digits
        .has().not().spaces()                           // Should not have spaces
        .is().not().oneOf(['Passw0rd', 'Password123']);

    var result = passwordSchema.validate(password)
    if (!result)
        result = { err: true, message: 'Hasło powinno zawierać minimum 8 znaków, duże i małe litery.' }
    return result
}

module.exports = accountController