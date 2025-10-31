import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axios, createApiRequest } from '../utils/apiUtils';

const QUESTIONS_10 = [
  {
    id: 1,
    question: "The government should provide universal healthcare to all citizens.",
    category: "economic"
  },
  {
    id: 2,
    question: "Large corporations have too much power and should be regulated more strictly.",
    category: "economic"
  },
  {
    id: 3,
    question: "Climate change is a critical issue that requires immediate government action.",
    category: "environmental"
  },
  {
    id: 4,
    question: "Immigration should be more restricted to protect domestic jobs and culture.",
    category: "social"
  },
  {
    id: 5,
    question: "Traditional family values should be preserved and promoted by society.",
    category: "social"
  },
  {
    id: 6,
    question: "The wealthy should pay significantly higher taxes to reduce inequality.",
    category: "economic"
  },
  {
    id: 7,
    question: "Military spending should be increased to maintain national security.",
    category: "foreign"
  },
  {
    id: 8,
    question: "Gun ownership rights should be protected with minimal restrictions.",
    category: "social"
  },
  {
    id: 9,
    question: "The free market is the best way to organize the economy with minimal government intervention.",
    category: "economic"
  },
  {
    id: 10,
    question: "Social justice initiatives are necessary to address historical inequalities.",
    category: "social"
  }
];

const QUESTIONS_40 = [
  ...QUESTIONS_10,
  {
    id: 11,
    question: "Workers should have more control and ownership in the companies they work for.",
    category: "economic"
  },
  {
    id: 12,
    question: "The government should guarantee a job to everyone who wants one.",
    category: "economic"
  },
  {
    id: 13,
    question: "Private property rights are fundamental and should rarely be infringed upon.",
    category: "economic"
  },
  {
    id: 14,
    question: "Public education should be completely free, including college.",
    category: "economic"
  },
  {
    id: 15,
    question: "Abortion should be legal and accessible in all circumstances.",
    category: "social"
  },
  {
    id: 16,
    question: "The death penalty is an appropriate punishment for serious crimes.",
    category: "social"
  },
  {
    id: 17,
    question: "Drug use should be decriminalized and treated as a health issue.",
    category: "social"
  },
  {
    id: 18,
    question: "Religious values should play a larger role in government policy.",
    category: "social"
  },
  {
    id: 19,
    question: "Hate speech should be legally restricted even if it limits free speech.",
    category: "social"
  },
  {
    id: 20,
    question: "Affirmative action programs are necessary to address discrimination.",
    category: "social"
  },
  {
    id: 21,
    question: "International cooperation and multilateralism should guide foreign policy.",
    category: "foreign"
  },
  {
    id: 22,
    question: "Our country should prioritize its own interests above international concerns.",
    category: "foreign"
  },
  {
    id: 23,
    question: "Military intervention is sometimes necessary to promote democracy abroad.",
    category: "foreign"
  },
  {
    id: 24,
    question: "Foreign aid spending should be increased to help developing nations.",
    category: "foreign"
  },
  {
    id: 25,
    question: "Trade agreements should prioritize worker protections over free trade.",
    category: "economic"
  },
  {
    id: 26,
    question: "The welfare state should be expanded to provide more social services.",
    category: "economic"
  },
  {
    id: 27,
    question: "Labor unions are essential for protecting workers' rights.",
    category: "economic"
  },
  {
    id: 28,
    question: "Inheritance taxes should be high to prevent wealth concentration.",
    category: "economic"
  },
  {
    id: 29,
    question: "Minimum wage should be raised to ensure a living wage for all workers.",
    category: "economic"
  },
  {
    id: 30,
    question: "Government surveillance is necessary for national security even if it reduces privacy.",
    category: "authority"
  },
  {
    id: 31,
    question: "Police should have more funding and authority to maintain order.",
    category: "authority"
  },
  {
    id: 32,
    question: "Voting should be made easier with measures like automatic registration.",
    category: "authority"
  },
  {
    id: 33,
    question: "Direct democracy (referendums) should be used more often than representative democracy.",
    category: "authority"
  },
  {
    id: 34,
    question: "Political correctness has gone too far and limits honest discussion.",
    category: "social"
  },
  {
    id: 35,
    question: "Renewable energy should replace fossil fuels as quickly as possible, regardless of cost.",
    category: "environmental"
  },
  {
    id: 36,
    question: "Animal rights should be protected by law, similar to human rights.",
    category: "environmental"
  },
  {
    id: 37,
    question: "Economic growth should be prioritized over environmental protection.",
    category: "environmental"
  },
  {
    id: 38,
    question: "Genetically modified organisms (GMOs) should be strictly regulated or banned.",
    category: "environmental"
  },
  {
    id: 39,
    question: "Local communities should have more autonomy from central government.",
    category: "authority"
  },
  {
    id: 40,
    question: "Nationalism is a positive force that strengthens society.",
    category: "social"
  }
];

