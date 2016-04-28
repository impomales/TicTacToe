$(document).ready(function() {
  /*
    possible states represented as a k-ary decision tree of gameStates
    between the player and the computer.
    
    In this representation, x always goes first.
  */
  var root = createTree();
  minimax(root, true);
  $("#myModal").modal();
  
  var humanPlayer = "";
  var currentState = root;
  
  $("#myModal").on('hidden.bs.modal', function (e) {
    if (humanPlayer === 'O')
      aiturn();
  });
  
  // player's decicion
  $("td").click(function() {
    var coord = this.id;
    for (var i = 0; i < currentState.children.length; i++) {
      var child = currentState.children[i];
      if (child.id === coord) {
        currentState = child;
        $(this).html(otherPlayer(currentState.player));
        $(this).css("color", "#000");
        break;
      }
    }
    
    if (currentState.children.length === 0) {
      announceWinner();
    }
    aiturn();
  });
  
  // a.i.'s decision
  function aiturn() {
    var max = currentState.children[0];
    for (var i = 1; i < currentState.children.length; i++) {
      var child = currentState.children[i];
      if (humanPlayer === 'O') {
        if (max.value < child.value) 
          max = child;
      } else {
        if (max.value > child.value)
          max = child;
      }
    }
    
    currentState = max;
    $("#" + currentState.id).html(otherPlayer(currentState.player));
    $(this).css("color", "#000");
    
    if (currentState.children.length === 0) {
      announceWinner();
    }
  }

  /*
    minimax algorithm used for a.i. decision making.
  */
  function minimax(state, maxPlayer) {
    if (state.children.length === 0) return state.value;

    if (maxPlayer) {
      var bestValue = Number.MIN_SAFE_INTEGER;
      for (var i = 0; i < state.children.length; i++) {
        var v = minimax(state.children[i], false);
        bestValue = Math.max(bestValue, v);
      }
      state.value = bestValue;
      return bestValue;
    } else {
      var bestValue = Number.MAX_SAFE_INTEGER;
      for (var i = 0; i < state.children.length; i++) {
        var v = minimax(state.children[i], true);
        bestValue = Math.min(bestValue, v);
      }
      state.value = bestValue;
      return bestValue;
    }
  }

  /*
    creates a tree of game states recursively.
    returns the root of the tree.
  */
  function createTree() {
    // empty board.
    var player = 'X';
    var initBoard = [
      [' ', ' ', ' '],
      [' ', ' ', ' '],
      [' ', ' ', ' ']
    ];
    var spaces = [];
    for (var i = 0; i < initBoard.length; i++) {
      for (var j = 0; j < initBoard[i].length; j++) {
        spaces.push([i, j]);
      }
    }
    // initial state has id -1.
    // other states, id is indices of player's move. 
    var root = new gameState("-1", initBoard, player, spaces, [], null);

    for (var i = 0; i < root.spaces.length; i++) {
      var move = root.spaces[i];
      var movesLeft = clone(root.spaces);
      var newBoard = clone(root.board);
      movesLeft.splice(i, 1);
      id = "" + move[0] + move[1];
      newBoard[move[0]][move[1]] = player;
      var child = new gameState(id, newBoard, otherPlayer(player), movesLeft, [], null);
      root.children.push(child);
      createTreeR(child, 1);
    }
    return root;
  }

  function createTreeR(state, depth) {
    // if there is a winner a heuristic value is assigned.
    if (state.isWinner(otherPlayer(state.player))) {
      state.value = score(otherPlayer(state.player));
      return state;
    }
    // if no more space, there is a tie with value set to zero. 
    if (state.spaces.length === 1) {
      state.value = 0;
      return state;
    }

    for (var i = 0; i < state.spaces.length; i++) {
      var move = state.spaces[i];
      var movesLeft = clone(state.spaces);
      var newBoard = clone(state.board);
      movesLeft.splice(i, 1);
      id = "" + move[0] + move[1];
      newBoard[move[0]][move[1]] = state.player;
      var child = new gameState(id, newBoard, otherPlayer(state.player), movesLeft, [], null);
      state.children.push(child);
      createTreeR(child, depth++);
    }
  }

  // current state of game.
  function gameState(id, board, player, spaces, children, value) {
    // props.
    this.id = id;
    this.board = board; // 3 x 3 char array of board, 'X', 'O', or ' '.
    this.player = player; // current player, 'X' or 'O'.
    this.spaces = spaces; // indices of available spaces.
    this.children = children; // next possible gameStates.
    this.value = value; // heuristic value for decision making.

    // methods.
    /*
      tests if there is a winner by checking all possible wins.
    */
    this.isWinner = function isWinner(current) {
      var downDiag = true,
        upDiag = true;
      for (var i = 0; i < this.board.length; i++) {
        var wonHoriz = true,
          wonVert = true;
        // check diagonal wins.
        if (board[i][i] !== current) downDiag = false;
        if (board[i][board.length - i - 1] !== current) upDiag = false;
        // check horizontal and vertical wins.
        for (var j = 0; j < this.board[i].length; j++) {
          if (board[i][j] !== current) wonHoriz = false;
          if (board[j][i] !== current) wonVert = false;
        }
        if (wonHoriz || wonVert) return true;
      }

      if (downDiag || upDiag) return true;
      return false;
    };

    this.toString = function(depth) {
      str = "id: " + this.id + "\n";
      str = "player: " + this.player + "\n";
      str += "board: " + this.board.toString() + "\n";
      str += "spacesLeft: " + this.spaces.toString() + "\n";
      str += "value: " + this.value + "\n";
      str += "depth: " + depth;
      if (depth === 0) return str;
      for (var i = 0; i < this.children.length; i++) {
        str += "child" + i + ":\n\t" + children[i].toString(depth--) + "\n";
      }
      return str;
    };
  }
  
  // deal with this later.
  function announceWinner() {
    var message;
    if (currentState.value > 0) {
      message = 'X won!';
    } else  if (currentState.value < 0) {
      message = 'O won!';
    } else {
      message = 'Game is tied!';
    }
    
    $("#endMessage").html(message);
    $("#myModalEnd").modal();
    
    $("#myModalEnd").on('hidden.bs.modal', function (e) {
      $("td").empty();
      currentState = root;
      $("#myModal").modal();
    });
  }

  // returns hueristic value of winning player.
  // x defined as 1, o defined as -1.
  function score(player) {
    return player === 'X' ? 1 : -1;
  }

  // returns the player whose turn is next.
  function otherPlayer(player) {
    return player === 'X' ? 'O' : 'X';
  }

  // makes a copy of nested arrays, used for board and spaces.
  function clone(arr) {
    var copy;
    if (Array.isArray(arr)) {
      copy = arr.slice();
      for (var i = 0; i < copy.length; i++) {
        copy[i] = clone(copy[i]);
      }
      return copy;
    }
    return arr;
  }
  
  $("td").hover(function() {
    if ($(this).html() === ' ') {
      $(this).html(humanPlayer);
      $(this).css("color", "#ccc");
    }
  }, function() {
    var coord = this.id;
    if (currentState.board[coord[0]][coord[1]] === ' ')
      $(this).html(' ');
      $(this).css("color", "#000");
  });

  $("#Xbutton").click(function() {
    humanPlayer = 'X';
  });
  $("#Obutton").click(function() {
    humanPlayer = 'O';
  });
});