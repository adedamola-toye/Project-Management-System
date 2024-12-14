//Import dotenv library so we can store sensitive info in a .env file to keep it safe
//,config() loads the environmenttal variables from the .env file into process.env file so we can access the variables defined in the .env file
require("dotenv").config();
/* console.log("Environment Variables Loaded: ", process.env);
console.log("Database URL: ", process.env.DATABASE_URL);
console.log("Port set in .env: ", process.env.PORT); */

//Import express library to create a web server (important to set up routes and handle requests)
const express = require("express");

//import  CORS library - allows server to accepts requests from different  websites(like the React app)
const cors = require("cors");


//import morgan to print out requests coming into our server
const morgan = require("morgan");





//Create an express app (the main server)
const app = express();

//Use the morgan library to log all the incoming requests to the server in a dev format
app.use(morgan("dev"));

//Tell express to automatically parse incoming JSON data so the server will understand the data without it crashing when trying to handle requests that send JSON
app.use(express.json());

//Use the cors library to allow server to handle requests from different websites
app.use(cors());
app.use(cors({
  origin: 'http://localhost:5173',  // Only allow requests from your frontend
  methods: ['GET', 'POST', 'DELETE', 'PUT'],  // Allow only GET and POST methods
  allowedHeaders: ['Content-Type', 'Authorization'],  // Allow specific headers
  credentials: true,  // If you are using cookies or other credentials
}));



//Set up a route that listens for GET requests from the root URL(/). So when we visit this route the server will respond by sending the message.
//app.METHOD(PATH, HANDLER)
app.get("/api/", (req, res) => {
  res.send("Express server is running");
});

//Sets the port number for the server. process.env.PORT looks for a port number from the .env file but if there isn't, it sets the default PORT number to 3000
const PORT = process.env.PORT || 3000;

//Routes
const usersRoutes = require('./src/routes/usersRoutes')
//const tasksRoutes = require('./src/routes/tasksRoutes')
const projectsRoutes = require('./src/routes/projectsRoutes')
const authRoutes = require('./src/routes/authRoutes')
const projectRoleRoutes = require('./src/routes/projectRoleRoutes')
app.use('/api/users', usersRoutes)
//app.use('/api/tasks', tasksRoutes)
app.use('/api/projects', projectsRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/project-roles', projectRoleRoutes)

//Start the server and tell it to listen for requests on the PORT defined. When server is running, it will run the function
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
