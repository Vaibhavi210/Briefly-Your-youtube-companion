import React, { useState } from 'react';
import { Card, Spinner, Button, Form, Badge, Accordion } from "react-bootstrap";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function ContentGenerator({ summary , language }) {
  const [generatedContent, setGeneratedContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [numQuestions, setNumQuestions] = useState(3);
  const [numMCQs, setNumMCQs] = useState(3);
  const [numBullets, setNumBullets] = useState(5);
  const [contentGenerated, setContentGenerated] = useState(false);
  const [error, setError] = useState("");
  
  // State for tracking user answers
  const [shortAnswerVisibility, setShortAnswerVisibility] = useState({});
  const [userMCQAnswers, setUserMCQAnswers] = useState({});
  const [mcqSubmitted, setMcqSubmitted] = useState(false);
  const [mcqScore, setMcqScore] = useState(null);
    const [url, setUrl] = useState("");
    // const [language, setLanguage] = useState("en");

  const generateContent = async () => {
    if (!summary || summary.trim() === "") {
      setError("Please generate a summary first!");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const response = await fetch("http://127.0.0.1:5000/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          summary, 
          num_questions: numQuestions,
          num_mcqs: numMCQs,
          num_bullets: numBullets,
          language: language // Use the received language prop
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setGeneratedContent(data);
      setContentGenerated(true);
      
      // Reset states
      setShortAnswerVisibility({});
      setUserMCQAnswers({});
      setMcqSubmitted(false);
      setMcqScore(null);
    } catch (error) {
      if (error.response && error.response.status === 429) {
        alert('Too many requests. Please wait a moment before trying again.');
    }else{
      console.error("Error generating content:", error);
      setError("Failed to generate content. Check console for details.");}
    } finally {
      setLoading(false);
    }
  };

  // Toggle answer visibility for short questions
  const toggleAnswerVisibility = (index) => {
    setShortAnswerVisibility(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Handle MCQ option selection
  const handleMCQOptionSelect = (questionIndex, option) => {
    if (mcqSubmitted) return; // Prevent changes after submission
    
    setUserMCQAnswers(prev => ({
      ...prev,
      [questionIndex]: option
    }));
  };

  // Submit MCQ answers and calculate score
  const submitMCQAnswers = () => {
    if (!generatedContent?.mcqs?.length) return;
    
    let correctAnswers = 0;
    const totalQuestions = generatedContent.mcqs.length;
    
    generatedContent.mcqs.forEach((mcq, index) => {
      if (userMCQAnswers[index] === mcq.answer) {
        correctAnswers++;
      }
    });
    
    const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);
    setMcqScore({ correct: correctAnswers, total: totalQuestions, percentage: scorePercentage });
    setMcqSubmitted(true);
  };

  // Reset MCQ quiz
  const resetMCQQuiz = () => {
    setUserMCQAnswers({});
    setMcqSubmitted(false);
    setMcqScore(null);
  };

  const exportPDF = () => {
    if (language === "hi" || language === "hindi") {
      alert("PDF generation is not supported for Hindi language.");
      return;
    }

    if (!generatedContent) return;

    const doc = new jsPDF();
    
    if (!doc.autoTable) {
      console.error('autoTable plugin not loaded!');
      return;
    }

    let yPosition = 20;

    // Title
    doc.setFontSize(16);
    doc.text("Generated Educational Content", 14, yPosition);
    yPosition += 10;

    // Summary Section
    doc.setFontSize(12);
    doc.text("Summary:", 14, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    const splitSummary = doc.splitTextToSize(summary, 180);
    doc.text(splitSummary, 14, yPosition);
    yPosition += splitSummary.length * 5 + 10;

    // Short Answer Questions
    if (generatedContent.short_questions && generatedContent.short_questions.length > 0) {
      doc.setFontSize(12);
      doc.text("Short Answer Questions:", 14, yPosition);
      yPosition += 10;
      
      // Define table data for short answer questions
      const shortQData = generatedContent.short_questions.map((item, index) => [
        `${index + 1}. ${item.question}`,
        item.answer
      ]);
      
      doc.autoTable({
        startY: yPosition,
        head: [["Question", "Answer"]],
        body: shortQData,
        theme: 'grid',
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 90 }
        }
      });
      
      yPosition = doc.autoTable.previous.finalY + 15;
    }

    // Multiple Choice Questions
    if (generatedContent.mcqs && generatedContent.mcqs.length > 0) {
      doc.setFontSize(12);
      doc.text("Multiple Choice Questions:", 14, yPosition);
      yPosition += 10;
      
      generatedContent.mcqs.forEach((mcq, index) => {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text(`${index + 1}. ${mcq.question}`, 14, yPosition);
        yPosition += 10;
        
        doc.setFont(undefined, 'normal');
        Object.entries(mcq.options).forEach(([letter, text]) => {
          const optionText = `${letter}. ${text}`;
          const isCorrect = letter === mcq.answer;
          
          if (isCorrect) {
            doc.setTextColor(0, 128, 0); // Green for correct answer
          }
          
          doc.text(optionText, 20, yPosition);
          yPosition += 6;
          
          if (isCorrect) {
            doc.setTextColor(0, 0, 0); // Reset to black
          }
        });
        
        yPosition += 6;
      });
    }

    // Key Points
    if (generatedContent.bullet_points && generatedContent.bullet_points.length > 0) {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(12);
      doc.text("Key Points:", 14, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      
      generatedContent.bullet_points.forEach((point, index) => {
        // Check if we need a new page
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        
        const bulletText = `• ${point}`;
        const splitText = doc.splitTextToSize(bulletText, 180);
        
        doc.text(splitText, 14, yPosition);
        yPosition += splitText.length * 6 + 2;
      });
    }

    // Save the PDF
    doc.save("generated_content.pdf");
  };

  return (
    <div className="mt-4">
      <h4 className="text-white">Generate Learning Materials</h4>
      <div className="d-flex gap-2 mb-3">
        <div className="form-group">
          <label className="text-white">Questions</label>
          <input
            type="number"
            className="form-control"
            min="1"
            max="10"
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
          />
        </div>
        
        <div className="form-group">
          <label className="text-white">MCQs</label>
          <input
            type="number"
            className="form-control"
            min="1"
            max="10"
            value={numMCQs}
            onChange={(e) => setNumMCQs(Number(e.target.value))}
          />
        </div>
        
        <div className="form-group">
          <label className="text-white">Bullet Points</label>
          <input
            type="number"
            className="form-control"
            min="1"
            max="10"
            value={numBullets}
            onChange={(e) => setNumBullets(Number(e.target.value))}
          />
        </div>
        
        <div className="form-group d-flex align-items-end">
          <button 
            className="btn btn-primary" 
            onClick={generateContent} 
            disabled={loading || !summary}
          >
            {loading ? <Spinner animation="border" size="sm" /> : "Generate"}
          </button>
        </div>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {contentGenerated && generatedContent && (
        <div>
          {/* Short Answer Questions Section */}
          {generatedContent.short_questions && generatedContent.short_questions.length > 0 && (
            <Card className="mb-3 bg-secondary text-white">
              <Card.Header>
                <h5>Short Answer Questions</h5>
              </Card.Header>
              <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <div className="text-white">
                  <Accordion defaultActiveKey="0" className="mb-3">
                    {generatedContent.short_questions.map((item, index) => (
                      <Accordion.Item key={index} eventKey={index.toString()} className="mb-2">
                        <Accordion.Header className="bg-dark text-white">
                          Question {index + 1}: {item.question}
                        </Accordion.Header>
                        <Accordion.Body className="bg-dark">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <Button 
                              variant={shortAnswerVisibility[index] ? "outline-light" : "light"}
                              size="sm"
                              onClick={() => toggleAnswerVisibility(index)}
                            >
                              {shortAnswerVisibility[index] ? "Hide Answer" : "Show Answer"}
                            </Button>
                          </div>
                          {shortAnswerVisibility[index] && (
                            <div className="bg-info text-dark p-2 rounded">
                              <strong>Answer:</strong> {item.answer}
                            </div>
                          )}
                        </Accordion.Body>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                </div>
              </Card.Body>
            </Card>
          )}
          
          {/* Multiple Choice Questions Section */}
          {generatedContent.mcqs && generatedContent.mcqs.length > 0 && (
            <Card className="mb-3 bg-secondary text-white">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5>Multiple Choice Questions</h5>
                <div>
                  {mcqSubmitted ? (
                    <>
                      <Badge bg={mcqScore.percentage >= 70 ? "success" : "danger"} className="me-2">
                        Score: {mcqScore.correct}/{mcqScore.total} ({mcqScore.percentage}%)
                      </Badge>
                      <Button size="sm" variant="outline-light" onClick={resetMCQQuiz}>
                        Retry
                      </Button>
                    </>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="primary" 
                      onClick={submitMCQAnswers}
                      disabled={Object.keys(userMCQAnswers).length < generatedContent.mcqs.length}
                    >
                      Submit Answers
                    </Button>
                  )}
                </div>
              </Card.Header>
              <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <div className="text-white">
                  {generatedContent.mcqs.map((mcq, qIndex) => (
                    <div key={qIndex} className="mb-4 bg-dark p-3 rounded">
                      <p className="fw-bold">Question {qIndex + 1}: {mcq.question}</p>
                      <Form>
                        {Object.entries(mcq.options).map(([letter, text]) => {
                          const isSelected = userMCQAnswers[qIndex] === letter;
                          const isCorrect = mcqSubmitted && letter === mcq.answer;
                          const isWrong = mcqSubmitted && isSelected && letter !== mcq.answer;
                          
                          let variant = "outline-light";
                          if (mcqSubmitted) {
                            if (isCorrect) variant = "success";
                            if (isWrong) variant = "danger";
                          } else if (isSelected) {
                            variant = "primary";
                          }
                          
                          return (
                            <div key={letter} className="mb-2">
                              <Button
                                variant={variant}
                                className="text-start w-100"
                                onClick={() => handleMCQOptionSelect(qIndex, letter)}
                                disabled={mcqSubmitted}
                              >
                                <span className="me-2">{letter}.</span> {text}
                              </Button>
                            </div>
                          );
                        })}
                      </Form>
                      {mcqSubmitted && (
                        <div className="mt-2 p-2 bg-info text-dark rounded">
                          <strong>Correct Answer:</strong> {mcq.answer}. {mcq.options[mcq.answer]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}
          
          {/* Key Points Section */}
          {generatedContent.bullet_points && generatedContent.bullet_points.length > 0 && (
            <Card className="mb-3 bg-secondary text-white">
              <Card.Header>
                <h5>Key Points</h5>
              </Card.Header>
              <Card.Body style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <div className="text-white">
                  <ul className="mb-0">
                    {generatedContent.bullet_points.map((point, index) => (
                      <li key={index} className="mb-2">{point}</li>
                    ))}
                  </ul>
                </div>
              </Card.Body>
            </Card>
          )}
          
          <button className="btn btn-info w-100" onClick={exportPDF}>
            📄 Export to PDF
          </button>
        </div>
      )}
    </div>
  );
}
