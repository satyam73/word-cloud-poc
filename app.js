console.log('Backend starting!');
require("dotenv").config()
const express = require('express');
const app = express();
const path = require("path");
const staticPath = path.join(__dirname, "/public");
const connectDB = require('./db/conn');
const cors = require('cors');
const PORT = 8080 || process.env.PORT;
const { Question, Answer } = require('./db/models/model');
connectDB();
console.log("this is the static path ", staticPath)

// middlewares
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(staticPath))
app.use('/js', express.static(path.join(__dirname, '/public/js')));
app.use('/css', express.static(path.join(__dirname, '/public/css')));
let clients = [];
let ansClients = [];
app.get('/', (req, res) => {
    res.status(200).send("index");
})

// send data functions
function sendQuesToAll(newQues, res) {
    (async () => {
        newQues.isNew = false;
        await newQues.save();
    })();
    clients.forEach(client => client.res.write(`data: ${JSON.stringify(newQues)}\n\n`))

    res.status(201).send({
        response: "ok",
        id: newQues._id
    });
}

function sendAnswersToAll(newAns, res) {
    ansClients.forEach(client => client.res.write(`data: ${JSON.stringify(newAns)}\n\n`))
    res.status(201).send({
        response: "ok",
        id: newAns._id
    });
}


app.post('/api/ask', async (req, res) => {
    try {
        const question = req.body.question;
        if (!question) {
            return res.status(400).json({
                response: "Question can't be null!"
            })
        }

        const ques = new Question({
            question
        })

        await ques.save();
        return sendQuesToAll(ques, res);
    } catch (err) {
        console.log('Error : ', err)
    }
})

app.get('/api/question', async (req, res) => {
    try {
        const question = await Question.findOne({ $and: [{ $natural: -1 }, { isNew: true }] });
        let data;

        const headers = {
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        };
        res.writeHead(200, headers);
        if (!question) {
            data = `data: null\n\n`;
        } else {
            data = `data: ${JSON.stringify(question)}\n\n`;
            question.isNew = false;
            await question.save();
        }
        res.write(data);

        const clientId = Date.now();

        const newClient = {
            id: clientId,
            res
        };

        clients.push(newClient);

        req.on('close', () => {
            console.log(`${clientId} Connection closed`);
            clients = clients.filter(client => client.id !== clientId);
        });

    } catch (err) {
        console.log('Error : ', err)
    }
})


app.post('/api/answer', async (req, res) => {
    try {
        const answer = req.body.answer;
        const question = await Question.findOne().sort({ $natural: -1 });
        const questionID = (question._id).toString();
        const answers = await Answer.find({ questionID: questionID })
        if (!answer) {
            return res.json({
                response: "Answer can't be null!"
            })
        }
        const isPresent = await Answer.findOne({ $and: [{ answer }, { questionID }] });
        if (isPresent) {
            isPresent.count += 1;
            await isPresent.save();
            return sendAnswersToAll(isPresent, res)
        } else {
            const newAnswer = new Answer({
                answer,
                questionID
            })
            await newAnswer.save();
            return sendAnswersToAll(newAnswer, res);
        }
    } catch (err) {
        console.log('Error : ', err);
    }
})


app.get('/api/answers', async (req, res) => {
    const question = await Question.findOne({ $natural: -1 });

    const headers = {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    };
    res.writeHead(200, headers);
    let data;
    let questionID;
    if (!question) {
        data = `data: null\n\n`;
    } else {
        questionID = (question._id).toString();
        let answer = await Answer.findOne({ questionID });
        data = `data: ${JSON.stringify(answer)}\n\n`;
    }

    res.write(data);

    const clientId = Date.now();

    const newClient = {
        id: clientId,
        res
    };
    ansClients.push(newClient);
    req.on('close', () => {
        console.log(`${clientId} Connection closed`);
        ansClients = ansClients.filter(client => client.id !== clientId);
    });
})

app.listen(PORT, async () => {
    console.log(`server started at ${PORT}`);
})


