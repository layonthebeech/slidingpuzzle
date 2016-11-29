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
    console.log('yes',times)
    for(var time in times) {
      if(times[time]) {
        var minutes = Math.floor(times[time] / 60) < 10 ? '0' + String(Math.floor(times[time] / 60)) : Math.floor(times[time] / 60);
        var seconds = (times[time] - minutes * 60) < 10 ? '0' + String(times[time] - minutes * 60) : times[time] - minutes * 60;
        $('.score'+time).text(minutes +':'+seconds);
      } else {
        $('.score'+time).text('--:--');
      }
    }
  }

  checkHighScore();

  function newHighScore() {
    var minutes = parseInt($('.clock').text().split(':')[0]);
    var seconds = parseInt($('.clock').text().split(':')[1]);
    var newScoreSeconds = 0;
    newScoreSeconds+= (minutes * 60) + seconds;
    if(localStorage.getItem(gameType) > newScoreSeconds ) {
      localStorage.setItem(gameType, newScoreSeconds);
      $('.score'+gameType).text($('.clock').text());
    }
  }

  function startTimer() {
    var time = 0;
    clearInterval(timerID)
    timerID = setInterval(function() {
      //console.log(timerID)
      time++;
      var minutes = Math.floor(time / 60) < 10 ? '0' + String(Math.floor(time / 60)) : Math.floor(time / 60);
      var seconds = (time - minutes * 60) < 10 ? '0' + String(time - minutes * 60) : time - minutes * 60;
      //console.log(seconds)
      $('.clock').text(minutes + ':' + seconds);
    }, 1000);
    //clearInterval(intervalID)
  }

  function stopTimer() {
    clearInterval(timerID);
  }

  function winGame() {
    stopTimer();
    var win = document.createElement('div');
    win.id = "win"
    win.className="winBox"
    win.innerHTML = '<div class="wonText"> You Won! </div>'+
                     '<div class="playAgain"> Play Again </div>';
    $('.playArea').append(win);
    $('#tiles').css('pointer-events','none')
    $('.playAgain').click(function(){
      $('#tiles').remove();
      $('.winBox').remove();
      $('.playArea').append(newGame);
      $('.click').click(function(){
        startGame($(this))
      });

    });
    newHighScore();
  }

  function shuffle(array) {
    var shuffled = [];
    var copiedArray = array.slice(0);
    while (shuffled.length < array.length) {
      //console.log(shuffled.length,array.length)
      var i = Math.floor(Math.random() * copiedArray.length)
      shuffled.push(copiedArray[i])
      copiedArray.splice(i, 1)
    }
    return shuffled;
  }

  function checkScore() {
    var q = 1
    for (var i = 0; i < twoDArray.length; i++) {
      for (var j = 0; j < twoDArray[i].length; j++) {
        console.log(q, twoDArray[i][j])
        if (twoDArray[i][j] !== q && twoDArray[i][j] !== undefined) {
          return false;
        } else {
          q++;
        }
      }
    }
    return true;
  }

  function moveTile(tile) {
    var t = tile.attr('id')
    var emptyIndex = 0;
    var tileIndex = 0;
    for (var i = 0; i < twoDArray.length; i++) {
      for (var j = 0; j < twoDArray[i].length; j++) {
        if (twoDArray[i][j] === undefined) {
          emptyIndex = [i, j];
        } else if (twoDArray[i][j] == t) {
          tileIndex = [i, j];
        }
      }
    }
    var numberOfMoves = 0;
    if (tileIndex[0] === emptyIndex[0]) {
      numberOfMoves = Math.abs(emptyIndex[1] - tileIndex[1])
      if (tileIndex[1] < emptyIndex[1]) {
        console.log('move right')
        for (var i = tileIndex[1]; i <= emptyIndex[1]; i++) {
          $('#' + String(twoDArray[tileIndex[0]][i])).velocity({
            translateX: tileCoordinates[tileIndex[0]][i][0] + tileDimensions[gameType]
          }, 25)
          tileCoordinates[tileIndex[0]][i] = [tileCoordinates[tileIndex[0]][i][0] + tileDimensions[gameType], tileCoordinates[tileIndex[0]][i][1]]
        }
        var t1 = tileCoordinates[tileIndex[0]].splice(emptyIndex[1], 1);
        tileCoordinates[tileIndex[0]].splice(tileIndex[1], 0, t1[0]);
        var t2 = twoDArray[tileIndex[0]].splice(emptyIndex[1], 1);
        twoDArray[tileIndex[0]].splice(tileIndex[1], 0, t2[0]);
      } else if (tileIndex[1] > emptyIndex[1]) {
        console.log('Move Left')
        for (var i = tileIndex[1]; i >= emptyIndex[1]; i--) {
          $('#' + String(twoDArray[tileIndex[0]][i])).velocity({
            translateX: tileCoordinates[tileIndex[0]][i][0] - tileDimensions[gameType]
          }, 25)
          tileCoordinates[tileIndex[0]][i] = [tileCoordinates[tileIndex[0]][i][0] - tileDimensions[gameType], tileCoordinates[tileIndex[0]][i][1]]
        }
        var t1 = tileCoordinates[tileIndex[0]].splice(emptyIndex[1], 1);
        tileCoordinates[tileIndex[0]].splice(tileIndex[1], 0, t1[0]);
        var t2 = twoDArray[tileIndex[0]].splice(emptyIndex[1], 1);
        twoDArray[tileIndex[0]].splice(tileIndex[1], 0, t2[0]);
      }
    } else if (tileIndex[1] === emptyIndex[1]) {
      if (tileIndex[0] < emptyIndex[0]) {
        console.log('Move Down');
        var t2 = [];
        var t1 = [];
        for (var i = tileIndex[0]; i <= emptyIndex[0]; i++) {
          $('#' + String(twoDArray[i][tileIndex[1]])).velocity({
            translateY: tileCoordinates[i][tileIndex[1]][1] + tileDimensions[gameType]
          },25)
          tileCoordinates[i][tileIndex[1]] = [tileCoordinates[i][tileIndex[1]][0], tileCoordinates[i][tileIndex[1]][1] + tileDimensions[gameType]]
          t1.push(tileCoordinates[i].splice(tileIndex[1], 1)[0]);
          t2.push(twoDArray[i].splice(tileIndex[1], 1)[0]);
        }
        t1.unshift(t1.pop())
        t2.unshift(t2.pop())
        for (var i = 0, j = tileIndex[0]; i < t2.length; i++, j++) {
          tileCoordinates[j].splice(tileIndex[1], 0, t1[i])
          twoDArray[j].splice(tileIndex[1], 0, t2[i]);
        }

      } else if (tileIndex[0] > emptyIndex[0]) {
        console.log('Move Up')
        var t2 = [];
        var t1 = [];
        for (var i = tileIndex[0]; i >= emptyIndex[0]; i--) {
          $('#' + String(twoDArray[i][tileIndex[1]])).velocity({
            translateY: tileCoordinates[i][tileIndex[1]][1] - tileDimensions[gameType]
          },25)
          tileCoordinates[i][tileIndex[1]] = [tileCoordinates[i][tileIndex[1]][0], tileCoordinates[i][tileIndex[1]][1] - tileDimensions[gameType]]
          t1.unshift(tileCoordinates[i].splice(tileIndex[1], 1)[0]);
          t2.unshift(twoDArray[i].splice(tileIndex[1], 1)[0]);
        }
        t1.push(t1.shift())
        t2.push(t2.shift())
        for (var i = 0, j = emptyIndex[0]; i < t2.length; i++, j++) {
          tileCoordinates[j].splice(tileIndex[1], 0, t1[i]);
          twoDArray[j].splice(tileIndex[1], 0, t2[i]);
        }
      }
    }
    console.log(checkScore());
    if (checkScore() === true) {
      winGame();
    }
  }

  function startGame(reference) {
    newGame = $('.newGame');
    $('.newGame').remove();
    var tiles = document.createElement('div');
    tiles.id = "tiles";
    $('.playArea').append(tiles);
    var gameSize = reference.attr('id');
    gameType = gameSize;
    var numbers = [];
    for (var i = 0; i < (gameSize * gameSize) - 1; i++) {
      numbers.push(i + 1);
    }
    shuffledArray = shuffle(numbers)
    twoDArray = [];
    var q = 0;
    for (var i = 0; i < Math.sqrt(shuffledArray.length); i++) {
      twoDArray[i] = [];
      tileCoordinates[i] = [];
      for (var j = 0; j < Math.sqrt(shuffledArray.length); j++) {
        twoDArray[i][j] = shuffledArray[q]
        tileCoordinates[i][j] = [0, 0]
        q++;
      }
    }
    for (var i = 0; i < twoDArray.length; i++) {
      for (var j = 0; j < twoDArray[i].length; j++) {
        if (i !== twoDArray.length - 1 || j !== twoDArray[i].length - 1) {
          var tile = document.createElement('div');
          tile.id = String(twoDArray[i][j]);
          tile.className = "tile tile" + gameSize;
          tile.innerHTML = String(twoDArray[i][j]);
          $('#tiles').append(tile);
        } else {
          twoDArray[i][j] === 'empty'
        }
      }
      $('.clock').text('00:00');
      startTimer();
    }
    $('.tile').click(function() {
      moveTile($(this));
    });
  }

  $('.click').click(function() {
    console.log('yup')
    startGame($(this));
  });

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
