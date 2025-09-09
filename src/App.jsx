import React, { useState, useEffect } from "react";
import topicsData from "./data.json";

function App() {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [filteredQuizData, setFilteredQuizData] = useState([]);
  const [activeTopic, setActiveTopic] = useState(null);
  const [questionStatuses, setQuestionStatuses] = useState({}); // New state for question statuses
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    if (topicsData.length > 0) {
      initializeQuiz(topicsData[0].questions, topicsData[0].topicName);
    }
  }, []);

  useEffect(() => {
    if (filteredQuizData.length > 0 && Object.keys(questionStatuses).length === filteredQuizData.length) {
      const allAnsweredOrSkipped = filteredQuizData.every(q => 
        questionStatuses[q.id] === 'correct' || 
        questionStatuses[q.id] === 'incorrect' || 
        questionStatuses[q.id] === 'skipped'
      );
      if (allAnsweredOrSkipped) {
        setQuizFinished(true);
      }
    }
  }, [questionStatuses, filteredQuizData]);

  const initializeQuiz = (questions, topicName) => {
    setFilteredQuizData(questions);
    setCurrentQ(0);
    setSelected(null);
    setShowAnswer(false);
    setActiveTopic(topicName);
    setCorrectCount(0);
    setIncorrectCount(0);
    setSkippedCount(0);
    setQuizFinished(false);
    const initialStatuses = {};
    questions.forEach(q => {
      initialStatuses[q.id] = 'not_attempted';
    });
    setQuestionStatuses(initialStatuses);
  };

  const setTopic = (topic) => {
    initializeQuiz(topic.questions, topic.topicName);
  };


  const handleOptionClick = (option) => {
    if (selected !== null || quizFinished) return; // Prevent changing answer after selection or if quiz is finished

    setSelected(option);
    const isCorrect = option === filteredQuizData[currentQ].answer;
    setQuestionStatuses(prevStatuses => {
      const newStatus = isCorrect ? 'correct' : 'incorrect';
      if (prevStatuses[filteredQuizData[currentQ].id] === 'not_attempted') {
        if (isCorrect) {
          setCorrectCount(prev => prev + 1);
        } else {
          setIncorrectCount(prev => prev + 1);
        }
      }
      return {
        ...prevStatuses,
        [filteredQuizData[currentQ].id]: newStatus
      };
    });
    setShowAnswer(!isCorrect);
  };

  const navigateQuestion = (direction) => {
    if (quizFinished) return;

    const nextQ = currentQ + direction;
    if (nextQ >= 0 && nextQ < filteredQuizData.length) {
      // If the current question was not attempted, mark it as skipped if navigating away
      if (questionStatuses[filteredQuizData[currentQ].id] === 'not_attempted' && direction === 1) {
        setQuestionStatuses(prevStatuses => ({
          ...prevStatuses,
          [filteredQuizData[currentQ].id]: 'skipped'
        }));
        setSkippedCount(prev => prev + 1);
      }
      setCurrentQ(nextQ);
      setSelected(null);
      setShowAnswer(false);
    } else if (nextQ === filteredQuizData.length && direction === 1) {
      // Reached the end of the quiz for the current topic
      setQuizFinished(true);
    }
  };

  const nextQuestion = () => navigateQuestion(1);
  const prevQuestion = () => navigateQuestion(-1);
  const skipQuestion = () => {
    if (questionStatuses[filteredQuizData[currentQ].id] === 'not_attempted') {
      setQuestionStatuses(prevStatuses => ({
        ...prevStatuses,
        [filteredQuizData[currentQ].id]: 'skipped'
      }));
      setSkippedCount(prev => prev + 1);
    }
    navigateQuestion(1);
  };

  const restartQuiz = () => {
    const currentTopic = topicsData.find(topic => topic.topicName === activeTopic);
    if (currentTopic) {
      initializeQuiz(currentTopic.questions, currentTopic.topicName);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', background: '#f3f4f6' }}>
      <div style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
        {topicsData.map((topic, index) => (
          <button
            key={index}
            onClick={() => setTopic(topic)}
            style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: activeTopic === topic.topicName ? '#3b82f6' : '#6b7280', color: 'white', cursor: 'pointer' }}
            disabled={quizFinished}
          >
            {topic.topicName} ({topic.startId}-{topic.endId})
          </button>
        ))}
      </div>

      {filteredQuizData.length > 0 ? (
        quizFinished ? (
          <div style={{ background: 'white', padding: 24, borderRadius: 20, boxShadow: '0 2px 16px #0001', width: 400, textAlign: 'center' }}>
            <h2 style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>Quiz Completed!</h2>
            <p style={{ fontSize: 18, marginBottom: 8 }}>Total Questions: {filteredQuizData.length}</p>
            <p style={{ fontSize: 18, color: '#22c55e', marginBottom: 8 }}>Correct Answers: {correctCount}</p>
            <p style={{ fontSize: 18, color: '#fca5a5', marginBottom: 8 }}>Incorrect Answers: {incorrectCount}</p>
            <p style={{ fontSize: 18, color: '#f59e42', marginBottom: 24 }}>Skipped Questions: {skippedCount}</p>
            <button
              onClick={restartQuiz}
              style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', borderRadius: 8, border: 'none', cursor: 'pointer' }}
            >
              Restart Quiz
            </button>
          </div>
        ) : (
          <div style={{ background: 'white', padding: 24, borderRadius: 20, boxShadow: '0 2px 16px #0001', width: 400 }}>
            <h2 style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>
              Question {currentQ + 1} of {filteredQuizData.length}
            </h2>
            <p style={{ marginBottom: 16 }}>{filteredQuizData[currentQ].question}</p>
            <div style={{ marginBottom: 16 }}>
              {filteredQuizData[currentQ].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(option)}
                  disabled={selected !== null}
                  style={{
                    width: '100%',
                    padding: 8,
                    borderRadius: 8,
                    border: '1px solid #ccc',
                    marginBottom: 8,
                    background:
                      selected === option
                        ? option === filteredQuizData[currentQ].answer
                          ? '#86efac'
                          : '#fca5a5'
                        : '#f3f4f6',
                    cursor: selected !== null ? 'not-allowed' : 'pointer',
                    fontWeight: selected === option ? 'bold' : 'normal',
                  }}
                >
                  {option}
                </button>
              ))}
            </div>

            {showAnswer && (
              <p style={{ color: '#dc2626', marginTop: 12 }}>
                ❌ Wrong! Correct Answer: <b>{filteredQuizData[currentQ].answer}</b>
                <br />
                <span style={{ color: '#4b5563', fontSize: 14 }}>{filteredQuizData[currentQ].explanation}</span>
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
              <button
                onClick={prevQuestion}
                disabled={currentQ === 0}
                style={{ padding: '8px 16px', background: currentQ === 0 ? '#d1d5db' : '#3b82f6', color: 'white', borderRadius: 8, border: 'none', cursor: currentQ === 0 ? 'not-allowed' : 'pointer' }}
              >
                Previous
              </button>
              <button
                onClick={skipQuestion}
                disabled={currentQ === filteredQuizData.length - 1 && questionStatuses[filteredQuizData[currentQ].id] !== 'not_attempted'}
                style={{ padding: '8px 16px', background: '#f59e42', color: 'white', borderRadius: 8, border: 'none', cursor: 'pointer' }}
              >
                Skip
              </button>
              <button
                onClick={nextQuestion}
                disabled={currentQ === filteredQuizData.length - 1 && questionStatuses[filteredQuizData[currentQ].id] !== 'not_attempted'}
                style={{ padding: '8px 16px', background: (currentQ === filteredQuizData.length - 1 && questionStatuses[filteredQuizData[currentQ].id] !== 'not_attempted') ? '#d1d5db' : '#22c55e', color: 'white', borderRadius: 8, 'border': 'none', cursor: (currentQ === filteredQuizData.length - 1 && questionStatuses[filteredQuizData[currentQ].id] !== 'not_attempted') ? 'not-allowed' : 'pointer' }}
              >
                Next
              </button>
            </div>
          </div>
        )
      ) : (
        <p style={{ color: '#4b5563', fontSize: 18 }}>No questions available for this topic.</p>
      )}
    </div>
  );
}

export default App;
