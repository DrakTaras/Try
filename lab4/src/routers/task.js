const bodyParser = require("body-parser");
const express = require("express");
const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
require('../db/mongoose')
const taskModel = require("../models/task");
const userModel = require("../models/user");
const auth = require('../middleware/auth')
router.get('/test-task',(req,res)=>{
    res.send("From a new Task")
})
router.get("/tasks",auth,async (req,res)=>{
    taskModel.find({}).then((tasks)=>{
        res.status(200).send(tasks);
    }).catch((error)=>{
        res.status(500).send();
    });
})
router.get("/my-tasks",auth,async (req,res)=>{
    const user = req.user;
    await user.populate('tasks').execPopulate();
    res.send(user.tasks);
})

router.get('/task/:id',auth,async (req, res) => {
    try
    {
        let taskId = req.params.id;
        const task = await taskModel.findById(taskId);
        await task.populate('owner').execPopulate();
        if (task.owner.id === req.user.id){
            res.send(task.owner);
        }else{
            res.status(404).send("It's not your task")
        }
    } catch {
        res.send({ code: 404, message: 'Not found' })
    }


})

router.post("/task/add",auth,async  (req, res)=>{
    const task = new taskModel({
        ...req.body,
        owner: req.user.id
    });
    try {
        await task.save();
        res.status(201).send(task);
    }catch (e) {
        res.status(500).send(e);
    }


});

router.use("/task-update/:id", auth,  async (req, res) =>{
    let taskId = req.params.id;
    const task = await taskModel.findById(taskId);
    await task.populate('owner').execPopulate();
    if (task.owner.id === req.user.id){
        const updates = ['description', 'completed'];
        updates.forEach((update) => task[update] = req.body[update]);
        await task.save();
        res.send(task);
    }else{
        res.status(404).send("It's not your task")
    }
});

module.exports = router;
