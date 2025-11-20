import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createApiRequest } from '../../utils/apiUtils';
import { useIdeology } from '../../hooks/useIdeology';

const QUESTIONS_10 = [
  {
    id: 1,
    question: "All nations should work together to provide universal healthcare to their citizens.",
    category: "economic"
  },
  {
    id: 2,
    question: "Multinational corporations have too much power and should be regulated more strictly by international agreements.",
    category: "economic"
  },
  {
    id: 3,
    question: "Climate change is a critical global issue that requires immediate coordinated international action.",
    category: "environmental"
  },
  {
    id: 4,
    question: "International migration should be more restricted to protect domestic jobs and cultures.",
    category: "social"
  },
  {
    id: 5,
    question: "Traditional cultural values should be preserved and promoted by societies worldwide.",
    category: "social"
  },
  {
    id: 6,
    question: "The wealthy worldwide should pay significantly higher taxes to reduce global inequality.",
    category: "economic"
  },
  {
    id: 7,
    question: "Global military spending should be reduced in favor of diplomatic solutions to conflicts.",
    category: "foreign"
  },
  {
    id: 8,
    question: "Individual rights to self-defense should be protected with minimal restrictions.",
    category: "social"
  },
  {
    id: 9,
    question: "Free market principles are the best way to organize the global economy with minimal government intervention.",
    category: "economic"
  },
  {
    id: 10,
    question: "Global social justice initiatives are necessary to address historical inequalities between nations.",
    category: "social"
  }
];

