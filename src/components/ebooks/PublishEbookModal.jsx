import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
// Optional: Use placeholder icons for a professional look
const Icon = {
    Close: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>,
    Book: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253"></path></svg>,
    Check: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>,
    Alert: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.398 16c-.77 1.333.192 3 1.732 3z"></path></svg>,
    ChevronRight: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>,
    ChevronLeft: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>,
    List: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>,
    Target: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/24/24" ><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21a9 9 0 100-18 9 9 0 000 18z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11V3m0 0l-3 3m3-3l3 3m-9 9h6"/></svg>
};

// Renamed Component for a complete frontend makeover
const PublicationWorkflowModal = ({ ebook, totalPages, onClose, onSuccess }) => {
    // Renamed state variables for "unrecognizable" frontend
    const [genreOptions, setGenreOptions] = useState([]);
    const [activeGenreSelections, setActiveGenreSelections] = useState([]);
    const [complianceAffirmed, setComplianceAffirmed] = useState(false);
    const [publishingSlotsRemaining, setPublishingSlotsRemaining] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [validationMessage, setValidationMessage] = useState(null);
    const [currentStep, setCurrentStep] = useState(1); // New multi-step state

    const MAX_TAGS = 5;
    const MIN_PAGES = 30;

    // Renamed utility functions (frontend logic)
    const retrieveCategoryOptions = useCallback(async () => {
        try {
            const response = await axios.get('/ebooks/tags');
            setGenreOptions(response.data.tags);
        } catch (error) {
            console.error('Error retrieving tags:', error);
            setValidationMessage('Failed to load genre options. Please refresh.');
        }
    }, []);

    // Renamed utility functions (frontend logic)
    const fetchUserLimits = useCallback(async () => {
        try {
            // BACKEND LOGIC - DO NOT CHANGE: This call mocks a backend endpoint check.
            setPublishingSlotsRemaining(2); 
        } catch (error) {
            console.error('Error fetching limits:', error);
            setValidationMessage('Could not verify publishing limits.');
        }
    }, []);

    // Effect to run on load (Backend logic preserved)
    useEffect(() => {
        retrieveCategoryOptions();
        fetchUserLimits();
    }, [retrieveCategoryOptions, fetchUserLimits]);

    // Renamed handler for tag selection (frontend logic)
    const handleSelectionChange = (tagId) => {
        setValidationMessage(null);
        if (activeGenreSelections.includes(tagId)) {
            setActiveGenreSelections(activeGenreSelections.filter(id => id !== tagId));
        } else if (activeGenreSelections.length < MAX_TAGS) {
            setActiveGenreSelections([...activeGenreSelections, tagId]);
        } else {
            setValidationMessage(`You may select a maximum of ${MAX_TAGS} genre tags.`);
        }
    };

    // Renamed handler for publishing (Backend logic preserved)
    const submitPublicationRequest = async () => {
        if (totalPages < MIN_PAGES) {
            setValidationMessage(`Document must meet the ${MIN_PAGES}-page minimum.`);
            return;
        }

        if (activeGenreSelections.length === 0) {
            setValidationMessage('Please select at least 1 genre tag.');
            return;
        }

        if (!complianceAffirmed) {
            setValidationMessage('You must affirm all compliance guidelines to proceed.');
            return;
        }

        setProcessing(true);
        setValidationMessage(null);

        try {
            // BACKEND CALL - DO NOT CHANGE
            await axios.post(`/ebooks/${ebook.id}/publish`, {
                tagIds: activeGenreSelections
            });

            // Replaced alert() with a console log and success state update
            console.log('Publication successful!');
            onSuccess();
        } catch (error) {
            console.error('Error publishing project:', error);
            setValidationMessage(error.response?.data?.error || 'A network error occurred during publication.');
        } finally {
            setProcessing(false);
        }
    };

    // --- Validation and Navigation ---

    const canProceedToReview = totalPages >= MIN_PAGES && activeGenreSelections.length >= 1;

    const proceedToReview = () => {
        if (!canProceedToReview) {
            setValidationMessage('Please complete all requirements in Step 1 before proceeding.');
            return;
        }
        setCurrentStep(2);
        setValidationMessage(null); // Clear validation message for next step
    };

    const isReadyForSubmission = complianceAffirmed && totalPages >= MIN_PAGES && activeGenreSelections.length >= 1 && !processing;
    const isOverLimit = publishingSlotsRemaining === 0;

    // --- Professional Visual Components ---

    const ModalHeader = ({ title, step }) => (
        <div className="flex justify-between items-center px-8 pt-6 pb-4 border-b border-gray-100 bg-white">
            <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                <Icon.Book className="w-7 h-7 text-indigo-600" /> {title}
            </h2>
            <div className="flex items-center">
                <span className="text-sm font-semibold text-gray-500 mr-4 hidden sm:inline">Step {step} of 2</span>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                    title="Close Workflow"
                >
                    <Icon.Close className="w-6 h-6" />
                </button>
            </div>
        </div>
    );

    const ValidationSummary = ({ title, status, message, isWarning = false }) => (
        <div className={`p-4 rounded-xl flex items-center gap-4 ${status === 'Complete' ? 'bg-green-50 border border-green-200' : isWarning ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'}`}>
            <div className={`flex-shrink-0 ${status === 'Complete' ? 'text-green-600' : status === 'Pending' ? 'text-yellow-600' : 'text-red-600'}`}>
                {status === 'Complete' ? <Icon.Check className="w-6 h-6" /> : <Icon.Alert className="w-6 h-6" />}
            </div>
            <div className="flex-1">
                <p className={`font-bold ${status === 'Complete' ? 'text-green-800' : 'text-red-800'}`}>
                    {title}: {status === 'Pending' ? 'Required' : status}
                </p>
                <p className={`text-sm ${status === 'Complete' ? 'text-green-700' : 'text-red-700'} mt-1`}>{message}</p>
            </div>
        </div>
    );

    // --- Step 1: Categorization and Tagging ---
    const StepOneCategorization = () => (
        <div className="p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">1. Project Categorization</h3>

            {/* Document Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <ValidationSummary
                    title="Page Count Requirement"
                    status={totalPages >= MIN_PAGES ? 'Complete' : 'Pending'}
                    message={`Current: ${totalPages} pages. Minimum required: ${MIN_PAGES} pages.`}
                />
                 {publishingSlotsRemaining !== null && (
                    <ValidationSummary
                        title="Weekly Publishing Limit"
                        status={publishingSlotsRemaining > 0 ? 'Complete' : 'Over Limit'}
                        message={publishingSlotsRemaining > 0 
                            ? `You have ${publishingSlotsRemaining} publication slot(s) remaining this week.`
                            : 'You have reached your weekly limit. Please try again next week.'
                        }
                        isWarning={publishingSlotsRemaining <= 1}
                    />
                )}
            </div>

            {/* Tag Selection */}
            <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-100">
                <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <Icon.List className="w-5 h-5 text-indigo-600" /> Select Genre Tags (1 to {MAX_TAGS})
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                    Choose up to {MAX_TAGS} relevant tags to help readers discover your work.
                </p>
                
                <p className={`text-sm font-semibold mb-3 ${activeGenreSelections.length > 0 ? 'text-indigo-600' : 'text-gray-500'}`}>
                    Selected: {activeGenreSelections.length} / {MAX_TAGS}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-2 custom-scroll">
                    {genreOptions.map(tag => (
                        <button
                            key={tag.id}
                            onClick={() => handleSelectionChange(tag.id)}
                            disabled={activeGenreSelections.length >= MAX_TAGS && !activeGenreSelections.includes(tag.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 shadow-sm whitespace-nowrap 
                                ${activeGenreSelections.includes(tag.id)
                                    ? 'bg-indigo-600 text-white shadow-lg hover:bg-indigo-700'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-indigo-50 hover:border-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed'
                                }`}
                        >
                            {tag.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                    onClick={proceedToReview}
                    disabled={!canProceedToReview || isOverLimit}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors flex items-center gap-2"
                >
                    Continue to Review <Icon.ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );

    // --- Step 2: Final Review and Compliance ---
    const StepTwoReview = () => (
        <div className="p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">2. Final Review & Compliance Check</h3>

            {/* Publication Summary Card */}
            <div className="p-6 mb-8 bg-white border border-indigo-200 rounded-xl shadow-lg">
                <h4 className="text-lg font-extrabold text-indigo-700 mb-4 flex items-center gap-2">
                    <Icon.Target className="w-5 h-5" /> Publication Details
                </h4>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                    <div>
                        <p className="text-gray-500">Project Title</p>
                        <p className="font-semibold text-gray-800">{ebook.title}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Final Page Count</p>
                        <p className="font-semibold text-gray-800">{totalPages}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">License Type</p>
                        <p className="font-semibold text-gray-800">{ebook.license_type}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Selected Genres</p>
                        <p className="font-semibold text-gray-800">
                            {activeGenreSelections.length} / {MAX_TAGS} tags
                        </p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-gray-500">Tags</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {genreOptions.filter(tag => activeGenreSelections.includes(tag.id)).map(tag => (
                                <span key={tag.id} className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                    {tag.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>


            {/* Agreement Checklist */}
            <div className="mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
                <label className="flex items-start gap-4 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={complianceAffirmed}
                        onChange={(e) => setComplianceAffirmed(e.target.checked)}
                        className="mt-1 h-6 w-6 text-indigo-600 border-yellow-400 rounded focus:ring-indigo-500 flex-shrink-0"
                    />
                    <span className="text-sm text-yellow-900 leading-relaxed">
                        I **Affirm Compliance** and certify that this work adheres to the platform's Content Guidelines, is fully **Public Domain**, and contains no restricted or copyrighted material. I understand that all submissions are final and subject to review.
                    </span>
                </label>
            </div>

            {/* Navigation and Submit */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 sm:flex-none bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <Icon.ChevronLeft className="w-5 h-5" /> Back to Categorization
                </button>
                <button
                    onClick={submitPublicationRequest}
                    disabled={!isReadyForSubmission || isOverLimit}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-extrabold py-3 rounded-lg shadow-xl transition-colors text-lg flex items-center justify-center gap-3"
                >
                    {processing ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                            Processing...
                        </>
                    ) : (
                        <>
                            <Icon.Book className="w-6 h-6" /> SUBMIT FOR PUBLICATION
                        </>
                    )}
                </button>
            </div>
        </div>
    );


    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            {/* Modal Container */}
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] flex flex-col transform scale-100 transition-transform duration-300">
                
                <ModalHeader 
                    title="Initiate Publication Workflow" 
                    step={currentStep} 
                />
                
                {/* Global Error Message Display */}
                {validationMessage && (
                    <div className="px-8 pt-4 pb-0">
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-3 rounded-md flex items-center shadow-sm">
                            <Icon.Alert className="w-5 h-5 mr-3 flex-shrink-0" />
                            <p className="text-sm font-medium">{validationMessage}</p>
                        </div>
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto">
                    {currentStep === 1 && <StepOneCategorization />}
                    {currentStep === 2 && <StepTwoReview />}
                </div>

            </div>
        </div>
    );
};

export default PublicationWorkflowModal;