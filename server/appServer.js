const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const questionModel = require("./model/questionModel");

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const mongoURI = "mongodb+srv://chenrussotask:LianBar1@moveohometask.rqlck7m.mongodb.net/ProgrammingQuestions"

// Variable to store the first connected user's socket ID
let firstSocketIdConnected = null;
// Port number
let serverPort = 3001;

async function connectToMongoDB() {
  try {
    console.log('Connecting to MongoDB');
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

io.on('connection', (socket) => {

  if (firstSocketIdConnected === null) {
    firstSocketIdConnected = socket.id;
  }

  socket.on('send_message', (data) => {
    io.emit('receive_message', data);
  });

  socket.on('typing', () => {
    socket.broadcast.emit('user_typing', { id: socket.id });
  });

  socket.on('stop_typing', () => {
    socket.broadcast.emit('user_stop_typing', { id: socket.id });
  });

  socket.on('get_all_questions', async (data) => {
    try {
      const questions = await getQuestions();
      // Send questions to the client who requested
      socket.emit('send_questions', questions);
    } catch (error) {
      console.error('Error getting questions:', error);
    }
  });

  socket.on('is_first_user', () => {
    socket.emit('receive_is_first_user', socket.id === firstSocketIdConnected);
  });

  socket.on("question_answer",async (id)=>{
    try {
      const questionsAnswer = await getQuestionAnswerById(id);
      socket.emit('send_question_answer', questionsAnswer);  // Send questions to the client who requested
    } catch (error) {
      console.error('Error getting questions:', error);
    }
  })

  socket.on('request_question_code', async (id) => {
    try {
      const questionById = await getQuestionCodeById(id);
      socket.emit('send_question_code', { question: questionById });
    } catch (error) {
      console.error('Error getting question code:', error);
      socket.emit('error', { message: 'Error getting question code' });
    }
  });

});

(async () => {
  await connectToMongoDB();
  server.listen(serverPort, () => {
    console.log('Server is running on port ' + serverPort);
  });
})();

const getQuestions = async () => {
  try {
    // Get all the questions from the database
    return await questionModel.find({});
  } catch (error) {
    console.error('Error retrieving questions:', error);
  }
};

const getQuestionCodeById = async (id) => {
  try {
    // Get all the questions from the database
    return await questionModel.findById(id);
  } catch (error) {
    console.error('Error retrieving questions:', error);
  }
};

const getQuestionAnswerById = async (id) => {
  try {
    // Get all the questions from the database
    const question = await questionModel.findById(id);
    return question.answer;
  } catch (error) {
    console.error('Error retrieving questions:', error);
  }
};





