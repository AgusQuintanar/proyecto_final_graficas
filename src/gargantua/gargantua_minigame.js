
//===== FUNCTION TO MAKE NEW QUESTIONS =====//
var createQuestion = function(prompt, correctAnswer) {
    this.prompt = prompt;
    this.correctAnswer = correctAnswer;
};


//===== CREATING NEW QUESTIONS FOR GAME A - DOT-DASH ====//
var q0 = new createQuestion ('...', 'S');
var q1 = new createQuestion ('-', 'T');
var q2 = new createQuestion ('.-', 'A');
var q3 = new createQuestion ('-.--', 'Y');
var q4a = new createQuestion ('-.-. .- -', 'CAT');
var q5a = new createQuestion ('.-. ..- -.', 'RUN');
var q6a = new createQuestion ('-.-. --- .-.. -..', 'COLD');
var q7a = new createQuestion ('.-.. --- ...- .', 'LOVE');
var q8a = new createQuestion ('-... --- - - --- --', 'BOTTOM');
var q9a = new createQuestion ('..-. .- -- .. .-.. -.--', 'FAMILY');

//===== AN OBJECT TO REPRESENT ALL GAME ELEMENTS TOGETHER =====/
var game = {
    currentQuestion: 0,
    questions: [q0, q1, q2, q3],
    isGameOver: false,
    playerScore: 0
};

//===== STARTER VARIABLES =====//
var playerScore;
var timeLeft = 60; //chart time countdown
var interval=0;

$(document).ready(function(){
    
console.log("App is running.");




//===== HIDE SHOW CHART =====//

    $('.hideshow').on('click', function(event){
        $('#testbox').toggleClass('bigbox');
   
        $('.count').html(timeLeft);
         console.log("interval:" + interval);
         if(interval === 0 && timeLeft > 0) {
             time();
         } else {
               clearInterval(interval);
               interval = 0;
         }
    });
});





var time = function (){
    interval = setInterval(function(){
        if(timeLeft <= 0) {
            timeLeft = 0;
        } else {
            timeLeft--;
        }
        $('.count').html(timeLeft);

        if (timeLeft === 10) {
            $('.count').css("color", "red");
            $('.count').css("font-size", "2em");
        }

        if (timeLeft === 0) {
            $('#chartmsg').removeClass("disappear");
            $('#testbox').hide();
            $('.hideshow').hide();
        }
     
    }, 1000);
       
}; 

//===== START BUTTON =====//
$('#bigbtn').on('click', function(event){
    $('#pre').hide();
    $('#learnchart').hide();
    $('#pretitle').hide();
    $('.pregame').addClass('disappear');
    $('#score').removeClass('disappear');
    $('#time').removeClass('disappear');
    $('#testbox').removeClass('bigbox');
    $('.hideshow').removeClass('disappear');
    $('#testbox').removeClass('disappear');
    $('#dotdashgame').removeClass('disappear');
    $('#qn h3').text(game.questions[game.currentQuestion].prompt);
    $('#prompts h3').text("Mensaje " + (game.currentQuestion + 1) + " de " + numberOfQuestions());
});

//====== UPDATES DISPLAY TEXT FOR QUESTIONS =======//
var updateDisplay = function(){
    if (game.isGameOver === true) {
        $('#qn h3').html("");
        $('#prompts h3').html("El juego ha terminado").effect('bounce', 2000);
        $('#chartmsg').hide();
        $('#chartmsg').addClass('disappear');
        $('#status').hide();
        $('form').hide();
        $('#playbtn').hide();
        $('.peek').removeClass('disappear');
        $('#enter h3').text('Volver a comenzar?');
        $('#enter').on('click', function(event){
            window.location = "./gargantua_minigame.html";
        });
            
    }
    else {
        $('#qn h3').html(game.questions[game.currentQuestion].prompt);
        $('#prompts h3').html("Mensaje " + (game.currentQuestion + 1) + " de " + numberOfQuestions());
        console.log(game.questions[game.currentQuestion]);
    }
};



//====== UPDATES DISPLAY TEXT FOR MESSAGES =======//
var displayMsg = function(input) {
    if (game.isGameOver === true) {
     $('#status').text("");   
    }
    if (game.questions[game.currentQuestion].correctAnswer === input)
    {
        return 'Increible! Eso es correcto!';
    }
    else {
        return 'Incorrecto! Descifra el siguiente mensaje.';
    }
};


$('#status').text(displayMsg(game.questions[game.currentQuestion]));


//===== CURRENT QUESTION =====//
var currentQuestion = function(){
    return game.currentQuestion;
};




//===== NO. OF QUESTIONS =====//
var numberOfQuestions = function (){
    return game.questions.length;
};



//===== FUNCTION TO CALL CORRECT ANSWER FROM THE GAME A OBJECT =====//
var correctAnswer = function(){
    return game.questions[game.currentQuestion].correctAnswer;
};


//===== IS GAME OVER should return a true or false =====//
var isGameOver = function(){
    return game.isGameOver;    
};

//===== FUNCTION TO GET USER INPUT VALUE =====//

$("form :input").attr("autocomplete", "off");


$("input").keypress(function(event){
    if (event.which === 13) {
        event.preventDefault();

        var input = $('#playerinput').val().toUpperCase();
        $('#status').removeClass('disappear');
        $("#playerinput").val('');
        
        playTurn(input);
        updateDisplay();
    }
});

$('#enter').on('click', function(event) {
    var input = $('#playerinput').val().toUpperCase();
    console.log("user input:" + input);
    console.log("player score:" + playerScore);
    $('#status').removeClass('disappear');
    $("#playerinput").val('');

    playTurn(input);
    updateDisplay();
       
});


//===== PLAY TURN =====//
var playTurn = function(input){
    console.log("user:" + input);
    if (game.isGameOver === true) {return false;}
    // var correct = false;
    if (input === game.questions[game.currentQuestion].correctAnswer) {
        correct = true;
        game.playerScore++ ;
        $('#score p').html(game.playerScore);
        $("#status").html(displayMsg(input));
        $("#status").effect('bounce', 2000);
    }
    if (input !== game.questions[game.currentQuestion].correctAnswer) {
        correct = false;
        console.log("playTurn no playerScore:" + game.playerScore);
        console.log("Playturn: Wrong. Better luck for this next one.");
        
        displayMsg(input);
        $("#status").html(displayMsg(input));
        $("#status").effect('shake', 500);
       

    }
    ++ game.currentQuestion;
    if (game.currentQuestion === numberOfQuestions()) {
        if (game.playerScore === game.questions.length) {
            alert("You got all the questions right! You are a true master of the game!");
        }
        game.isGameOver = true;
        
    }
    // return correct;
};




//===== GAME RESTART =====//
var restart = function() {
    console.log('restarts game and timer.');
    timer = 60;
    game.currentQuestion = 0;
    game.isGameOver = false;
    game.playerScore = 0;
    updateMainDisplay();
};