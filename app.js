const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const http = require("http");
const socketIo = require("socket.io");


const sequelize = require('./config/database');
const UserRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const app = express();
const server = http.createServer(app);
const io = socketIo(server); 

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST' , 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.static(path.join(__dirname,'public')));
app.use(express.static(path.join(__dirname, "views")));
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("sendMessage", (data) => {
      io.emit("message", data);
  });

  socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
  });
});
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'; font-src 'self' data:;");
  next();
});

app.use(chatRoutes);
app.use(UserRoutes);


sequelize.sync()
  .then(() => {
    server.listen(process.env.PORT || 3000, () => console.log('Server running on port 3000'));
    console.log('Database connected successfully');
  })
  .catch(err => console.error('Database connection error:', err));