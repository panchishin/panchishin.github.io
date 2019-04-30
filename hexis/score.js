
var scoreModule = function( modelParameter ) {

	var model = modelParameter

	var centerValue = model.size - 1

	return function( move ) {
		var score = 0;
		var oppositeColor = model.oppositeColor(move.color)

		myBestCount = 0
		theirBestCount = 0

		var checkDirection = function( getSpace ) {
			// check horizontal all lines
			for( var i = 0 ; i < move.board.length ; i++ ) {
				var myCount = 0;
				var theirCount = 0;
				for( var j = 0 ; j < move.board[i].length ; j++ ) {
					var space = getSpace( i , j , move.board )
					if ( space == move.color ) {
						myCount += 1
						theirCount = 0
					} else if ( space == oppositeColor ) {
						theirCount += 1
						myCount = 0
					} else {
						myCount = 0
						theirCount = 0
					}
					if ( Math.floor(myBestCount) == myCount ) { myBestCount += .1 }
					if ( Math.floor(theirBestCount) == theirCount ) { theirBestCount += .1 }
					myBestCount = Math.max(myCount,myBestCount)
					theirBestCount = Math.max(theirCount,theirBestCount)			
				}
			}
		}	
	
		checkDirection( function( i , j , board ) {
			if ( board[i] ) return board[i][j]
			return undefined
		})
		checkDirection( function( i , j , board ) {
			if ( board[j] ) return board[j][i]
			return undefined
		})
		checkDirection( function( i , j , board ) {
			if ( board[centerValue+i-j] ) return board[centerValue+i-j][j]
			return undefined
		})


		// check circles	
		for( var i = 2 ; i < move.board.length ; i++ ) for( var j = 0 ; j < move.board[i].length - 3 ; j++ ) {
			var count = model.circleSizeOne(move,i,j)
			var myCount = count[move.color]
			var theirCount = count[oppositeColor]
			if ( Math.floor(myBestCount) == myCount ) { myBestCount += 1 }
			if ( Math.floor(theirBestCount) == theirCount ) { theirBestCount += 1 }
			myBestCount = Math.max(myCount,myBestCount)
			theirBestCount = Math.max(theirCount,theirBestCount)			
		}
	
		return myBestCount - theirBestCount
	}

}


try {
if ( module ) {
	module.exports = scoreModule
}
} catch ( e ) { }
