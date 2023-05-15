const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

//rabiulahsan64

//bb0LOeeuUti5QZYQ

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_KEY}@cluster0.9ylecqg.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    //databases collection
    const studentCollection = client.db("attendance").collection("students");

    const classCollection = client.db("attendance").collection("classes");

    const attendanceCollection = client
      .db("attendance")
      .collection("attendance-data");

    //get class data
    app.get("/home", async (req, res) => {
      const cursor = classCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //get specific class details and attendance
    app.get("/home/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { batch: id };
      const result = await classCollection.findOne(query);
      res.send(result);
    });

    //get students data from studentcollection
    app.get("/students", async (req, res) => {
      const cursor = studentCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //post the attendance value
    app.put("/home/:id", async (req, res) => {
      const attendance = req.body;

      const batch = req.body.batchCode;
      const date = req.body.date;
      const email = req.body.email;
      console.log(batch, email, date);

      const filter = { date: date, batchCode: batch, email: email };
      const options = { upsert: true };

      const updatedAttendance = {
        $set: {
          ...attendance,
        },
      };
      const result = await attendanceCollection.updateOne(
        filter,
        updatedAttendance,
        options
      );
      res.send(result);
    });

    // app.post("/attendances", async (req, res) => {
    //   const attendance = req.body;
    //   const result = await attendanceCollection.insertOne(attendance);
    //   res.send(result);
    // });

    //get data by multiple query
    app.get("/attendances", async (req, res) => {
      // console.log(req.query);

      let query = {};
      if (req.query?.email) {
        if (req.query?.date) {
          if (req.query?.batchCode) {
            query = {
              email: req.query.email,
              date: req.query.date,
              batchCode: req.query.batchCode,
            };
          }
        }
      }
      const cursor = attendanceCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(` ${port}`);
});
