const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: String,
  code: String,
  answer: String
});

const Question = mongoose.model('questions', questionSchema);

module.exports = Question;
