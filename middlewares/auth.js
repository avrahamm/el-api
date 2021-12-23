const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
});

exports.isLoggedIn = async (req, res, next) => {
  // console.log(req.cookies);
  const token =
      req.body.token || req.query.token || req.headers["x-access-token"];

  if( token) {
    try {
      //1) verify the token
      const decoded = await promisify(jwt.verify)(token,
      process.env.JWT_SECRET
      );

      console.log(decoded);

      //2) Check if the user still exists
      db.query('SELECT * FROM users WHERE id = ?', [decoded.id], (error, result) => {
        console.log(result);

        if(!result) {
          return next();
        }

        req.user = result[0];
        console.log("user is")
        console.log(req.user);
        return next();

      });
    } catch (error) {
      console.log(error);
      return next();
    }
  } else {
    next();
  }
}

