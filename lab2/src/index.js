require('./db/mongoose')
const express = require("express")
const app = express()
const User = require("./models/user")
const Task = require("./models/task")

const user = new User({name: 'Alex', email: 'alex@gmail.com', age: 19, password: 'smth_here'})

user.save().then(() => {
    console.log(user);
}).catch((error) => {
    console.log(error);
});



const task = new Task({description: "some task", completed: true});

task.save().then(() => {
    console.log(task);
}).catch((error) => {
    console.log(error);
});

app.get("/users", (req, res) => {
    User.find({}).then((users) => {
        res.status(200).send(users);
    }).catch((error) => {
        res.status(500).send();
    });
});

app.get("/users/:id", (req, res) => {
    User.findById(req.params.id).then((users) => {
        res.status(200).send(users);
    }).catch((error) => {
        res.status(500).send();
    });
});

app.post("/users", async (req, res) => {
    const user = new User({name: req.query.name, email: req.query.email, age: req.query.age, password: req.query.password})

    await user.save().then(() => {
        res.status(201).send(user);
    }).catch((error) => {
        res.status(500).send;
    });
});

app.get("/tasks", (req, res) => {
    Task.find({}).then((tasks) => {
        res.status(200).send(tasks);
    }).catch((error) => {
        res.status(500).send();
    });
});

app.get("/tasks/:id", (req, res) => {
    Task.findById(req.params.id).then((tasks) => {
        res.status(200).send(tasks);
    }).catch((error) => {
        res.status(500).send();
    });
});

app.post("/tasks", async (req, res) => {
    const task = new Task({description: req.query.description, completed: req.query.completed})

    await task.save().then(() => {
        res.status(201).send(task);
    }).catch((error) => {
        res.status(500).send;
    });
});

//!!! Захист

app.delete("/tasks/:id", (req, res) => {
    Task.findByIdAndDelete(req.params.id).then((tasks) => {
        res.status(200).send(tasks);
    }).catch((error) => {
        res.status(500).send();
    });
});

app.delete("/users/:id", (req, res) => {
    User.findByIdAndDelete(req.params.id).then((users) => {
        res.status(200).send(users);
    }).catch((error) => {
        res.status(500).send();
    });
});

//!!!

app.listen(3001, () => {
    console.log("Server is listening")
});