const QUESTIONS_40 = [
  ...QUESTIONS_10,
  {
    id: 11,
    question: "Workers worldwide should have more control and ownership in the companies they work for.",
    category: "economic"
  },
  {
    id: 12,
    question: "Governments should guarantee employment to all citizens who want to work.",
    category: "economic"
  },
  {
    id: 13,
    question: "Private property rights are fundamental and should rarely be infringed upon.",
    category: "economic"
  },
  {
    id: 14,
    question: "Higher education should be accessible to all people regardless of their ability to pay.",
    category: "economic"
  },
  {
    id: 15,
    question: "Reproductive rights should be protected and accessible in all circumstances.",
    category: "social"
  },
  {
    id: 16,
    question: "Capital punishment is an appropriate punishment for serious crimes.",
    category: "social"
  },
  {
    id: 17,
    question: "Drug use should be decriminalized and treated as a health issue rather than a criminal one.",
    category: "social"
  },
  {
    id: 18,
    question: "Cultural and religious values should play a larger role in shaping government policies.",
    category: "social"
  },
  {
    id: 19,
    question: "Speech that promotes hatred against specific groups should be legally restricted.",
    category: "social"
  },
  {
    id: 20,
    question: "Affirmative action programs are necessary to address systemic discrimination worldwide.",
    category: "social"
  },
  {
    id: 21,
    question: "International cooperation and multilateralism should guide global policy.",
    category: "foreign"
  },
  {
    id: 22,
    question: "Nations should prioritize their own interests above global concerns.",
    category: "foreign"
  },
  {
    id: 23,
    question: "Military intervention is sometimes necessary to promote human rights abroad.",
    category: "foreign"
  },
  {
    id: 24,
    question: "International aid to developing nations should be increased to address global inequality.",
    category: "foreign"
  },
  {
    id: 25,
    question: "International trade agreements should prioritize worker protections over free trade.",
    category: "economic"
  },
  {
    id: 26,
    question: "Social safety nets should be expanded to provide more services to vulnerable populations.",
    category: "economic"
  },
  {
    id: 27,
    question: "Labor unions are essential for protecting workers' rights worldwide.",
    category: "economic"
  },
  {
    id: 28,
    question: "Inheritance taxes should be high to prevent wealth concentration across generations.",
    category: "economic"
  },
  {
    id: 29,
    question: "Minimum wage standards should be raised globally to ensure a living wage for all workers.",
    category: "economic"
  },
  {
    id: 30,
    question: "Government surveillance is necessary for national security even if it reduces personal privacy.",
    category: "authority"
  },
  {
    id: 31,
    question: "Law enforcement should have more funding and authority to maintain social order.",
    category: "authority"
  },
  {
    id: 32,
    question: "Voting should be made easier with measures like automatic registration for all citizens.",
    category: "authority"
  },
  {
    id: 33,
    question: "Direct democracy (referendums) should be used more often than representative democracy.",
    category: "authority"
  },
  {
    id: 34,
    question: "Concerns about cultural sensitivity have gone too far and limit honest discussion.",
    category: "social"
  },
  {
    id: 35,
    question: "Renewable energy should replace fossil fuels as quickly as possible, regardless of economic cost.",
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
    question: "National identity is a positive force that strengthens society.",
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
  const { refetch: refetchIdeology } = useIdeology();

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
      if (avgScore < -1.5) return { ideology: 'Progressive Globalist', description: 'You lean towards progressive and internationalist values.' };
      if (avgScore > 1.5) return { ideology: 'Traditional Nationalist', description: 'You lean towards conservative and nationalist values.' };
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
        description: 'You lean towards free market economic policies.';
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
      
      // Use the createApiRequest helper function
      const apiRequest = createApiRequest('/user/ideology', {
        method: 'PUT',
        data: requestData
      });
      
      const response = await apiRequest();
      console.log('Save response:', response);
      
      // Refetch ideology data to get the latest state from server
      await refetchIdeology();
      
      alert(`Your worldview has been saved and is now ${isPublic ? 'public' : 'private'}!`);
      navigate('/profile');
    } catch (error) {
      console.error('Save ideology error:', error);
      console.error('Error response:', error.response);
      
      if (error.response?.status === 404) {
        alert('API endpoint not found. Please check if the server is running correctly.');
      } else if (error.response?.status === 401) {
        alert('You need to be logged in to save your worldview.');
      } else {
        alert(error.response?.data?.error || 'Failed to save worldview. Please try again.');
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

  const goBack = () => {
    if (showResult) {
      setShowResult(false);
      setCurrentQuestion(0);
      setAnswers({});
    } else if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      setQuizType(null);
    }
  };

  if (!quizType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h1 className="text-4xl font-bold text-center mb-4">Global Worldview Quiz</h1>
            <p className="text-gray-600 text-center mb-8">
              Discover your global worldview through our comprehensive quiz
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border-2 border-blue-200 rounded-lg p-6 hover:border-blue-500 transition cursor-pointer"
                   onClick={() => setQuizType('10')}>
                <h3 className="text-2xl font-bold mb-4 text-blue-600">Quick Quiz</h3>
                <p className="text-gray-600 mb-4">10 questions - 5 minutes</p>
                <p className="text-sm text-gray-500">
                  Get a general understanding of your global orientation with our quick quiz.
                </p>
                <div className="mt-6">
                  <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
                    Result: Progressive, Traditional, or Centrist
                  </span>
                </div>
              </div>

              <div className="border-2 border-purple-200 rounded-lg p-6 hover:border-purple-500 transition cursor-pointer"
                   onClick={() => setQuizType('40')}>
                <h3 className="text-2xl font-bold mb-4 text-purple-600">Comprehensive Quiz</h3>
                <p className="text-gray-600 mb-4">40 questions - 15 minutes</p>
                <p className="text-sm text-gray-500">
                  Get a detailed analysis of your global worldview across multiple dimensions.
                </p>
                <div className="mt-6">
                  <span className="inline-block bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
                    Result: Detailed Worldview Position
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-800 underline"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="text-gray-600 hover:text-gray-800 underline"
              >
                View Profile
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
                        <span>Foreign Policy (Internationalist ← → Nationalist):</span>
                        <span className="font-mono">{result.details.scores.foreign}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Authority (Libertarian ← → Authoritarian):</span>
                        <span className="font-mono">{result.details.scores.authority}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Environment (Green ← → Development-focused):</span>
                        <span className="font-mono">{result.details.scores.environmental}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t pt-6">
              <h3 className="text-xl font-bold mb-4">What would you like to do?</h3>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <button
                  onClick={() => saveResult(true)}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-semibold"
                >
                  {loading ? 'Saving...' : 'Show Worldview Publicly'}
                </button>
                
                <button
                  onClick={() => saveResult(false)}
                  disabled={loading}
                  className="bg-gray-600 text-white px-6 py-4 rounded-lg hover:bg-gray-700 transition disabled:opacity-50 font-semibold"
                >
                  {loading ? 'Saving...' : 'Keep This Private'}
                </button>
              </div>

              <div className="text-center space-x-4">
                <button
                  onClick={retakeQuiz}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Retake Quiz
                </button>
                <button
                  onClick={goBack}
                  className="text-gray-600 hover:text-gray-800 underline"
                >
                  Go Back
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

          <div className="mt-6 text-center">
            <button
              onClick={goBack}
              className="text-gray-600 hover:text-gray-800 underline"
            >
              {currentQuestion > 0 ? 'Previous Question' : 'Back to Quiz Selection'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeologyQuiz;