$(document).ready(function() {
  var shuffledArray = [];
  var twoDArray = [];
  var tileCoordinates = [];
  var time = 0;
  var timerID;
  var newGame = null;
  var events = null;

  var tileDimensions = {
    '4': 80,
    '5': 64,
    '6': 53
  }

  var gameType = '';

  function checkHighScore() {

    var times = {
      '4' : localStorage.getItem('4'),
      '5' : localStorage.getItem('5'),
      '6' : localStorage.getItem('6')
    }

    for(var time in times) {
      if(times[time]) {
        //if there is a recorded time in the local storage, set it in the high score
        var minutes = Math.floor(times[time] / 60) < 10 ? '0' + String(Math.floor(times[time] / 60)) : Math.floor(times[time] / 60);
        var seconds = (times[time] - minutes * 60) < 10 ? '0' + String(times[time] - minutes * 60) : times[time] - minutes * 60;
        $('.score'+time).text(minutes +':'+seconds);
      } else {
        //if not, make it an empty high score
        $('.score'+time).text('--:--');
      }
    }
  }
  //check for highscores when loading the page
  checkHighScore();

  function newHighScore() {
    //grab the time from the win
    var minutes = parseInt($('.clock').text().split(':')[0]);
    var seconds = parseInt($('.clock').text().split(':')[1]);
      //change the score to seconds
    var  newScoreSeconds += (minutes * 60) + seconds;
    //if the time is less than the high score set it
    if(localStorage.getItem(gameType) && localStorage.getItem(gameType) > newScoreSeconds ) {
      localStorage.setItem(gameType, newScoreSeconds);
      $('.score'+gameType).text($('.clock').text());
    } else if(!localStorage.getItem(gameType)) {
      //if there's no high score set it
      localStorage.setItem(gameType, newScoreSeconds);
      $('.score'+gameType).text($('.clock').text());
    }
  }

  function startTimer() {
    var time = 0;
    //clear the Timer
    clearInterval(timerID);
    //start a timer and save the id
    timerID = setInterval(function() {
      //second counter
      time++;
      //minute and second conversion
      var minutes = Math.floor(time / 60) < 10 ? '0' + String(Math.floor(time / 60)) : Math.floor(time / 60);
      var seconds = (time - minutes * 60) < 10 ? '0' + String(time - minutes * 60) : time - minutes * 60;
      //change the timer element
      $('.clock').text(minutes + ':' + seconds);
    }, 1000);
  }

  function stopTimer() {
    //clear the timer
    clearInterval(timerID);
  }

  function winGame() {
    //stop the timer when you win the game
    stopTimer();
    //create win box
    var win = document.createElement('div');
    win.id = "win"
    win.className="winBox"
    win.innerHTML = '<div class="wonText"> You Won! </div>'+
    '<div class="playAgain"> Play Again </div>';
    $('.playArea').append(win);
    //can't click on tiles when you win
    $('#tiles').css('pointer-events','none');
    //start over
    $('.playAgain').click(function(){
      $('#tiles').remove();
      $('.winBox').remove();
      $('.playArea').append(newGame);
      $('.click').click(function(){
        //call start game
        startGame($(this))
      });

    });
    //change high score if need be
    newHighScore();
  }

  //shuffle function

  function shuffle(array,blankIndex, counter) {
    var availableShifts = [];
    var shiftIndex;
    if(counter === 1000) {
      //do this 1000 times
      return array;
    } else {
      //if there is a number above the blank space save its index
      if(blankIndex[0]-1 >= 0) {
        availableShifts.push([blankIndex[0]-1,blankIndex[1]]);
      }
      //if there is a number below the blank space save its index
      if(blankIndex[0]+1 < array.length){
        availableShifts.push([blankIndex[0]+1,blankIndex[1]]);
      }
      //if there is a number left of the blank space save its index
      if(blankIndex[1]-1 >= 0) {
        availableShifts.push([blankIndex[0],blankIndex[1]-1]);
      }
      //if there is a number right of the blank space save its index
      if(blankIndex[1]+1 < array.length) {
        availableShifts.push([blankIndex[0],blankIndex[1]+1]);
      }
      //randomly pick an available tile
      shiftIndex = Math.floor(Math.random() * availableShifts.length);
      //save the index of the shifting tile
      var shift = availableShifts[shiftIndex];
      //shift tile to blank index
      array[blankIndex[0]][blankIndex[1]] = array[shift[0]][shift[1]];
      //shift blank tile to where tile was
      array[shift[0]][shift[1]] = undefined;
      //change blank index
      blankIndex = availableShifts[shiftIndex];
      //recurse
      return  shuffle(array,blankIndex,counter+=1);
    }
  }
  //check to see if you won
  function checkScore() {
    //array counter needs to be run seperate of the for loop counters
    var q = 1;

    for (var i = 0; i < twoDArray.length; i++) {
      for (var j = 0; j < twoDArray[i].length; j++) {
        //if the numbers aren't in order, return false
        if (twoDArray[i][j] !== q && twoDArray[i][j] !== undefined) {
          return false;
        } else {
          q++;
        }
      }
    }
    //will only be hit if the numbers are in sequential order
    return true;
  }
//move tile function
  function moveTile(tile) {
    //save tile by id
    var tileID = tile.attr('id');
    var emptyIndex = 0;
    var tileIndex = 0;

    //cycle through the array of numbers
    for (var i = 0; i < twoDArray.length; i++) {
      for (var j = 0; j < twoDArray[i].length; j++) {

        //save off blank tile
        if (twoDArray[i][j] === undefined) {
          emptyIndex = [i, j];
        } else if (twoDArray[i][j] == tileID) {
          //save off index of clicked tile in array
          tileIndex = [i, j];
        }
      }
    }
    //keep track of how many tiles to move
    var numberOfMoves = 0;
    //if the tile and blank space are on the same y plane
    if (tileIndex[0] === emptyIndex[0]) {
      //find how many tiles in between the tile and empty index so you can move them all
      numberOfMoves = Math.abs(emptyIndex[1] - tileIndex[1]);
      //if the tile is to the left of the blank space, move it right
      if (tileIndex[1] < emptyIndex[1]) {
        console.log('move right');
        for (var i = tileIndex[1]; i <= emptyIndex[1]; i++) {
          //actually move the elements using velocity
          $('#' + String(twoDArray[tileIndex[0]][i])).velocity({
            translateX: tileCoordinates[tileIndex[0]][i][0] + tileDimensions[gameType]
          },1)
          //keep track of all the tile coordinates for velocity
          tileCoordinates[tileIndex[0]][i] = [tileCoordinates[tileIndex[0]][i][0] + tileDimensions[gameType], tileCoordinates[tileIndex[0]][i][1]];
        }
        //move the tile coordinates in the array to the correct place
        //since this is moving right, we are gonna put the empty index at the front and push the tiles to the right
        var t1 = tileCoordinates[tileIndex[0]].splice(emptyIndex[1], 1);
        tileCoordinates[tileIndex[0]].splice(tileIndex[1], 0, t1[0]);
        //do the same thing to keep track of where the numbers are
        var t2 = twoDArray[tileIndex[0]].splice(emptyIndex[1], 1);
        twoDArray[tileIndex[0]].splice(tileIndex[1], 0, t2[0]);
      } else if (tileIndex[1] > emptyIndex[1]) {
        console.log('Move Left')
        for (var i = tileIndex[1]; i >= emptyIndex[1]; i--) {
          $('#' + String(twoDArray[tileIndex[0]][i])).velocity({
            translateX: tileCoordinates[tileIndex[0]][i][0] - tileDimensions[gameType]
          },1)
          tileCoordinates[tileIndex[0]][i] = [tileCoordinates[tileIndex[0]][i][0] - tileDimensions[gameType], tileCoordinates[tileIndex[0]][i][1]]
        }
        var t1 = tileCoordinates[tileIndex[0]].splice(emptyIndex[1], 1);
        tileCoordinates[tileIndex[0]].splice(tileIndex[1], 0, t1[0]);
        var t2 = twoDArray[tileIndex[0]].splice(emptyIndex[1], 1);
        twoDArray[tileIndex[0]].splice(tileIndex[1], 0, t2[0]);
      }
    } else if (tileIndex[1] === emptyIndex[1]) { //if the tile and blank tile are in the same x plane
      if (tileIndex[0] < emptyIndex[0]) {
        console.log('Move Down');
        var t2 = [];
        var t1 = [];
        for (var i = tileIndex[0]; i <= emptyIndex[0]; i++) {
          $('#' + String(twoDArray[i][tileIndex[1]])).velocity({
            translateY: tileCoordinates[i][tileIndex[1]][1] + tileDimensions[gameType]
          },1)
          tileCoordinates[i][tileIndex[1]] = [tileCoordinates[i][tileIndex[1]][0], tileCoordinates[i][tileIndex[1]][1] + tileDimensions[gameType]];
          t1.push(tileCoordinates[i].splice(tileIndex[1], 1)[0]);
          t2.push(twoDArray[i].splice(tileIndex[1], 1)[0]);
        }
        t1.unshift(t1.pop())
        t2.unshift(t2.pop())
        for (var i = 0, j = tileIndex[0]; i < t2.length; i++, j++) {
          tileCoordinates[j].splice(tileIndex[1], 0, t1[i]);
          twoDArray[j].splice(tileIndex[1], 0, t2[i]);
        }
      } else if (tileIndex[0] > emptyIndex[0]) {
        console.log('Move Up');
        var t2 = [];
        var t1 = [];
        for (var i = tileIndex[0]; i >= emptyIndex[0]; i--) {
          $('#' + String(twoDArray[i][tileIndex[1]])).velocity({
            translateY: tileCoordinates[i][tileIndex[1]][1] - tileDimensions[gameType]
          },1)
          tileCoordinates[i][tileIndex[1]] = [tileCoordinates[i][tileIndex[1]][0], tileCoordinates[i][tileIndex[1]][1] - tileDimensions[gameType]];
          t1.unshift(tileCoordinates[i].splice(tileIndex[1], 1)[0]);
          t2.unshift(twoDArray[i].splice(tileIndex[1], 1)[0]);
        }
        t1.push(t1.shift());
        t2.push(t2.shift());
        for (var i = 0, j = emptyIndex[0]; i < t2.length; i++, j++) {
          tileCoordinates[j].splice(tileIndex[1], 0, t1[i]);
          twoDArray[j].splice(tileIndex[1], 0, t2[i]);
        }
      }
    }
    //if checkscore returns true you win
    if (checkScore() === true) {
      winGame();
    }
  }
//startgame function
  function startGame(reference) {
    //remove new game element
    newGame = $('.newGame');
    $('.newGame').remove();
    //create the tiles container
    var tiles = document.createElement('div');
    tiles.id = "tiles";
    //append it
    $('.playArea').append(tiles);
    //check what size game
    var gameSize = reference.attr('id');
    gameType = gameSize;
    var numbers = [];
    //push numbers into array that is one dimensional
    for (var i = 0; i < (gameSize * gameSize) - 1; i++) {
      numbers.push(i + 1);
    }
    twoDArray = [];
    var q = 0;
    //make it two dimensional array
    for (var i = 0; i < Math.sqrt(numbers.length); i++) {
      twoDArray[i] = [];
      tileCoordinates[i] = [];
      for (var j = 0; j < Math.sqrt(numbers.length); j++) {
        twoDArray[i][j] = numbers[q];
        tileCoordinates[i][j] = [0, 0];
        q++;
      }
    }
    //shuffle the array
    shuffledArray = shuffle(twoDArray,[twoDArray.length-1,twoDArray[twoDArray.length-1].length-1],0);
    for (var i = 0; i < shuffledArray.length; i++) {
      for (var j = 0; j < shuffledArray[i].length; j++) {
        //if the array number isn't the blank space, append the tile
        if(shuffledArray[i][j] !== undefined) {
          var tile = document.createElement('div');
          tile.id = String(shuffledArray[i][j]);
          tile.className = "tile tile" + gameSize;
          tile.innerHTML = String(shuffledArray[i][j]);
          $('#tiles').append(tile);
        } else {
          //if it's undefined change to the blank class
          var tile = document.createElement('div');
          tile.id = String(shuffledArray[i][j]);
          tile.className = "blank tile" + gameSize;
          tile.innerHTML = '</br>';
          $('#tiles').append(tile);
        }
      }
      //set timer text to 0
      $('.clock').text('00:00');
      //start timer
      startTimer();
    }
    //move tile when clicking
    $('.tile').click(function() {
      moveTile($(this));
    });
  }
  //start game when clicking
  $('.click').click(function() {
    startGame($(this));
  });
  //new game click
  $('.reset').click(function() {
    $('#tiles').remove();
    stopTimer();
    $('.playArea').append(newGame);
    $('.click').click(function() {
      startGame($(this));
    })
    $('.clock').text('00:00');
  })
})
