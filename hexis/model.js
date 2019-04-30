var INVALID = "invalid" , EMPTY = "empty" , RED = "red" , BLUE = "blue"


var model = {

	size : 6,
	
	_neighbours : [
		[ -1 , 0 ] , [ -1 , +1 ] , [ 0 , 1 ] , [ 1 , 0 ] , [ 1 , -1 ] , [ 0 , -1 ]
	],

	_placement_rules : [
		{ 
			name : "0 : not on an invalid space",
			test : function( move ) {
				// move = { board : board , i : i , j : j , color : color , previous : previous }
				return move.board[move.i][move.j] == INVALID
			}
		},
		{
			name : "1 : not on a space you occupy",
			test : function( move ) {
				// move = { board : board , i : i , j : j , color : color , previous : previous }
				return move.board[move.i][move.j] == move.color
			}
		},
		{
			name : "2 : not on the space that was just played on",
			test : function( move ) {
				// move = { board : board , i : i , j : j , color : color , previous : previous }
				return move.previous && move.i == move.previous.i && move.j == move.previous.j
			}
		},
		{
			name : "3 : not on an occupied space surrounded by occupied spaces",
			test : function( move ) {
				// move = { board : board , i : i , j : j , color : color , previous : previous }
				var count = move.board[move.i][move.j] != EMPTY ? 1 : 0
			
				for( var index  = 0 ; index < model._neighbours.length ; index++ ) {
					var plus_i = model._neighbours[index][0];
					var plus_j = model._neighbours[index][1];
					if ( 
						( ! move.board[move.i + plus_i] ) || 
						( ! move.board[move.i + plus_i][move.j + plus_j] ) || 
						( move.board[move.i + plus_i][move.j + plus_j] != EMPTY )
					) {
						count ++
					}
				}
				return count == 7
			}
		},
		{
			name : "4 : cannot replace a space if last move was to replace a space",
			test : function( move ) {
				
				return ( move.previous && move.previous.previous && move.previous.previous.previous &&
					move.previous.previous.previous.board[move.previous.previous.i][move.previous.previous.j] != EMPTY &&
					move.previous.board[move.i][move.j] != EMPTY )
			
			}
		},
		{
			name : "5 : not such that the board returns to a previously seen configuration",
			test : function( move ) {
				// move = { board : board , i : i , j : j , color : color , previous : previous }
				var boardsEqual = function( b1 , b2 ) {
					for( var i = 0 ; i < b1.length ; i++ ) {
						for( var j = 0 ; j < b1[i].length ; j++ ) {
							if ( b1[i][j] != b2[i][j] ) { return false }
						}
					}
					return true			
				}
			
				var previousSpace = move.board[move.i][move.j]
				move.board[move.i][move.j] = move.color
			
				var checkBoard = move.previous
				var count = 0;
				while( checkBoard ) {
					if ( move.board && checkBoard.board && boardsEqual( move.board , checkBoard.board ) ) { 
						move.board[move.i][move.j] = previousSpace
						return true
					}
					checkBoard = checkBoard.previous
				}
				move.board[move.i][move.j] = previousSpace
				return false
			}
		}
	],

	lineSize : function( move ) {
		var checkLine = function( i , j , di , dj ) {
			if ( move.board[i+di] && move.board[i+di][j+dj] == move.color ) {
				return 1 + checkLine( i+di , j+dj , di , dj )
			} else {
				return 0
			}
		}

		var max = 0	
		for( var index = 0 ; index < 3 ; index++ ) {
			var length = checkLine( move.i , move.j , model._neighbours[index][0] , model._neighbours[index][1] ) +
				checkLine( move.i , move.j , model._neighbours[index+3][0] , model._neighbours[index+3][1] )
			max = max < length ? length : max					
		}
		return max + ( move.board[ move.i ][ move.j ] == move.color ? 1 : 0 )
	},

	circleSize : function( move ) {
		var max = 0
		for( var start  = 0 ; start < model._neighbours.length ; start++ ) {
			var count = this.circleSizeOne( move , move.i + model._neighbours[start][0] , move.j + model._neighbours[start][1] )
			if ( max < count[move.color] ) { max = count[move.color] }
		}
		return max
	},

	circleSizeOne : function( move , i , j ) {
		var count = { invalid : 0 , empty : 0 , red : 0 , blue : 0 }
		for( var step  = 0 ; step < model._neighbours.length ; step++ ) {
			var location = { 
				i : i + model._neighbours[ step ][0], 
				j : j + model._neighbours[ step ][1]
			}
			if ( move.board[location.i] &&  move.board[location.i][location.j] ) {
				count[ move.board[location.i][location.j] ]++
			} else {
				return { invalid : 0 , empty : 0 , red : 0 , blue : 0 }
			}
		}
		return count
	},

	_win_conditions : [
		{
			name : "a line of 6 in a row",
			test : function( move ) {
				return model.lineSize(move) >= 6
			}
		},
		{
			name : "a circle of 6",
			test : function( move ) {
				return model.circleSize(move) >= 6
			}
		},
		{
			name : "opponent cannot place their next piece.",
			test : function( move ) {
				for( var i = 0 ; i < move.board.length ; i++ ) {
					for( var j = 0 ; j < move.board.length ; j++ ) {
						if ( move.board[i][j] == EMPTY ) {
							return false
						}
					}
				}
				return true
			}
		}
	],

	createEmptyBoard : function() {
		var size = this.size
		var width = size * 2 - 1
		var board = []
		var middle = []
		for( var count = 0 ; count < width ; count++ ) {
			middle.push( EMPTY )
		}
		board.push(middle)

		for( var i = size-2 ; i >= 0 ; i-- ) {
			var ontop = [] , bottom = []
			for( var count = 1 ; count < size - i ; count++ ) {
				ontop.push( INVALID )
			}
			for( var count = 0 ; count < i+size ; count++ ) {
				ontop.push( EMPTY )
				bottom.push( EMPTY )
			}
			board.unshift(ontop)
			board.push(bottom)
		}
		return board
	},

	checkPlacementRules : function( move ) {
		// check placement rules
		for( var index = 0 ; index < this._placement_rules.length ; index++) {
			var rule = this._placement_rules[index]
			if ( !rule.disabled && rule.test && rule.test( move ) ) {
				return rule
			}
		}
		return undefined
	},

	checkWinConditions : function( move ) {
		for( var index in model._win_conditions ) {
			if ( model._win_conditions[index].test(move) ) {
				return model._win_conditions[index]
			}
		}
		return undefined
	},

	_copyBoard : function( board ) {
		var newBoard = []
		for( var i = 0 , maxI = board.length ; i < maxI ; i++ ) {
			newBoard.push([])
			for( var j = 0 , maxJ = board[i].length ; j < maxJ ; j++ ) {
				newBoard[i*1][j*1] = board[i*1][j*1]
			}
		}
		return newBoard
	},
	
	createMove : function( i , j , previous ) {
		return { 
			board : this._copyBoard(previous.board) , 
			i : i , 
			j : j , 
			color : this.oppositeColor(previous.color) , 
			previous : previous
		}
	},

	createFirstMove : function() {
		return { board : this.createEmptyBoard() , color: BLUE }
	},

	oppositeColor : function( color ) {
		return color == RED ? BLUE : RED
	}

}


try {
if ( module ) {
	module.exports = model
}
} catch ( e ) { }