const IdeologyQuiz = () => {
  const navigate = useNavigate();
  const [quizType, setQuizType] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);

  const questions = quizType === '10' ? QUESTIONS_10 : QUESTIONS_40;

  const calculateResult = () => {
    let economic = 0; // -5 to 5 (left to right)
    let social = 0; // -5 to 5 (progressive to conservative)
    let foreign = 0; // -5 to 5 (dovish to hawkish)
    let authority = 0; // -5 to 5 (libertarian to authoritarian)
    let environmental = 0; // -5 to 5 (green to brown)

    Object.entries(answers).forEach(([questionId, answer]) => {
      const question = questions.find(q => q.id === parseInt(questionId));
      const value = answer - 3; // Convert 1-5 to -2 to 2

      switch (question.category) {
        case 'economic':
          // Questions favoring left-wing economics
          if ([1, 2, 6, 11, 12, 14, 25, 26, 27, 28, 29].includes(question.id)) {
            economic -= value; // Strongly agree means more left
          } else {
            economic += value; // Questions favoring right-wing economics
          }
          break;
        case 'social':
          // Questions favoring progressive values
          if ([10, 15, 17, 19, 20].includes(question.id)) {
            social -= value;
          } else {
            social += value; // Questions favoring conservative values
          }
          break;
        case 'foreign':
          if ([21, 24].includes(question.id)) {
            foreign -= value; // Dovish/internationalist
          } else {
            foreign += value; // Hawkish/nationalist
          }
          break;
        case 'authority':
          if ([32, 33, 39].includes(question.id)) {
            authority -= value; // Libertarian
          } else {
            authority += value; // Authoritarian
          }
          break;
        case 'environmental':
          if ([3, 35, 36, 38].includes(question.id)) {
            environmental -= value; // Green
          } else {
            environmental += value; // Brown
          }
          break;
      }
    });

    if (quizType === '10') {
      // Simple classification for 10 questions
      const avgScore = (economic + social) / 2;
      if (avgScore < -1.5) return { ideology: 'Left-Wing', description: 'You lean towards progressive and liberal values.' };
      if (avgScore > 1.5) return { ideology: 'Right-Wing', description: 'You lean towards conservative and traditional values.' };
      return { ideology: 'Centrist', description: 'You hold moderate views across the political spectrum.' };
    } else {
      // Detailed classification for 40 questions
      const economicLabel = economic < -2 ? 'Socialist' : economic < -0.5 ? 'Social Democrat' : economic < 0.5 ? 'Centrist' : economic < 2 ? 'Market Liberal' : 'Libertarian';
      const socialLabel = social < -2 ? 'Very Progressive' : social < -0.5 ? 'Progressive' : social < 0.5 ? 'Moderate' : social < 2 ? 'Conservative' : 'Very Conservative';
      
      let ideology = '';
      let description = '';

      // Determine specific ideology
      if (economic < -2 && social < -1) {
        ideology = 'Democratic Socialist';
        description = 'You support strong government intervention in the economy and progressive social policies.';
      } else if (economic < -1 && social < 0) {
        ideology = 'Social Liberal';
        description = 'You favor a mixed economy with social safety nets and progressive social values.';
      } else if (economic > 1 && social > 1) {
        ideology = 'Conservative';
        description = 'You support free markets and traditional social values.';
      } else if (economic > 1 && social < 0) {
        ideology = 'Libertarian';
        description = 'You favor minimal government intervention in both economics and personal lives.';
      } else if (economic < 0 && social > 1) {
        ideology = 'Social Conservative';
        description = 'You support economic intervention combined with traditional social values.';
      } else if (Math.abs(economic) < 1 && Math.abs(social) < 1) {
        ideology = 'Centrist';
        description = 'You hold moderate views across the political spectrum.';
      } else if (economic < -1) {
        ideology = 'Left-Wing';
        description = 'You lean towards progressive economic policies.';
      } else if (economic > 1) {
        ideology = 'Right-Wing';
        description = 'You lean towards free market economic policies.';
      } else {
        ideology = 'Moderate';
        description = 'You hold balanced views on most political issues.';
      }

      return {
        ideology,
        description,
        details: {
          economic: economicLabel,
          social: socialLabel,
          scores: {
            economic: economic.toFixed(2),
            social: social.toFixed(2),
            foreign: foreign.toFixed(2),
            authority: authority.toFixed(2),
            environmental: environmental.toFixed(2)
          }
        }
      };
    }
  };

  const handleAnswer = (value) => {
    setAnswers({ ...answers, [questions[currentQuestion].id]: value });
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const calculatedResult = calculateResult();
      setResult(calculatedResult);
      setShowResult(true);
    }
  };

  const saveResult = async (isPublic) => {
    setLoading(true);
    try {
      const requestData = {
        ideology: result.ideology,
        ideology_details: result.details || null,
        ideology_public: isPublic
      };
      
      console.log('Saving ideology with data:', requestData);
      console.log('Making request to:', axios.defaults.baseURL + '/user/ideology');
      
      // Use the createApiRequest helper function
      const apiRequest = createApiRequest('/user/ideology', {
        method: 'PUT',
        data: requestData
      });
      
      const response = await apiRequest();
      console.log('Save response:', response);
      
      alert('Your ideology result has been saved!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Save ideology error:', error);
      console.error('Error response:', error.response);
      console.error('Error config:', error.config);
      
      if (error.response?.status === 404) {
        alert('API endpoint not found. Please check if the server is running correctly.');
      } else if (error.response?.status === 401) {
        alert('You need to be logged in to save your ideology.');
      } else {
        alert(error.response?.data?.error || 'Failed to save ideology. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const retakeQuiz = () => {
    setQuizType(null);
    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
    setShowResult(false);
  };

  if (!quizType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h1 className="text-4xl font-bold text-center mb-4">Political Ideology Quiz</h1>
            <p className="text-gray-600 text-center mb-8">
              Discover your political ideology through our comprehensive quiz
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border-2 border-blue-200 rounded-lg p-6 hover:border-blue-500 transition cursor-pointer"
                   onClick={() => setQuizType('10')}>
                <h3 className="text-2xl font-bold mb-4 text-blue-600">Quick Quiz</h3>
                <p className="text-gray-600 mb-4">10 questions - 5 minutes</p>
                <p className="text-sm text-gray-500">
                  Get a general understanding of your political orientation with our quick quiz.
                </p>
                <div className="mt-6">
                  <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
                    Result: Left-Wing, Right-Wing, or Centrist
                  </span>
                </div>
              </div>

              <div className="border-2 border-purple-200 rounded-lg p-6 hover:border-purple-500 transition cursor-pointer"
                   onClick={() => setQuizType('40')}>
                <h3 className="text-2xl font-bold mb-4 text-purple-600">Comprehensive Quiz</h3>
                <p className="text-gray-600 mb-4">40 questions - 15 minutes</p>
                <p className="text-sm text-gray-500">
                  Get a detailed analysis of your political ideology across multiple dimensions.
                </p>
                <div className="mt-6">
                  <span className="inline-block bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
                    Result: Detailed Ideological Position
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-800 underline"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h1 className="text-4xl font-bold text-center mb-4">Your Results</h1>
            
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-8 mb-6">
              <h2 className="text-3xl font-bold mb-4">{result.ideology}</h2>
              <p className="text-lg">{result.description}</p>
            </div>

            {result.details && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-4">Detailed Breakdown</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">Economic:</span>
                      <span className="text-gray-600">{result.details.economic}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">Social:</span>
                      <span className="text-gray-600">{result.details.social}</span>
                    </div>
                  </div>

                  <div className="bg-gray-100 rounded-lg p-4 mt-4">
                    <h4 className="font-semibold mb-3">Your Scores:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Economic (Left ← → Right):</span>
                        <span className="font-mono">{result.details.scores.economic}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Social (Progressive ← → Conservative):</span>
                        <span className="font-mono">{result.details.scores.social}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Foreign Policy (Dovish ← → Hawkish):</span>
                        <span className="font-mono">{result.details.scores.foreign}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Authority (Libertarian ← → Authoritarian):</span>
                        <span className="font-mono">{result.details.scores.authority}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Environment (Green ← → Brown):</span>
                        <span className="font-mono">{result.details.scores.environmental}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t pt-6">
              <h3 className="text-xl font-bold mb-4">What would you like to do?</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => saveResult(true)}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-semibold"
                >
                  {loading ? 'Saving...' : 'Show Ideology Publicly'}
                </button>
                
                <button
                  onClick={() => saveResult(false)}
                  disabled={loading}
                  className="bg-gray-600 text-white px-6 py-4 rounded-lg hover:bg-gray-700 transition disabled:opacity-50 font-semibold"
                >
                  {loading ? 'Saving...' : 'Keep This Private'}
                </button>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={retakeQuiz}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Retake Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-600">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-8 text-gray-800">
            {questions[currentQuestion].question}
          </h2>

          <div className="space-y-3">
            {[
              { value: 1, label: 'Strongly Disagree' },
              { value: 2, label: 'Disagree' },
              { value: 3, label: 'Neutral' },
              { value: 4, label: 'Agree' },
              { value: 5, label: 'Strongly Agree' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className="w-full py-4 px-6 text-left border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition font-medium"
              >
                {option.label}
              </button>
            ))}
          </div>

          {currentQuestion > 0 && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setCurrentQuestion(currentQuestion - 1)}
                className="text-gray-600 hover:text-gray-800 underline"
              >
                Previous Question
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IdeologyQuiz;