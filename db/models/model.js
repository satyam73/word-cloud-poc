const mongoose = require('mongoose');


const QuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    isNew: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });


const answerSchema = new mongoose.Schema({
    answer: {
        type: String,
        required: true,
    },
    count: {
        type: Number,
        default: 1
    },
    questionID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Question"
    },

}, { timestamps: true })

const Question = new mongoose.model("Question", QuestionSchema);
const Answer = new mongoose.model("Answer", answerSchema);

module.exports = { Question, Answer };
