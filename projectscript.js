document.addEventListener('DOMContentLoaded', function () {
    let quizData = null;
    let currentQuestionIndex = 0;
    let currentQuizIndex = 0;
    let userScore = 0;
    let userName = "";
    let startTime = null;
    let endTime = null;
    let elapsedTime = 0;
    let totalQuestions = 0;

    const startQuizForm = document.getElementById('startQuizForm');
    startQuizForm.addEventListener('submit', handleStartQuiz);

    async function loadQuizData() {
        try {
            console.log("Loading quiz data...");
            const response = await fetch(`https://my-json-server.typicode.com/LAmade2025/Milestone3Project/quizzes`);
            if (!response.ok) {
                throw new Error(`Failed to fetch quiz data: ${response.status}`);
            }
            const data = await response.json();
            console.log("Quiz data:", data);
            if (!data || !Array.isArray(data)) {
                throw new Error("Invalid quiz data format");
            }
            return data;
        } catch (error) {
            console.error("Error fetching quiz data:", error);
            return null;
        }
    }

    async function handleStartQuiz(event) {
        event.preventDefault();
        console.log("Starting quiz...");

        userName = document.getElementById('userName').value;

        try {
            quizData = await loadQuizData();

            if (quizData) {
                showQuizView();
                startTime = new Date();
            } else {
                console.error("Failed to load quiz data");
            }
        } catch (error) {
            console.error("Error fetching quiz data:", error);
        }
    }

    function showQuizView() {
        document.getElementById('starting-page').style.display = 'none';
        document.getElementById('quiz-view').style.display = 'block';
        totalQuestions = countTotalQuestions();
        renderQuestion();
    }

    function renderQuestion() {
        const currentQuiz = quizData[currentQuizIndex];
        if (!currentQuiz) {
            console.error("No quiz available");
            return;
        }

        const currentQuestion = currentQuiz.questions[currentQuestionIndex];
        if (!currentQuestion) {
            console.error("Invalid question format");
            return;
        }

        const quizViewData = {
            title: currentQuiz.title,
            question: currentQuestion.question,
            answers: currentQuestion.answers,
        };

        const quizViewHTML = generateQuizViewHTML(quizViewData);
        document.getElementById('question-area').innerHTML = quizViewHTML;

        updateScoreboard();

        const submitAnswerButton = document.getElementById('submitButton');
        submitAnswerButton.addEventListener('click', handleAnswerSubmission);

        const nextQuestionButton = document.getElementById('nextQuestionButton');
        nextQuestionButton.removeEventListener('click', goToNextQuestion); // Remove existing event listener
        nextQuestionButton.addEventListener('click', goToNextQuestion);
    }

    function generateQuizViewHTML(data) {
        let html = `<h3>${data.title}</h3>`;
        html += `<p>${data.question}</p>`;
        data.answers.forEach((answer, index) => {
            html += `<input type="radio" name="answer" value="${answer.text}" id="answer${index}">
                     <label for="answer${index}">${answer.text}</label><br>`;
        });
        return html;
    }

    function handleAnswerSubmission(event) {
        event.preventDefault(); 

        const selectedAnswer = document.querySelector('input[name="answer"]:checked');
        if (!selectedAnswer) {
            console.error("No answer selected");
            return;
        }

        const userAnswer = selectedAnswer.value;
        const currentQuiz = quizData[currentQuizIndex];
        const currentQuestion = currentQuiz.questions[currentQuestionIndex];

        if (userAnswer && checkAnswer(userAnswer, currentQuestion.answers)) {
            userScore++;
            showFeedbackMessage("Brilliant!");
        } else {
            showFeedbackMessage("Incorrect!");
        }
    }

    function showFeedbackMessage(message) {
        const feedbackArea = document.getElementById('feedback-area');
        feedbackArea.textContent = message;
        feedbackArea.style.display = 'block';

        
        setTimeout(function() {
            feedbackArea.style.display = 'none';
            renderQuestion(); 
        }, 1000);
    }

    function goToNextQuestion(event) {
        event.preventDefault(); 
        currentQuestionIndex++;
        if (currentQuestionIndex < quizData[currentQuizIndex].questions.length) {
            renderQuestion();
        } else {
            endTime = new Date(); 
            showEndOfQuiz();
        }
    }

    function checkAnswer(userAnswer, correctAnswers) {
        
        const userAnswerBool = userAnswer.toLowerCase() === 'true';

       
        return correctAnswers.some(answer => answer.correct === userAnswerBool);
    }

    function countTotalQuestions() {
        let count = 0;
        quizData.forEach(quiz => {
            count += quiz.questions.length;
        });
        return count;
    }

    function updateScoreboard() {
        const scoreboard = document.getElementById('scoreboard');
        const questionsAnswered = currentQuestionIndex + 1;
        const totalQuestionsInQuiz = quizData[currentQuizIndex].questions.length;
        const totalQuestions = Math.min(totalQuestionsInQuiz, 6); 
        const currentTime = new Date();
        elapsedTime = Math.floor((currentTime - startTime) / 1000); 
        scoreboard.innerHTML = `
            <p>Question's Answered ${questionsAnswered} / 6</p>
            <p>Elapsed Time: ${elapsedTime} seconds</p>
            <p> Score ${userScore} / 6</p>
        `;
    }

    function showEndOfQuiz() {
        const finalResult = document.getElementById('final-result');
        const resultMessage = document.getElementById('result-message');

        updateScoreboard(); 

        if (userScore / 6 >= 0.8) {
            resultMessage.textContent = `Congratulations ${userName}! You pass the quiz`;
        } else {
            resultMessage.textContent = `Sorry ${userName}, you fail the quiz`;
        }

        finalResult.style.display = 'block';
    }
});
