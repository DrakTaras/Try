const bodyParser = require("body-parser");
const express = require("express");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
require('./db/mongoose')
const auth = require('./middleware/auth')
const UserRouter = require('./routers/user')
const taskRouter = require("./routers/task");

app.use(UserRouter);
app.use(taskRouter)

app.listen(3000);
