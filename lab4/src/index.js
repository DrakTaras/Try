const bodyParser = require("body-parser");
const express = require("express");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
require('./db/mongoose')
const userModel = require("./models/user");
const taskModel = require("./models/task");
const auth = require('./middleware/auth')

app.get("/users",(req,res)=>{
    userModel.find({}).then((users)=>{
        res.status(200).send(users);
    }).catch((error)=>{
        res.status(400).send();
    });
})
app.post("/users/login", async (req, res) => {
    try{
        const user = await userModel.findOneByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({user, token});
    }
    catch (e) {
        res.status(400).send(e.message);
    }
});
app.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
});
app.post("/user/add",  async(req, res)=>{
    let name = req.body.name;
    console.log( req.body.name)
    let age = req.body.age;
    let email = req.body.email;
    let password = req.body.password;
    const user = new userModel({name: name, age: age, email: email, password: password});
    try {
        const token = await user.generateAuthToken();
        await user.save().then(() => {
            console.log(user);
            res.status(200).send({user, token});
        }).catch((error) => {
            res.status(500).send(error);
        });
    }catch (e) {
        res.status(500).send(e);
    }

});

app.use("/user-update/:id",async (req, res) =>{
    const user = await userModel.findById(req.params.id);
    try {
        const updates = ['name', 'email',  'password','age'];
        updates.forEach((update) => user[update] = req.body[update]);
        await user.save();
        res.send(user);
    }catch (e) {
        res.status(500).send(e);
    }
});

app.get('/user/:id', async (req, res) => {
    const id = req.params.id
    try {
        if (!id) {
            throw new Error()
        }
        const result = await userModel.findOne({ _id: id })
        res.send(result)
    } catch {
        res.send({ code: 404, message: 'Not found' })
    }
})
app.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token;
        });
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send(e.message);
    }
});
app.get("/tasks",(req,res)=>{
    taskModel.find({}).then((tasks)=>{
        res.status(200).send(tasks);
    }).catch((error)=>{
        res.status(500).send();
    });
})

app.get('/task/:id', async (req, res) => {
    const id = req.params.id

    try {
        if (!id) {
            throw new Error()
        }

        const result = await taskModel.findOne({ _id: id })

        res.send(result)
    } catch {
        res.send({ code: 404, message: 'Not found' })
    }
})

app.post("/task/add",  (req, res)=>{
    let description = req.body.description;
    let completed = req.body.completed;
    const task = new taskModel({description: description, completed: completed});
    try {
        task.save().then((task) => {
            res.status(200).send(task);
        }).catch((error) => {
            res.status(500).send(error);
        });
    }catch (e) {
        res.status(500).send(e);
    }

});


app.listen(3000);
