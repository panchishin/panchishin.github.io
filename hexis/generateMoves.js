var generateMoves = function( modelParameter ) {

	var model = modelParameter

	return function generateMoves( previous ) {

		if ( previous.minimaxMoves ) {
			// no operation
		} else if ( previous.i == undefined ) {

			previous.minimaxMoves = {}
			previous.minimaxMoves[ [model.size-1,model.size-1] ] = [model.size-1,model.size-1]

		} else {

			generateMoves( previous.previous )
			var others = previous.previous.minimaxMoves
			var keys = Object.keys(others)

			previous.minimaxMoves = {};
	
			for( var index = 0 , max = keys.length ; index < max ; index++ ) {
				var key = keys[index]
				previous.minimaxMoves[ key ] = others[ key ]
			}
		
			// add previous move
			previous.minimaxMoves[ [previous.i , previous.j] ] = [previous.i , previous.j]
	
			// add all the moves around the last move
			for ( var index = 0 , max = model._neighbours.length ; index < max ; index++ ) {
				var neighbour = model._neighbours[index]
				var location = [ previous.i + neighbour[0] , previous.j + neighbour[1] ]
				if ( previous.board[ location[0] ] && previous.board[ location[0] ][ location[1] ] ) {
					previous.minimaxMoves[ location ] = location
				}
			}

		}

		var result = []
		var keys = Object.keys(previous.minimaxMoves)
		for( var index = 0 , max = keys.length ; index < max ; index++ ) {
			var key = keys[index]
		
			var move = model.createMove( previous.minimaxMoves[key][0] , previous.minimaxMoves[key][1] , previous )
			if (! model.checkPlacementRules(move) ) {
				result.push(move)
			}
		}
		return result
	
	}

}

try { 
if ( module ) {
	module.exports = generateMoves
}
} catch ( e ) { }
