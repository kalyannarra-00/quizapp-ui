import React, { useState, useEffect } from "react";
import quizData from "./data.json";

function App() {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [filteredQuizData, setFilteredQuizData] = useState([]);
  const [activeTopic, setActiveTopic] = useState(null);
  const [questionStatuses, setQuestionStatuses] = useState({}); // New state for question statuses

  useEffect(() => {
    initializeQuiz(quizData, 'All Questions');
  }, []);

  const initializeQuiz = (data, topicName) => {
    setFilteredQuizData(data);
    setCurrentQ(0);
    setSelected(null);
    setShowAnswer(false);
    setActiveTopic(topicName);
    const initialStatuses = {};
    data.forEach(q => {
      initialStatuses[q.id] = 'not_attempted';
    });
    setQuestionStatuses(initialStatuses);
  };

  const setTopic = (startId, endId, topicName) => {
    const newFilteredData = quizData.filter(
      (q) => q.id >= startId && q.id <= endId
    );
    initializeQuiz(newFilteredData, topicName);
  };

  const handleOptionClick = (option) => {
    setSelected(option);
    const isCorrect = option === filteredQuizData[currentQ].answer;
    setQuestionStatuses(prevStatuses => ({
      ...prevStatuses,
      [filteredQuizData[currentQ].id]: isCorrect ? 'correct' : 'incorrect'
    }));
    setShowAnswer(!isCorrect);
  };

  const navigateQuestion = (direction) => {
    const nextQ = currentQ + direction;
    if (nextQ >= 0 && nextQ < filteredQuizData.length) {
      // If the current question was not attempted, mark it as skipped if navigating away
      if (questionStatuses[filteredQuizData[currentQ].id] === 'not_attempted' && direction === 1) {
        setQuestionStatuses(prevStatuses => ({
          ...prevStatuses,
          [filteredQuizData[currentQ].id]: 'skipped'
        }));
      }
      setCurrentQ(nextQ);
      setSelected(null);
      setShowAnswer(false);
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
    }
    navigateQuestion(1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', background: '#f3f4f6' }}>
      <div style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
        <button
          onClick={() => setTopic(1, 50, 'Organisations and headquarter')}
          style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: activeTopic === 'Organisations and headquarter' ? '#3b82f6' : '#6b7280', color: 'white', cursor: 'pointer' }}
        >
          Organisations and headquarter (1-50)
        </button>
        <button
          onClick={() => setTopic(51, 100, 'Bilateral excercises between india and other countries')}
          style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: activeTopic === 'Bilateral excercises between india and other countries' ? '#3b82f6' : '#6b7280', color: 'white', cursor: 'pointer' }}
        >
          Bilateral excercises between india and other countries (51-100)
        </button>
        <button
          onClick={() => setTopic(101, 150, 'Central government schemes')}
          style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: activeTopic === 'Central government schemes' ? '#3b82f6' : '#6b7280', color: 'white', cursor: 'pointer' }}
        >
          Central government schemes(101-150)
        </button>
      </div>

      {filteredQuizData.length > 0 ? (
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
                  cursor: 'pointer',
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
              style={{ padding: '8px 16px', background: '#f59e42', color: 'white', borderRadius: 8, border: 'none', cursor: 'pointer' }}
            >
              Skip
            </button>
            <button
              onClick={nextQuestion}
              disabled={currentQ === filteredQuizData.length - 1}
              style={{ padding: '8px 16px', background: currentQ === filteredQuizData.length - 1 ? '#d1d5db' : '#22c55e', color: 'white', borderRadius: 8, 'border': 'none', cursor: currentQ === filteredQuizData.length - 1 ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <p style={{ color: '#4b5563', fontSize: 18 }}>No questions available for this topic.</p>
      )}
    </div>
  );
}

export default App;
