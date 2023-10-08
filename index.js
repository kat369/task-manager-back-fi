const express = require("express");
const cors = require("cors");
const mongodb = require("mongodb");
const { json } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoClient = mongodb.MongoClient;
const app = express();
const URL =
    "mongodb+srv://kat369:Kathiravan1995@project-m-tool.xjuxrpd.mongodb.net/?retryWrites=true&w=majority";
const DB = "Task-m-tool";

let users = [];

app.use(express.json());
app.use(
    cors({
        origin: "*",
    })
);


let authenticate = (req, res, next) => {

    if (req.headers.authorization) {
        let decode = jwt.verify(req.headers.authorization, "qwertyuip")
        if (decode) {
            next()
        } else {
            res.status(401).json({ message: "unauthorized" })
        }

    } else {
        res.status(401).json({ message: "unauthorized" })
    }


};


app.post("/login", async function (req, res) {
    try {
        const connection = await mongoClient.connect(URL);

        const db = connection.db(DB);

        let user = await db.collection("employees").findOne({ email: req.body.email })
        if (user) {
            let compare = await bcrypt.compare(req.body.password, user.password)
            if (compare) {
                token = await jwt.sign({ _id: user._id }, "qwertyuip", { expiresIn: "1h" })
                user.token = token
                res.json(user)
            } else {
                res.status(401).json({ message: "login failed" })
            }
        } else {
            res.status(404).json({ message: "user not found" })
        }

        await connection.close();

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "try again later" });
    }
});


app.post("/createuser", async function (req, res) {
    console.log(req.body)
    try {
        const connection = await mongoClient.connect(URL);

        const db = connection.db(DB);

        const user = await db.collection("employees").findOne({ email: req.body.email })

        if (user) {
            res.json("User Already Exists")
        } else {
            let salt = await bcrypt.genSalt(10)
            let Hash = await bcrypt.hash(req.body.password, salt)
            req.body.password = Hash
            const newUser = await db.collection("employees").insertOne(req.body)
            res.json("User Created Sucessfully")
        }

        await connection.close();


    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "try again later" });
    }
});


app.post("/createproject", async function (req, res) {
    console.log(req.body)
    try {
        const connection = await mongoClient.connect(URL);

        const db = connection.db(DB);

        const project = await db.collection("projects").insertOne(req.body)

        await connection.close();

        res.json(project.insertedId)

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "try again later" });
    }
});

app.post("/setcompleteproject/:id", async function (req, res) {
    console.log(req.body)
    try {
        const connection = await mongoClient.connect(URL);

        const db = connection.db(DB);

        const project = await db.collection("projects").updateOne({ _id: new mongodb.ObjectId(req.params.id) }, { $set: { status: "completed" } })

        await connection.close();

        res.json(project.insertedId)

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "try again later" });
    }
});
app.post("/setdeleteproject/:id", async function (req, res) {
    console.log(req.body)
    try {
        const connection = await mongoClient.connect(URL);

        const db = connection.db(DB);

        const project = await db.collection("projects").updateOne({ _id: new mongodb.ObjectId(req.params.id) }, { $set: { status: "removed" } })

        await connection.close();

        res.json(project.insertedId)

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "try again later" });
    }
});
app.post("/setdeleteuser/:id", async function (req, res) {
    console.log(req.body)
    try {
        const connection = await mongoClient.connect(URL);

        const db = connection.db(DB);

        const project = await db.collection("employees").deleteOne({ _id: new mongodb.ObjectId(req.params.id) })

        await connection.close();

        res.json(project.insertedId)

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "try again later" });
    }
});
app.post("/createtask/:id", async function (req, res) {
    console.log(req.body)
    try {
        const connection = await mongoClient.connect(URL);

        const db = connection.db(DB);

        const user = await db.collection("projects").updateOne({ _id: new mongodb.ObjectId(req.params.id) }, { $push: { task: req.body } })

        await connection.close();

        res.json("Task Created Sucessfully")

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "try again later" });
    }
});


app.post("/updatetask/:id", async function (req, res) {
    console.log(req.body)
    try {
        const connection = await mongoClient.connect(URL);

        const db = connection.db(DB);

        const user = await db.collection("projects").updateOne({ _id: new mongodb.ObjectId(req.params.id), "task.task_id": req.body.task_id }, { $set: { "task.$": req.body } })

        await connection.close();

        res.json("Task Created Sucessfully")

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "try again later" });
    }
});


app.post("/deletetask/:id", async function (req, res) {
    console.log(req.params.id)
    try {
        const connection = await mongoClient.connect(URL);

        const db = connection.db(DB);

        const user = await db.collection("projects").updateOne({ _id: new mongodb.ObjectId(req.params.id) }, { $pull: { task: { task_id: req.body.task_id } } })

        await connection.close();

        res.json("Task Removed Sucessfully")

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "try again later" });
    }
});


app.get("/allusers", async function (req, res) {
    console.log(req.body)
    try {
        const connection = await mongoClient.connect(URL);

        const db = connection.db(DB);

        const users = await db.collection("employees").find({ status: "live" }).toArray()

        await connection.close();

        res.json(users)

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "try again later" });
    }
});


app.get("/getproject/:id", async function (req, res) {
    console.log(req.body)
    try {
        const connection = await mongoClient.connect(URL);

        const db = connection.db(DB);

        const project = await db.collection("projects").find({ _id: new mongodb.ObjectId(req.params.id) }).toArray()

        await connection.close();

        res.json(project[0])

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "try again later" });
    }
});



app.get("/liveprojects", async function (req, res) {
    console.log(req.body)
    try {
        const connection = await mongoClient.connect(URL);

        const db = connection.db(DB);

        const users = await db.collection("projects").find({ status: "live" }).toArray()

        await connection.close();

        res.json(users)

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "try again later" });
    }
});

app.get("/completedprojects", async function (req, res) {
    console.log(req.body)
    try {
        const connection = await mongoClient.connect(URL);

        const db = connection.db(DB);

        const users = await db.collection("projects").find({ status: "completed" }).toArray()

        await connection.close();

        res.json(users)

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "try again later" });
    }
});



app.get("/", async function (req, res) {
    try {
        res.json("Hello World...");
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "try again later" });
    }
});

app.listen(process.env.PORT || 3100);


