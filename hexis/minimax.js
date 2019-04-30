var MAX_SCORE = Math.pow(10,50);

var scoreModifier = function( moveDepth ) {
	return ( moveDepth % 2 ) * 2 - 1  // odd levels are players move, even are opponent
}
	
var calculateTopLevel = function( workQueue ) { 
	return workQueue[0] ? Math.max( workQueue[0].depth - 1 , 0 ) : 0
}
	
var prune = function( depth , workQueue ) {
	while( workQueue[0] && workQueue[0].depth > depth ) {
		workQueue.shift()
	}
	return calculateTopLevel(workQueue)
}

var maximizeLogic = {
	isPrune : function( score , parent ) { return score >= parent.beta },
	isUpdate : function( score , parent ) { return score > parent.alpha },
	doUpdate : function( score , parent ) { parent.alpha = score },
	getElseScore : function( parent ) { return parent.alpha }
}

var minimizeLogic = {
	isPrune : function( score , parent ) { return score <= parent.alpha },
	isUpdate : function( score , parent ) { return score < parent.beta },
	doUpdate : function( score , parent ) { parent.beta = score },
	getElseScore : function( parent ) { return parent.beta }
}

var updateAllParentsAlphaBetaBasedOnScore = function( workItem , workQueue ) {

	// update the previous minimax scores
	var topLevel = calculateTopLevel(workQueue)
	var score = workItem.score
	var parent = workItem.previous

	var updateParentAlphaBeta = function( score , parent ) {
		var logic = parent.depth % 2 == 0 ? maximizeLogic : minimizeLogic
		
		if ( logic.isPrune(score,parent) ) {
			topLevel = prune( parent.depth , workQueue )
		} 
		if ( logic.isUpdate(score,parent) ) {
			logic.doUpdate(score,parent)
			parent.best = workItem
		} else {
			score = logic.getElseScore(parent)
			workItem = parent.best
		}
		return score
	}

	while( parent && parent.depth >= topLevel ) {
		score = updateParentAlphaBeta(score,parent)
		parent = parent.previous					
	}

}

var expandWorkItem = function( generateMoves , workItem , workQueue ) {

	if ( workItem.previous ) {
		workItem.alpha = workItem.previous.alpha
		workItem.beta = workItem.previous.beta
	}

	var moves = generateMoves( workItem.move )
	for ( var i = moves.length - 1 ; i >= 0 ; i-- ) {
		var move = moves[i]
		move.board[ move.i ][ move.j ] = move.color
		workQueue.unshift({ 
			move : move , 
			depth : workItem.depth + 1 , 
			previous : workItem , 
			alpha : workItem.alpha , 
			beta : workItem.beta ,
			best : workItem.best
		})
	}
	
}

var minimax = function( initialization ) {

	var scoreFunction = initialization.scoreFunction
	var generateMoves = initialization.generateMoves
	var checkWinConditions = initialization.checkWinConditions

	var workQueue = []
	var depth = 0
	var top = {}
	var start = {}


	return {
		setup : function( move , depthParameter , alpha , beta ) {
			start = move
			alpha = alpha == undefined ? Number.NEGATIVE_INFINITY : alpha
			beta  = beta  == undefined ? Number.POSITIVE_INFINITY : beta
			workQueue = [ { move : move , depth : 0 , alpha : alpha , beta : beta } ]
			depth = depthParameter ? depthParameter : 1
			top = workQueue[0]
		},

		prediction : function() {
			return top.best || {}
		},

		best : function() {
			if ( ! top.best || ! top.best.move ) { return false }
			var move = top.best.move
			while( move.previous && move.previous != start ) { move = move.previous }
			return move
		},

		alpha : function() {
			return top.alpha 
		},
		
		step : function( callback ) {
			var workItem = workQueue.shift()
			if ( ! workItem ) { callback(false); return }

			if ( workItem.score != undefined ) {

				updateAllParentsAlphaBetaBasedOnScore( workItem , workQueue );
				callback(true); return

			} else if ( workItem.depth > 0 && checkWinConditions( workItem.move ) ) {

				workItem.score = MAX_SCORE * scoreModifier( workItem.depth )
				workQueue.unshift(workItem)
				callback(true); return
				
			} else if ( workItem.depth < depth ) {
			
				expandWorkItem( generateMoves , workItem , workQueue);
				callback(true); return
				
			} else if ( workItem.depth == depth ) {

				var score = scoreFunction( workItem.move )
				workItem.score = score * scoreModifier( workItem.depth )				
				workQueue.unshift(workItem)
				callback(true);
				return;
				
			}
			callback(false)
		},
		
		allSteps : function( callback , count ) {
			count = count ? count : 0
			var that = this
			that.step( function( hasMore ) {
				if ( hasMore ) {
					if ( count > 1000 ) {
						setTimeout( function() { that.allSteps(callback) } , 0 )
					} else {
						that.allSteps(callback,count+1)
					}
				} else {
					callback()
				}
			})
		}
	}
}

try {
if ( module ) {
	module.exports = minimax
}
} catch ( e ) { }
