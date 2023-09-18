$(document).ready(function () {
    let guessnumber;
    let chance;
    let userinput;
    let queue = [];

    const DOM = {
        document: $(document),
        window: $(window),
        playBtn: $(".play-btn"),
        chancesLevelInput: $(".chances, .level-input"),
        msg: $(".msg"),
        numberHistory: $(".number-history"),
        playAgain: $(".play-again-btn"),
        heart: $(".heart"),
        allButtons: $("button"),
        levelSelect: $("#levelSelect"),
        volumeControls: $(".volume-controls"),
        bgMusic : $("#background-music"),
        soundEffects: $("#sound-effect"),
        playForm: $('.play-form'),
        levelInput: $(".level-input"),
        guessNumber: $("#guessnum"),
        
        audioControl: function (dataset) {
            return $(`audio[data-link=${dataset}]`);
        },
        hearts: function (chance) {
            let visibleHearts = $(`.heart:not(.one-chance-less):visible`);
            return $(`.heart[data-chance=${visibleHearts.length-1}]:visible`);
        },
        heartLevels : function(chance1, chance2){
            return $(`.heart[data-level=${chance1}], .heart[data-level=${chance2}]`)
        },
        guessnumError: function(){
            return $('#guessnum-error');
        } 
    }

    //1st parameter should be hide class and 2nd should be showclass
    const hideShow = function (hideClass, showClass) {
        $(hideClass).addClass('d-none');
        $(showClass).removeClass('d-none');
    }

    // To show the numbers entered till now by the user
    const numHistory = function(guess, message) {
        const enterednumbers = document.createElement("li");
        if (guess) {
            enterednumbers.innerHTML = `<span class="text-primary font-weight-bold">Correct number was: ${guessnumber}</span>`;
        }
        else {
            enterednumbers.textContent = message;
        }
        document.querySelector(".number-history").appendChild(enterednumbers)
        queue.push(userinput);
    }

    const gameSound = function (wrong) {
        if (wrong === true) {
            DOM.soundEffects.attr("src", "music/wrong-guess.mp3");
        }
        if (wrong === "win") {
            DOM.soundEffects.attr("src", "music/Win.mp3");
        }
        if (wrong === "outOfMoves") {
            DOM.soundEffects.attr("src", "music/out-of-moves.mp3");
        }
        if (wrong === "alert") {
            DOM.soundEffects.attr("src", "music/alert-tone.wav");
        }

        if (DOM.soundEffects > 0 && !DOM.soundEffects.paused) {
            DOM.soundEffects.pause();
            DOM.soundEffects.currentTime = 0;
            DOM.soundEffects.play();
        }
        else {
            DOM.soundEffects[0].play();
        }
    }

    const playBtnClick = function () {
        guessnumber = Number.parseInt(Math.ceil(Math.random() * 10));
        $('.correct-num').html(guessnumber);
        chance = 3;
        queue = [];
        hideShow(DOM.playAgain, DOM.chancesLevelInput);
        DOM.msg.html("");
        DOM.numberHistory.html("");
        DOM.heart.removeClass("one-chance-less").addClass("bg-animate");
        DOM.guessNumber.removeClass('border border-danger error');
        DOM.guessnumError().hide();
        DOM.levelSelect.prop('selectedIndex',0);
        DOM.heartLevels(4,5).addClass('d-none');
    }

    const allButtonsClick = function () {
        DOM.bgMusic[0].play();
        DOM.bgMusic[0].volume = 0.01;
        if (this.dataset.parent && this.dataset.show) {
            hideShow(`.${this.dataset.parent}`, `.${this.dataset.show}`);
        }
    }
    
    const levelSelectChange = function () {
        DOM.guessNumber.attr('max', this.value);
        DOM.guessNumber.data('level-check', Number.parseInt(this.value));
        chance = +$(this).find('option:selected').attr('data-chance');
        DOM.heartLevels(chance, chance+1).addClass('d-none');
        DOM.heartLevels(chance, chance-1).removeClass('d-none');
        guessnumber = Number.parseInt(Math.ceil(Math.random() * this.value));
        $('.correct-num').html(guessnumber);
    }

    const volumeControlsClick =  function () {
        DOM.audioControl(this.dataset.link).each(function () {
            if (this.dataset.status === 'on') {
                this.muted = true;
                this.dataset.status = 'off';
            }
            else {
                this.muted = false;
                this.dataset.status = 'on';
            }
        });
        if (this.dataset.status === 'on') {
            $($(this)[0]).attr('src', this.dataset.off);
            this.dataset.status = 'off';
        }
        else {
            $($(this)[0]).attr('src', this.dataset.on);
            this.dataset.status = 'on';
        }

    };

    // Unmute the volume when game is active
    const windowFocus = function () {
        DOM.audioControl('music').each(function () {
            if (this.dataset.status === 'on') {
                this.muted = false;
            }
        });
    };

    // Mute the volume when game is inactive
    const windowBlur = function () {
        DOM.audioControl('music').each(function () {
            this.muted = true;
        });
    };

    const documentKeypress = function (event) {
        if (DOM.playForm.valid() && event.key === "Enter") {
            event.preventDefault();

            const greaterOrSmaller = function(msg){
                DOM.msg.html(msg);
                gameSound(true);
                chance--;
                DOM.hearts(chance).addClass("one-chance-less");
                DOM.hearts(chance).removeClass("bg-animate");
                numHistory(false, msg);
            }
            // Number entered by user, Math.floor to remove if float number entered
            userinput = Math.floor(DOM.guessNumber.val());
            
            // Check if number already not entered
            if(queue.indexOf(userinput) < 0){
            // smaller number
                if (userinput < guessnumber) {
                    greaterOrSmaller(`Sorry! The number ${userinput} is smaller than the correct number`);
                }

                // greater number
                else if (userinput > guessnumber) {
                    greaterOrSmaller(`Sorry! The number ${userinput} is greater than the correct number`);
                }
            
                //When no chances left
                if (!chance) {
                    DOM.msg.html("<img src='images/fail-img.gif' class='soryimg img-fluid'>");
                    hideShow(DOM.levelInput, DOM.playAgain);
                    gameSound("outOfMoves");
                    numHistory(guessnumber);
                }

                //Congrats
                if (userinput == guessnumber) {
                    DOM.msg.html("<img src='images/success-img.gif' class='correct img-fluid' width='450'>");
                    hideShow(DOM.chancesLevelInput, DOM.playAgain);
                    gameSound("win");
                    numHistory(guessnumber);
                }

            }
            else{
                DOM.msg.html(`You have already guessed ${userinput}, Guess another number`);
            }
            
            DOM.guessNumber.val('');
        }

        //If the number is not within Range, audio will be played
        else if (DOM.guessNumber.hasClass('error')) {
            gameSound("alert");
        }
    };

    //All user events at one place
    DOM.playBtn.on('click', playBtnClick);
    DOM.allButtons.on("click", allButtonsClick);
    DOM.levelSelect.on('change', levelSelectChange);
    DOM.volumeControls.on('click', volumeControlsClick);
    $(window).on('focus', windowFocus);
    $(window).on('blur', windowBlur);
    $(document).on("keypress", documentKeypress);
});
