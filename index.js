const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const credentials = require('./middleware/credentions')
const fileUpload = require("express-fileupload");
const accessControl = require('./middleware/accessControl')
const admin_route = require('./routes/adminRoute')
const authRouter = require('./routes/authRoute');
const cookieParser = require('cookie-parser');
const verifyJWT = require('./middleware/jwtmiddleware')
const user_router = require('./routes/userRoute');
const chef_route = require('./routes/chefRoute');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');
const path = require('path');
const { Socket } = require('dgram');
// const http = require('http');
const app = express();

app.use(cors({ credentials: true, origin: 'http://localhost:5173' }));
app.use(cookieParser());
app.use(credentials);
app.options('*', cors());
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.resolve() + "/public"))
app.use(
  fileUpload({
    useTempFiles: true,
    limits: { fileSize: 50 * 2024 * 1024 },
  })
);

const { DB_URL, PORT } = process.env;
// Connect to MongoDB
mongoose.connect(DB_URL)
  .then(() => {
    console.log('Connected to MongoDB');
    // Start the server after a successful database connection
    app.listen(PORT || 3000, () => {
      console.log(`Server connected at PORT: ${PORT || 3000}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
    // app.use(cors(corsOptions));
  });

const io = new Server(8000);

io.on("connection", (socket) => {
  console.log(`Socket connected`, socket.id);
})

// Handle preflight requests

app.use("/", authRouter);
app.use("/refresh", require('./routes/refreshRouter'));
app.use(verifyJWT);
app.use("/admin", accessControl.adminAccess, admin_route)
app.use("/user", accessControl.userAccess, user_router);
app.use('/chef', accessControl.chefAccess, chef_route)
