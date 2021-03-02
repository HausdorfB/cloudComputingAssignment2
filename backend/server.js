const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const todoRoutes = express.Router();
const PORT = 4000;
const sgMail = require("@sendgrid/mail");
const dotenv = require("dotenv");
const sendgrid = require("sendgrid");

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
let Todo = require("./list.model");

app.use(cors());
app.use(bodyParser.json());

//initialize database for saving
mongoose.connect("mongodb://127.0.0.1:27017/todos", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
const connection = mongoose.connection;

console.log({ key: process.env.SENDGRID_API_KEY }); // key => ?
connection.once("open", function () {
  console.log("MongoDB database connection established successfully");
});

//Create root method which will be used for main page
todoRoutes.route("/").get(function (req, res) {
  Todo.find(function (err, todos) {
    if (err) {
      console.log(err);
    } else {
      res.json(todos);
    }
  });
});

todoRoutes.route("/:id").get(function (req, res) {
  let id = req.params.id;
  Todo.findById(id, function (err, todo) {
    res.json(todo);
  });
});

//create a handle for adding locations to the database
todoRoutes.route("/add").post(function (req, res) {
  let todo = new Todo(req.body);
  console.log(req.body.todo_email);
  todo
    .save()
    .then((todo) => {
      res.status(200).json({ todo: "todo added successfully" });
    })
    .catch((err) => {
      res.status(400).send("adding new todo failed");
    });

  //send grid setup and formating
  const msg = {
    to: req.body.todo_email, // recipient
    from: "bretthausdorf@gmail.com", // sender
    subject: "New Location saved!",
    text: "and easy to do anywhere, even with Node.js",
    html:
      "Street Name: " +
      req.body.todo_description +
      "<br>" +
      "City: " +
      req.body.todo_responsible +
      "<br>" +
      "Travel Priority: " +
      req.body.todo_priority +
      "<br>",
  };
  //send message using above format
  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
});

//create function for updating location sets in database
todoRoutes.route("/update/:id").post(function (req, res) {
  Todo.findById(req.params.id, function (err, todo) {
    if (!todo) res.status(404).send("data is not found");
    else todo.todo_description = req.body.todo_description;
    todo.todo_responsible = req.body.todo_responsible;
    todo.todo_priority = req.body.todo_priority;
    todo.todo_email = req.body.todo_email;
    todo.todo_completed = req.body.todo_completed;

    todo
      .save()
      .then((todo) => {
        res.json("Todo updated");
      })
      .catch((err) => {
        res.status(400).send("Update not possible");
      });
  });
});

todoRoutes.route("/delete/:id").delete(function (req, res) {
  Todo.findByIdAndRemove(req.params.id, function (err, todo) {
    if (err) {
      console.log(err);
    } else {
      res.json(todo);
    }
  });
});

app.use("/todos", todoRoutes);

app.listen(PORT, function () {
  console.log("Server is running on Port: " + PORT);
});
