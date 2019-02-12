const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const Nextmo = require('nexmo');
const socketio = require('socket.io');

// Initialize Nexmo
const nextmo = new Nextmo({
  apiKey: 'cffca0e7',
  apiSecret: 'n450ObvlEnSjAI2m'
}, {debug: true});
// Initialize App
const app = express();

// Template engine setup
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);

// Public folder setup
app.use(express.static(__dirname + '/public'));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Index route
app.get('/', (req, res) => {
  res.render('index');
});

// Catch form submit
app.post('/', (req, res) => {
  res.send(req.body);
  console.log(req.body);
  const number = req.body.number;
  const text = req.body.text;

  nextmo.message.sendSms(
    'Nexmo', number, text, { type: 'unicode' },
    (err, responseData) => {
      if(err) {
        console.log(err);
       } else {
         console.dir(responseData);

        //  Get Data from Response
        const data = {
          id: responseData.messages[0]['message-id'],
          number: responseData.messages[0]['to']
         }
         // Emit to the client
         io.emit('smsStatus', data);
        }
     }
  );
 });

// Define port
const port = 3000;

// start server
const server = app.listen(port, () => console.log(`Server started on port ${port}`));

// Connect to socketio.io
const io = socketio(server);
io.on('connection', (socket) => {
  console.log('Connected');
  io.on('disconnect', () => {
    console.log('Disconnected from Socket');
   })
 })
