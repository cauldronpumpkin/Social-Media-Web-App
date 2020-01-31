const jwt = require('jsonwebtoken');
let SECRET = "socialmediawebappproject";
module.exports = (req, res, next) => {
    
    const authHeaders = req.get('authorization');
    if (!authHeaders) {
        req.isAuth = false;
        return next();
    }

    const token = authHeaders.split(' ')[1];
    if (!token || token === '') {
        req.isAuth = false;
        return next();
    }

    let decodedToken;
    
    decodedToken = jwt.verify(token, SECRET);
    
    if (decodedToken == {}) {
        req.isAuth = false;
        return next();
    }

    req.isAuth = true;
    req.user = decodedToken.user;
    
    next();
}