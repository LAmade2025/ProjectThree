document.addEventListener('DOMContentLoaded', function () {
  let currentQuiz = null;
  let currentQuestion = null;
  let userScore = 0;
  let userName = "";

  const startQuizForm = document.getElementById('startQuizForm');
  startQuizForm.addEventListener('submit', handleStartQuiz);

  async function loadQuizData() {
      try {
          const response = await fetch(`http://localhost:3000/quizzes`);
          if (!response.ok) {
              throw new Error(`Failed to fetch quiz data: ${response.status}`);
          }
          return await response.json();
      } catch (error) {
          console.error("Failed to fetch quiz data:", error);
          return null;
      }
  }

  async function handleStartQuiz(event) {
      event.preventDefault();

      userName = document.getElementById('userName').value;

      try {
          currentQuiz = await loadQuizData();

          if (currentQuiz) {
              showQuizView();
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
      renderQuestion();
  }

  function renderQuestion() {
      if (!currentQuiz || !currentQuiz.questions.length) {
          console.error("No questions available");
          return;
      }

      currentQuestion = currentQuiz.questions.shift(); // Remove the first question from the list

      const quizViewData = {
          title: currentQuiz.title,
          question: currentQuestion.question,
          answers: currentQuestion.answers,
      };

      const quizViewHTML = generateQuizViewHTML(quizViewData);
      document.getElementById('question-area').innerHTML = quizViewHTML;

      const submitAnswerButton = document.getElementById('submitButton');
      submitAnswerButton.addEventListener('click', handleAnswerSubmission);
  }

  function generateQuizViewHTML(data) {
      const source = document.getElementById('quiz-view-template').innerHTML;
      const template = Handlebars.compile(source);
      return template(data);
  }

  function handleAnswerSubmission(event) {
      event.preventDefault(); 

      const selectedAnswer = document.querySelector('input[name="answer"]:checked');
      if (!selectedAnswer) {
          console.error("No answer selected");
          return;
      }

      const userAnswer = selectedAnswer.value;

      if (userAnswer) {
          const isCorrect = checkAnswer(userAnswer, currentQuestion.answers);
          if (isCorrect) {
              userScore++;
          }

          showAnswerFeedback(isCorrect);

          if (currentQuiz.questions.length > 0) {
              renderQuestion(); // Render the next question
          } else {
              // Handle end of quiz (e.g., show final result)
          }
      }
  }

  function checkAnswer(userAnswer, correctAnswers) {
      for (const answer of correctAnswers) {
          if (answer.text === userAnswer && answer.correct) {
              return true;
          }
      }
      return false;
  }

  
  function showAnswerFeedback(isCorrect) {
      
  }
});
