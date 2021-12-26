const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
});

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if( !email || !password ) {
      return res.status(400).json( {
        message: 'Please provide an email and password'
      })
    }

    db.query('SELECT * FROM users WHERE email = ? AND active = ?', [email, 1], async (error, results) => {
      console.log(results);
      if( !results || !(await bcrypt.compare(password, results[0].password)) ) {
        res.status(401).json({
          message: 'Email or Password is incorrect'
        })
      } else {
        const id = results[0].id;

        const token = jwt.sign({ id }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES_IN
        });

        console.log("The token is: " + token);
        res.status(200).json({"token":token});
      }

    })

  } catch (error) {
    console.log(error);
  }
}

exports.registerStep1 = (req, res) => {
  console.log(req.body);

  const { name, email, password, passwordConfirm, phone } = req.body;
  if( !password || (password !== passwordConfirm) ) {
    return res.json( {
      message: 'Passwords do not match'
    });
  }

  db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
    if(error) {
      console.log(error);
      res.json(error);
    }
    let userRowId = 0;

    console.log(results[0]);
    if( results.length > 0 && (results[0].active === 1) ) {
      return res.json( {
        message: 'That email is already in use'
      })
    }
    else if( results.length > 0 && results[0].active === 0 ) {
      userRowId = results[0].id;
    }
    let hashedPassword = await bcrypt.hash(password, 8);
    console.log(`userRowExists = ${userRowId}`);

    if (!userRowId) {
      db.query('INSERT INTO users SET ?',
          {name: name, email: email, phone, password: hashedPassword, active: 0},
          (error, results) => {
            if (error) {
              console.log(error);
            } else {
              console.log(results);
              userRowId = results.insertId;
              return res.json({
                id: userRowId
              });
            }
          })
    }
    else {
      db.query('UPDATE users SET ? WHERE email = ? AND active = 0',
          [{name: name, phone, password: hashedPassword, active: 0},email],
          (error, results) => {
            if (error) {
              console.log(error);
            } else {
              console.log(results);
              return res.json({
                id: userRowId
              });
            }
          })
    }
  });
}

exports.registerStep2 = (req, res) => {
  console.log(req.body);

  const { smsCode } = req.body;

  db.query('SELECT * FROM users WHERE id = ?', [smsCode], async (error, results) => {
    if(error) {
      console.log(error);
      res.json(error);
    }

    if( results.length === 0 ) {
      return res.json( {
        message: 'Register again'
      })
    }
    console.log(results[0]);
    if( results.length > 0 && (results[0].active === 1) ) {
      return res.json( {
        message: 'Already registered'
      })
    }

    db.query('UPDATE users SET ? WHERE id = ?',
        [{active:1}, smsCode],
        (error, results) => {
          if (error) {
            console.log(error);
          } else {
            console.log(results);
            return res.json({
              message: 'Registered'
            });
          }
        })
  });
}

exports.logout = async (req, res) => {
  res.cookie('jwt', 'logout', {
    expires: new Date(Date.now() + 2*1000),
    httpOnly: true
  });

  res.status(200).json({"message": "Logged out" });
}