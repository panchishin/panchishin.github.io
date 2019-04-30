
function drawInitialBoard( move ) {
	var board = move.board
	for( var i in board ) {
		var row = board[i]
		 $("div.board").append("<div class='row' data-n='" + i + "'></div>")
		 $("div.board > div.row[data-n=" + i + "]").css("margin-left",(i-((board[0].length +1 )/ 2)+1)*1.05+"em")
		for ( var j in row ) {
			var element = row[j]
			$("div.board > div.row[data-n=" + i + "]").append("<div class='space " + element +"' data-n='"+j+"'></div>")
		}
	}
}

function refreshBoard( move ) {
	$("div.space.justPlayed").removeClass("justPlayed")
	$("div.board > div.row[data-n=" + previous.i + "] > div.space[data-n=" + previous.j + "]").addClass("justPlayed")
	for( var i in previous.board ) {
		for( var j in previous.board[i] ) {
			var square = $("div.board > div.row[data-n=" + i + "] > div.space[data-n=" + j + "]")
			square.removeClass( RED ).removeClass( BLUE ).removeClass( EMPTY ).addClass( previous.board[i][j] )
		}
	}
	$("p.output").html( (move.color ? model.oppositeColor(move.color) : RED) + "'s turn" )	
}

function toggleDisabled(index) {
	var $item = $("ul.rules li[data-index=" + index + "]")
	if ( model._placement_rules[index].disabled ) { 
		$item.addClass("disabled")
	} else {
		$item.removeClass("disabled")
	}
}

function drawRules() {
	$("ul.rules").empty()
	for( var i in model._placement_rules ) {
		$("ul.rules").append("<li data-index='"+i+"'"+">" + model._placement_rules[i].name + "</li>")
		toggleDisabled(i)
	}
}
drawRules()

$("ul li").on("click",function() { 
	var index = $(this).data("index")
	model._placement_rules[index].disabled = !model._placement_rules[index].disabled
	toggleDisabled(index)
})

var previous = {}
var redo = []
var gameOver = false


function newGame() {
	previous = model.createFirstMove()
	redo = []
	refreshBoard( previous )
	gameOver = false
}

newGame()
drawInitialBoard( previous )


$("div.start").on("click",function() {
	$("div.config").slideUp( { done: function() { 
		$("div.game").slideDown()
	}})
})
$("div.settings").on("click",function() {
	$("div.game").slideUp( { done: function() { 
		$("div.config").slideDown()
	}})
})


$("div.new").on("click",function() {
	newGame()
})


$("div.undo").on("click",function() {
	if ( previous.previous ) {
		redo.unshift(previous)
		previous = previous.previous
		refreshBoard( previous )
		gameOver = false
	}
})

$("div.redo").on("click",function() {
	if ( redo[0] ) {
		var temp = redo.shift()
		temp.previous = previous
		previous = temp
		refreshBoard( previous )
	}
})

var computerDifficulty = 0;

function setDifficulty(value) {
	$(".difficulty").removeClass("highlight");
	computerDifficulty = value;
	$(".difficulty[value*='"+value+"']").addClass("highlight");
};

$("div.difficulty").on("click",function() {
	setDifficulty($(this).attr("value"))
});


setDifficulty(4);

var scoreFunction = scoreModule(model)
var UNCERTAINTY = 0.5
var scoreFunctionUncertain = function( modelParameter ) {
	return scoreFunction( modelParameter ) + Math.random() * UNCERTAINTY - UNCERTAINTY / 2
}

var computerMovesCount = 0
var computerMove = function() {
	if ( computerMovesCount <= 0 ) return
	computerMovesCount--
	var startTime = Date.now()
	var createMinimax = function() {
		return minimax({
			scoreFunction : scoreFunctionUncertain,
			generateMoves : generateMoves(model),
			checkWinConditions : function ( move ) {
				return model.checkWinConditions(move)
			}
		})
	}
	var computerPlayer = createMinimax()

	computerPlayer.setup( previous , computerDifficulty )
	computerPlayer.allSteps( function() { 
	var move = computerPlayer.best()
	if ( move ) {
		console.log( move )
		makeMove( move.i*1 , move.j*1  )
	} else {
		$("p.output").html("You may not see it, but " + previous.color + " will win")
	}
	console.log("Elapse time : " + ( Date.now() - startTime ) )
	})
}
$("div.computer").on("click", function() { computerMovesCount++ ; computerMove()  } )



$("div.space:not(.invalid)").on("click" , function() {
	if ( gameOver ) { return }
	
	var i =  $(this).parent().data("n")
	var j = $(this).data("n")
	
	computerMovesCount = 1
	makeMove(i,j)
	

})

var makeMove = function( i , j ) {
	var space = $("div.board > div.row[data-n=" + i + "] > div.space[data-n=" + j + "]")
	// check placement rules
	var thisMove = model.createMove( i , j , previous )
	var rule = model.checkPlacementRules( thisMove )
	if ( rule ) {
		$("p.output").html("Invalid move " + thisMove.color + " because : " + rule.name )
	} else {
		$("div.space.justPlayed").removeClass("justPlayed")
		space.removeClass( model.oppositeColor(thisMove.color))
		space.addClass(thisMove.color)
		space.addClass("justPlayed")
		thisMove.board[i][j] = thisMove.color

		var win = model.checkWinConditions(thisMove)

		if ( win ) {
			$("p.output").html( thisMove.color + " won the game because " + win.name)
			gameOver = true
			return gameOver
		} else {
			$("p.output").html( model.oppositeColor(thisMove.color) + "'s turn" )
			setTimeout( computerMove , 1 )
		}

		previous = thisMove
	}
	return gameOver
}




