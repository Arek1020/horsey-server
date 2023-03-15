const jwt = require('jsonwebtoken'),
    User = require('../models/user')

const authMiddleware = {
    requireToken: (req, res, next) => {

        const authHeader = req.get("Authorization");

        if (!authHeader) {
            return res.status(401).json({ message: 'not authenticated' });
        };
        const token = authHeader.split(' ')[1];

        if (!token || token == 'null' || token == null) {
            return res.status(401).json({ message: 'not authenticated' });
        };

        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.SECRET);
        } catch (err) {
            console.log(err)
            return res.status(500).json({err: true, message: 'Brak autoryzacji - nieprawidłowy token' });
        };

        if (!decodedToken) {
            res.status(403).json({ message: 'forbidden' });
        } else {
            User.get({ id: decodedToken.id }).then((user) => {
                user = user[0]
                if (!user)
                    return res.status(403).json({ message: 'forbidden' });

                res.locals.user = user
                return next();
            })

        };
    }
}

module.exports = authMiddleware;