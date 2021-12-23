const mysql = require("mysql");
const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
});

exports.getUser = async (req, res) => {
  console.log(req.user);
  if( req.user ) {
    res.json( {
      user: req.user
    });
  } else {
    res.status(401).json({"message": "not logged in"});
  }
}

exports.updateUser = (req, res) => {
  console.log("exports.updateUser 1");
  console.log(req.body);

  const curEmail = req.user.email;

  db.query('SELECT email FROM users WHERE email = ?', [curEmail], async (error, results) => {
    if(error) {
      console.log(error);
      res.json(error);
    }

    if( results.length === 0 ) {
      return res.json( {
        message: `The user with email = ${curEmail} no longer exists`
      })
    }
    let updatedData = { };
    const { password, passwordConfirm } = req.body;

    if( password && (password === passwordConfirm) ) {
      let hashedPassword = await bcrypt.hash(password, 8);
      updatedData.password = hashedPassword;
      console.log(hashedPassword);
    }
    else if( password && password !== passwordConfirm ) {
      return res.json( {
        message: 'Passwords do not match'
      });
    }

    ["name", "email","phone"].forEach(key => {
      if ( req.body[key]) {
        updatedData[key] = req.body[key];
      }
    })

    console.log("exports.updateUser 2");

    db.query('UPDATE users SET ? where email = ?',[updatedData,curEmail],
        (error, results) => {
          if(error) {
            console.log(error);
          } else {
            console.log(results);
            return res.json({
              "message": results.message
            });
          }
        })
  });

}


