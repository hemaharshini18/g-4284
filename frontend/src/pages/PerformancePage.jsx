import React, { useState } from 'react';
import { generatePerformanceFeedback } from '../services/api';
import './PerformancePage.css';

const PerformancePage = () => {
  const [rating, setRating] = useState('');
  const [comments, setComments] = useState('');
  const [generatedFeedback, setGeneratedFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateFeedback = async () => {
    setIsLoading(true);
    setError('');
    setGeneratedFeedback('');
    try {
      const response = await generatePerformanceFeedback({ rating, comments });
      setGeneratedFeedback(response.data.feedback);
    } catch (err) {
      console.error('Error generating feedback:', err);
      setError(err.response?.data?.msg || 'An error occurred while generating feedback.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="performance-page">
      <h1>Performance Review</h1>
      <div className="feedback-form">
        <div className="form-group">
          <label>Rating (1-5)</label>
          <input
            type="number"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            min="1"
            max="5"
          />
        </div>
        <div className="form-group">
          <label>Manager's Comments</label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows="4"
            placeholder="Enter comments to generate AI feedback..."
          ></textarea>
        </div>
        <button onClick={handleGenerateFeedback} disabled={isLoading || !rating || !comments}>
          {isLoading ? 'Generating...' : 'Generate AI Feedback'}
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
      {generatedFeedback && (
        <div className="generated-feedback">
          <h2>Generated Feedback</h2>
          <p>{generatedFeedback}</p>
        </div>
      )}
    </div>
  );
};

export default PerformancePage;
