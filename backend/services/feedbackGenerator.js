const axios = require('axios');

/**
 * Generates performance feedback using an external AI service.
 * @param {number} rating - A performance rating from 1 to 5.
 * @param {string} comments - The manager's specific comments.
 * @returns {Promise<string>} The generated feedback text.
 */
async function generateFeedback(rating, comments) {
  if (!rating || !comments) {
    throw new Error('Rating and comments are required.');
  }

  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    console.warn('AI_API_KEY not set. Falling back to placeholder feedback generator.');
    return generatePlaceholderFeedback(rating, comments);
  }

  const prompt = `As an expert HR manager, write a constructive and professional performance review feedback. The manager has provided a rating of ${rating} out of 5 and the following comments: "${comments}". Based on this, generate a well-structured feedback summary including an opening statement, key strengths, areas for development, and a closing statement. The tone should be supportive and professional.`;

  try {
    // NOTE: This is a placeholder for a real AI API endpoint.
    // You should replace 'https://api.some-ai-provider.com/v1/completions'
    // with your actual AI service endpoint.
    const response = await axios.post(
      'https://api.some-ai-provider.com/v1/completions',
      {
        model: 'text-davinci-003', // Example model
        prompt: prompt,
        max_tokens: 350,
        temperature: 0.75,
        n: 1,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    if (response.data && response.data.choices && response.data.choices[0].text) {
      return response.data.choices[0].text.trim();
    } else {
      console.error('Invalid response structure from AI service.');
      return generatePlaceholderFeedback(rating, comments); // Fallback
    }
  } catch (error) {
    console.error('Error calling AI service:', error.message);
    console.log('Falling back to placeholder feedback generation due to API error.');
    return generatePlaceholderFeedback(rating, comments); // Fallback
  }
}

// --- Placeholder Logic (Fallback) ---

function generatePlaceholderFeedback(rating, comments) {
  const ratingNum = parseInt(rating, 10);
  const opening = getOpening(ratingNum);
  const strengths = getStrengths(ratingNum, comments);
  const areasForDevelopment = getAreasForDevelopment(ratingNum, comments);
  const closing = getClosing(ratingNum);
  return `${opening}\n\n${strengths}\n\n${areasForDevelopment}\n\n${closing}`.trim();
}

function getOpening(rating) {
  switch (rating) {
    case 5: return 'The performance has been truly exceptional this period. The contributions have been outstanding and have set a new benchmark for excellence.';
    case 4: return 'This has been a period of strong performance, consistently exceeding expectations and making significant, valuable contributions to the team.';
    case 3: return 'A solid and reliable performance was delivered this period, meeting all core job expectations effectively and contributing to team goals.';
    case 2: return 'Performance has not fully met expectations this period, and there are key areas that require development and focus moving forward.';
    case 1: return 'There are significant concerns with performance this period, which has been consistently below the required standards. Immediate improvement is necessary.';
    default: return 'Regarding the performance this period:';
  }
}

function getStrengths(rating, comments) {
  let base = 'Key Strengths:';
  if (rating >= 3) {
    return `${base}\n- The manager highlighted the following positive points: "${comments}" This demonstrates a strong aptitude and commitment.`;
  }
  return `${base}\n- While this was a challenging period, the employee has the opportunity to build on their foundational skills.`;
}

function getAreasForDevelopment(rating, comments) {
  let base = 'Areas for Development:';
  if (rating <= 3) {
    return `${base}\n- Based on the manager\'s feedback on "${comments}", we need to focus on improving in this area. Let\'s work together to create a plan for development.`;
  }
  return `${base}\n- To reach the next level, we can focus on expanding strategic impact and taking on more leadership opportunities.`;
}

function getClosing(rating) {
  switch (rating) {
    case 5: return 'An outstanding effort that is highly valued. Keep up the phenomenal work!';
    case 4: return 'A great job this period. We look forward to seeing continued growth and success.';
    case 3: return 'Thank you for the consistent effort. Let\'s aim to build on this foundation in the next period.';
    case 2: return 'We are committed to providing the necessary support to help bridge these gaps. Let\'s schedule a follow-up to discuss an action plan.';
    case 1: return 'A clear and immediate focus on the outlined areas for development is required. We will be monitoring progress closely.';
    default: return 'We will follow up to discuss next steps.';
  }
}

module.exports = { generateFeedback };
