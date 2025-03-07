const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors'); 

const sequelize = require('./config/database');
const UserRoutes = require('./routes/userRoutes');
const app = express();

app.use(cors({
  origin: 'http://localhost:3000', // ✅ Replace with your frontend domain
  methods: ['GET', 'POST' , 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.static(path.join(__dirname,'public')));

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use(UserRoutes);

sequelize.sync()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => console.log('Server running on port 3000'));
    console.log('Database connected successfully');
  })
  .catch(err => console.error('Database connection error:', err));