console.log('index js');
import generateWordCloud from "./wordCloud.js";
const askBtn = document.getElementById('askBtn');
const questionInput = document.getElementById('questionInp');
const API_URL = 'http://localhost:8080';
const formContainer = document.querySelector(".form-container");
const wordCloudContainer = document.querySelector('.wordCloud');
let listening = false;
let question = "";
let allResponses = [];
//Event Listeners
askBtn.addEventListener('click', askQuestion)
let prevQuestion = "";

sseQues();
sseAns();
function sseQues() {
    if (!listening) {
        const event = new EventSource("/api/question");

        event.onmessage = async (event) => {
            question = JSON.parse(event.data);
            if (question !== null) {
                prevQuestion = question._id;
                if (isGuest()) {
                    const answer = prompt(question.question);
                    if (!!answer) {
                        await postAnswer(answer);
                    }
                }
            }
        }
        event.onerror = (event) => {
            console.log(event)
        }
    }
}

function sseAns() {
    let answer;
    if (!listening) {
        const event = new EventSource("/api/answers");

        event.onmessage = (event) => {
            answer = JSON.parse(event.data);
            if (!!answer) {
                if (prevQuestion === answer.questionID) {
                    wordCloudContainer.innerHTML = "";
                    allResponses.push(answer.answer);
                    generateWordCloud(allResponses);
                } else {
                    allResponses = [];
                }
            }
        }
    }
}

async function postAnswer(answer) {
    try {
        const response = await fetch("/api/answer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                answer
            })
        });
        const answers = await response.json();
    } catch (err) {
        console.log("Error: ", err);
    }
}

function isGuest() {
    const role = window.location.search.trim().split('role=')[1];
    if (role === "guest") {
        formContainer.style.display = "none";
        return 1;
    }
    return 0;
}
async function askQuestion() {
    try {
        const questionVal = questionInput.value.trim();
        const response = await fetch("/api/ask", {
            method: 'POST',
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
                question: questionVal
            })
        });
        const data = await response.json();
        questionInput.value = '';
    } catch (err) {
        console.log('Error : ', err)
    }
}