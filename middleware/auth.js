const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization'); //get authorization key from header
  // Check authHeader
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }
  const token = authHeader.split(' ')[1]; //splitting authorization value from bearer
  let decodedToken;
  // ex handling 
  try {
    decodedToken = jwt.verify(token, 'thisismysecret');
  } catch (err) {
    req.isAuth = false;
    return next();
  }
  // decoding token
  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }
  req.userId = decodedToken.userId;
  req.isAuth = true;
  next();
};
