const express = require('express');
const app = express();
const initializeDatabase = require("./database");
const bodyParser = require('body-parser');
const cors = require('cors');
jwt    = require('jsonwebtoken');
config = require('./configurations/config');
morgan      = require('morgan');
const  ProtectedRoutes = express.Router(); 

http = require('http');

// parse application/json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
//set secret
app.set('Secret', config.secret);
// use morgan to log requests to the console
app.use(morgan('dev'));

app.use(cors());


server = http.createServer(app);
initializeDatabase(app);
server.listen(8080, () => {
   console.log(`Listening on port 3001`);
});

app.use('/api', ProtectedRoutes);

app.get('/', function(req, res) {
    res.send('Hello world  app is running on http://localhost:8080/');
});

app.post('/authenticate',(req,res)=>{

    if(req.body.username==="roberto"){

        if(req.body.password===123){
             //if eveything is okey let's create our token 

        const payload = {
            check:  true
          };

          var token = jwt.sign(payload, app.get('Secret'), {
                expiresIn: 1440 // expires in 24 hours
          });


          res.json({
            message: 'authentication done ',
            token: token
          });

        }else{
            res.json({message:"please check your password !"})
        }

    }else{
        res.json({message:"user not found !"})
    }

});

ProtectedRoutes.use((req, res, next) =>{

    // check header for the token
    var token = req.headers['access-token'];

    // decode token
    if (token) {

      // verifies secret and checks if the token is expired
      jwt.verify(token, app.get('Secret'), (err, decoded) =>{      
        if (err) {
          return res.json({ message: 'invalid token' });    
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;    
          next();
        }
      });

    } else {
      // if there is no token  
      res.send({ 
          message: 'No token provided.' 
      });

    }
  });

  ProtectedRoutes.get('/getAllDevices',(req,res)=>{
    let devices = [
        {
            id: 1,
            name:"tp link 100"
        },
        {
           id: 2,
           name:"tp link 200"
       }
    ]
   
    res.json(devices)
   
   });

