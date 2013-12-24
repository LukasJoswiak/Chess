$(document).ready(function() {
	var audio_element = document.createElement('audio');
	audio_element.setAttribute('src', '/sound/move_final.mp3');

	board = {
		8: ['', 7, 1, 0, 0, 0, 0, 2, 8],
		7: ['', 3, 1, 0, 0, 0, 0, 2, 4],
		6: ['', 5, 1, 0, 0, 0, 0, 2, 6],
		5: ['', 11, 1, 0, 0, 0, 0, 2, 12],
		4: ['', 9, 1, 0, 0, 0, 0, 2, 10],
		3: ['', 5, 1, 0, 0, 0, 0, 2, 6],
		2: ['', 3, 1, 0, 0, 0, 0, 2, 4],
		1: ['', 7, 1, 0, 0, 0, 0, 2, 8]
	};

	var pieces = {
		'white_pawn': 1,
		'black_pawn': 2,
		'white_knight': 3,
		'black_knight': 4,
		'white_bishop': 5,
		'black_bishop': 6,
		'white_rook': 7,
		'black_rook': 8,
		'white_queen': 9,
		'black_queen': 10,
		'white_king': 11,
		'black_king': 12
	};

	$('section#board').on('mousedown', 'img', function() {
		$('section#board div').removeClass('down');

		var id = $(this).parent('div').addClass('down').attr('id');
	}).on('click', '.promote', function() {
		var promote  = $(this).attr('class').split(' ')[0],
			selector = $(this).parent('div'),
			col 	 = selector.attr('id').split('-')[0],
			row 	 = selector.attr('id').split('-')[1];

		selector.html('<img src="/img/' + promote + '.png" class="' + promote + '" />');
		board[col][row] = pieces[promote];
		$('section#board img').draggable({ containment: 'section#board', cursorAt: { top: 50, left: 50 }, revert: 'invalid', revertDuration: 10 });
	});

	$('section#board img').draggable({ containment: 'section#board', cursorAt: { top: 50, left: 50 }, revert: 'invalid', revertDuration: 10 });
	$('section#board .column div').droppable({
		tolerance: 'intersect',
		accept: function(e) {
			var from   = $(e).parent('div').attr('id').split('-'),
				col    = from[0],
				row	   = from[1],
				to 	   = $(this).attr('id').split('-'),
				col_to = to[0],
				row_to = to[1],
				whole  = $(e).attr('class').split(' ')[0],
				color  = whole.split('_')[0],
				piece  = whole.split('_')[1];

			en_passant = false;

			var board_to = board[col_to][row_to];
			if((color === 'white' && board_to % 2 !== 0) || (color === 'black' && board_to % 2 === 0 && board_to !== 0)) {
				// prevent moving onto another piece of same color
				return false;
			}

			if(piece === 'pawn') {
				if((Math.abs(col_to - col) === 1 && Math.abs(row_to - row) === 1)) {
					// diagonal piece take
					var take = board[col_to][row_to];
					if(take !== 0 && take !== 11 && take !== 12) {
						return true;
					} else if(take === 0 && ((color === 'black' && row_to == 3) || (color === 'white' && row_to == 6))) {
						// en passant
						en_passant = true;
						return true;
					}
				} else if((color === 'white' && row == 2) || (color === 'black' && row == 7)) {
					// first move double
					if(color === 'white') {
						return col_to === col && row_to - row <= 2 && board[col][parseInt(row) + 1] === 0 && board[col_to][row_to] === 0;
					} else if(color === 'black') {
						return col_to === col && row_to < row && row - row_to <= 2 && board[col][parseInt(row) - 1] === 0 && board[col_to][row_to] === 0;
					}
				} else if((color === 'white' && row_to > row) || (color === 'black' && row_to < row)) {
					// single move
					return col_to === col && Math.abs(row_to - row) <= 1 && board[col_to][row_to] === 0;
				}
			} else if(piece === 'knight') {
				return (Math.abs(col_to - col) === 2 && Math.abs(row_to - row) === 1) || (Math.abs(col_to - col) === 1 && Math.abs(row_to - row) === 2);
			} else if(piece === 'bishop') {
				return between(col, row, col_to, row_to, piece) && Math.abs(col_to - col) === Math.abs(row_to - row);
			} else if(piece === 'rook') {
				return between(col, row, col_to, row_to, piece) && ((col_to === col) || (row_to === row));
			} else if(piece === 'queen') {
				return between(col, row, col_to, row_to, piece) && ((col_to === col) || (row_to === row) || (Math.abs(col_to - col) === Math.abs(row_to - row)));
			} else if(piece === 'king') {
				var col_result = Math.abs(col_to - col),
					row_result = Math.abs(row_to - row);
				return (col_result === 0 || col_result === 1) && (row_result === 0 || row_result === 1);
			}

			return false;
		},
		drop: function(e, ui) {
			var from = $(ui.draggable).parent('div').attr('id').split('-'),
				col     = from[0],
				row	    = from[1],
				dropped = $(this).attr('id'),
				col_to  = dropped.split('-')[0],
				row_to  = dropped.split('-')[1],
				whole   = $(ui.draggable).attr('class').split(' ')[0],
				color	= whole.split('_')[0],
				piece	= whole.split('_')[1];

			/*if(!between(col, row, col_to, row_to, piece.split('_')[1])) {
				console.log("FALSE");
				return false;
			}*/

			if(en_passant) {
				if(!en_passant_check(col, row, col_to, row_to, color, previous_move)) {
					$(ui.draggable).css({ 'top': 0, 'left': 0 });
					return false;
				}
			}

			board[col][row] = 0;
			board[col_to][row_to] = pieces[whole];

			audio_element.play();

			if($('#' + dropped).children('img').length > 0) {
				$('#' + dropped).children('img').removeClass('ui-draggable').appendTo('#taken');
			}

			$(ui.draggable).parent('div').removeClass('down').children('img').appendTo('#' + dropped).css({ 'top': 0, 'left': 0 });

			if(piece === 'pawn' && (row_to == 8 || row_to == 1)) {
				// pawn promotion
				$(ui.draggable).hide();
				$('<img src="/img/' + color + '_knight.png" class="' + color + '_knight promote" /><img src="/img/' + color + '_bishop.png" class="' + color + '_bishop promote" /><img src="/img/' + color + '_rook.png" class="' + color + '_rook promote" /><img src="/img/' + color + '_queen.png" class="' + color + '_queen promote" />').appendTo('#' + dropped);
			}

			previous_move = {
				'col': col,
				'row': row,
				'col_to': col_to,
				'row_to': row_to,
				'color': color,
				'piece': piece
			};
		}
	});

	function en_passant_check(col, row, col_to, row_to, color, previous) {
		console.log( Math.abs(parseInt(col) - parseInt(previous['col'])));

		if(previous['color'] !== color && (previous['row'] == 2 || previous['row'] == 7) && Math.abs(parseInt(col) - parseInt(previous['col'])) == 1 && previous['col_to'] == col_to) {
			if(color === 'white') {
				var remove = parseInt(row_to) - 1;
			} else if(color === 'black') {
				var remove = parseInt(row_to) + 1;
			}

			board[previous['col_to']][previous['row_to']] = 0;
			$('#' + col_to + '-' + remove).children('img').appendTo('#taken');

			return true;
		}

		return false;
	}

	function between(col, row, col_to, row_to, piece) {
		var col_var   = parseInt(col),
			row_var   = parseInt(row),
			col_step  = 1,
			row_step  = 1;

		var predicate = function(i, j) { return j <= row_to; }

		if(col_to === col && piece !== 'bishop') {
			// up or down
			col_step = 0;
			if(row_to > row) {
				// up
				north = true;
				row_var = parseInt(row) + 1;
			} else if(row_to < row) {
				// down
				south = true;
				row_var = parseInt(row) - 1;
				row_step = -1;
				predicate = function(i, j) { return j >= row_to; }
			}
		} else if(row_to === row && piece !== 'bishop') {
			// left or right
			row_step = 0;
			if(col_to > col) {
				// right
				east = true;
				col_var = parseInt(col) + 1;
				predicate = function(i, j) { return i <= col_to; }
			} else if(col_to < col) {
				// left
				west = true;
				northeast = false;
				col_var = parseInt(col) - 1;
				col_step = -1;
				predicate = function(i, j) { return i >= col_to; }
			}
		} else if(Math.abs(col_to - col) === Math.abs(row_to - row) && (piece === 'bishop' || piece === 'queen')) {
			// diagonal
			if(col_to > col) {
				// right
				if(row_to > row) {
					// up
					col_var = parseInt(col) + 1;
					row_var = parseInt(row) + 1;
					predicate = function(i, j) { return i <= col_to && j <= row_to; }
				} else if(row_to < row) {
					// down
					console.log('right down');
					col_var = parseInt(col) + 1;
					row_var = parseInt(row) - 1;
					row_step = -1;
					predicate = function(i, j) { return i <= col_to && j >= row_to; }
				}
			} else if(col_to < col) {
				// left
				if(row_to > row) {
					// up
					console.log('left up');
					col_var = parseInt(col) - 1;
					row_var = parseInt(row) + 1;
					col_step = -1;
					predicate = function(i, j) { return i >= col_to && j <= row_to; }
				} else if(row_to < row) {
					// down
					col_var = parseInt(col) - 1;
					row_var = parseInt(row) - 1;
					col_step = -1;
					row_step = -1;
					predicate = function(i, j) { return i >= col_to && j >= row_to; }
				}
			}
		}

		// console.log("Col: " + col + "\nRow: " + row + "\nCol to: " + col_to + "\nRow to: " + row_to + "\nCol var: " + col_var + "\nRow var: " + row_var + "\nPredicate: " + predicate(col_var, row_var) + "\n");

		for(var i = col_var, j = row_var; predicate(i, j); i += col_step, j += row_step) {
			if(board[i][j] !== 0) {
				if(i != col_to || j != row_to) {
					return false;
				}
			}
		}

		return true;
	}
});