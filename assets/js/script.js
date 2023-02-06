// Declaring variables and HTML DOM elements for use in the global scope
var quizApiURL = "https://quizapi.io/";
var generateQuestionsButton = document.querySelector("#Generate");
var chosenOptions = [];
var categoryChosen = "";
var languageChosen = "";
var quantityChosen = "";
var questionsGotten;
var translatedQuestion;
var questionsAndAnswersArray;
var newQuestionAndAnswersArray;


// When user clicks the 'Generate Questions' button, call the first API
generateQuestionsButton.addEventListener("click", function(event) {
    
    // Collecting selected items from multiple dropdown lists 
    var allDropdowns = document.getElementsByTagName('SELECT');
    for(i = 0; i < allDropdowns.length; i++) {
        var dropdownList = allDropdowns[i];
        var temporaryHolder = [];
        for(j = 0; j < dropdownList.length; j++) {
          if(dropdownList[j].selected){
            temporaryHolder.push(dropdownList[j].value);
        };  
        }
        chosenOptions.push(temporaryHolder);
    }
    console.log(JSON.stringify(chosenOptions)); 
    // produces a JSON holding all the user's chosen options

    categoryChosen = chosenOptions[0][0];
    languageChosen = chosenOptions[1][0];
    quantityChosen = chosenOptions[2][0];

    getQuizQuestions(categoryChosen, quantityChosen);
    // maybe add a line to clear chosenOptions after the result is sent off

});



// function to fetch quiz questions from the Quiz API
function getQuizQuestions(category, quantity) {
    
    var fetchURL = `${quizApiURL}/api/v1/questions?apiKey=${quizApiKey}&category=${category}&difficulty=Easy&limit=${quantity}`; 
    // we may later also allow user choose difficulty
    fetch(fetchURL)
    .then((response) => response.json())
    .then(function(data){
        questionsGotten = data;
        console.log(questionsGotten);
    })
    .then(function(){
        // For each question gotten, go into the array to find text for questions and answers, then assign them to variables
        for (i = 0; i < questionsGotten.length; i++) {
            var questionArray = [];
            var questionText = questionsGotten[i]['question'];
            var answerAText = questionsGotten[i]['answers']['answer_a'];
            var answerBText = questionsGotten[i]['answers']['answer_b'];
            var answerCText = questionsGotten[i]['answers']['answer_c'];
            var answerDText = questionsGotten[i]['answers']['answer_d'];
            questionArray.push(questionText, answerAText, answerBText, answerCText, answerDText);
            questionArrayStringified = questionArray.toString();
            console.log(questionArrayStringified);

            // push the questionText and answerText variables to the translator API
            translateQuestions(languageChosen, questionArrayStringified);
        }
    })
    .catch(function(error){
        console.error(error);
    })

}



// function that takes the quiz question generated from QuizAPI and passes it to the Translator API
function translateQuestions(language,text){

    // Don't bother translating if the user selects english
    if (language === "en"){
        console.log("Language is english so i cant translate"); // change this to continue without running the translator API
    } else {
        // if user selected any language other than english, push langaugaeChosen and questionText as arguments through the API
        const encodedParams = new URLSearchParams();
        encodedParams.append("source_language", "en");
        encodedParams.append("target_language", language);
        encodedParams.append("text", text);

        const options = {
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'X-RapidAPI-Key': translatorApiKey,
                'X-RapidAPI-Host': 'text-translator2.p.rapidapi.com'
            },
            body: encodedParams
        };

        fetch('https://text-translator2.p.rapidapi.com/translate', options)
            .then((response) => response.json())
            .then(function(data){
                translatedQuestion = data;
                console.log(translatedQuestion);
            })
            // then pick out the part of the result you need and 
            .then(function(){
                var newQuestionAndAnswers = translatedQuestion.data.translatedText;
                newQuestionAndAnswersArray = newQuestionAndAnswers.split(",");
                console.log(newQuestionAndAnswersArray);
            })
            // then save everything to local storage
            .then(function(){
                // declaring a variable to hold a string of all previous questions
                var oldQuestions = localStorage.getItem("questionsAndAnswersString");

                // if there were no previous questions, create a new array, but if there are, capture them into an array
                if (oldQuestions === null) {
                    questionsAndAnswersArray = [];
                } else {
                    questionsAndAnswersArray = JSON.parse(oldQuestions);
                };

                // add this new questions and answers set to the existing array from previous questions
                questionsAndAnswersArray.push(newQuestionAndAnswersArray);

                // write the full record to local storage
                localStorage.setItem("questionsAndAnswersString", JSON.stringify(questionsAndAnswersArray));

            })
            // then take the user to the results page
            .catch(err => console.error(err));
    }
};

// figure out a way to clear local storage 
// future: figure out how to indicate which is the correct answer among the options
// future: look at the possibility of handling a question with commas
// future: more topics, higher quantity of arrays
// future: change difficulty between easy, medium and hard

