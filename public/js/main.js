$(document).ready(function() {
	var audio_element = document.createElement('audio');
	audio_element.setAttribute('src', '/sound/move_final.mp3');

	var board = {
		/*
		8: ['', 8, 4, 6, 10, 12, 6, 4, 8],
		7: ['', 2, 2, 2, 2, 2, 2, 2, 2],
		6: ['', 0, 0, 0, 0, 0, 0, 0, 0],
		5: ['', 0, 0, 0, 0, 0, 0, 0, 0],
		4: ['', 0, 0, 0, 0, 0, 0, 0, 0],
		3: ['', 0, 0, 0, 0, 0, 0, 0, 0],
		2: ['', 1, 1, 1, 1, 1, 1, 1, 1],
		1: ['', 7, 3, 5, 11, 9, 5, 3, 7]
		*/
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
	});

	$('section#board img').draggable({ containment: 'section#board', cursorAt: { top: 50, left: 50 }, revert: 'invalid' });
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

			var board_to = board[col_to][row_to];
			if((color === 'white' && board_to % 2 !== 0) || (color === 'black' && board_to % 2 === 0 && board_to !== 0)) {
				// prevent moving onto another piece
				return false;
			}

			if(piece === 'pawn') {
				if((Math.abs(col_to - col) === 1 && Math.abs(row_to - row) === 1)) {
					// diagonal piece take
					var take = board[col_to][row_to];
					if(take !== 0 && take !== 11 && take !== 12) {
						return true;
					}
				} else if((color === 'white' && row == 2) || (color === 'black' && row == 7)) {
					// first move double
					if(color === 'white') {
						return col_to === col && row_to - row <= 2;
					} else if(color === 'black') {
						return col_to === col && row_to < row && row_to - row <= 2;
					}
				} else if((color === 'white' && row_to > row) || (color === 'black' && row_to < row)) {
					// single move
					return col_to === col && Math.abs(row_to - row) <= 1;
				}
			} else if(piece === 'knight') {
				return (Math.abs(col_to - col) === 2 && Math.abs(row_to - row) === 1) || (Math.abs(col_to - col) === 1 && Math.abs(row_to - row) === 2);
			} else if(piece === 'bishop') {
				return Math.abs(col_to - col) === Math.abs(row_to - row);
			} else if(piece === 'rook') {
				return (col_to === col) || (row_to === row);
			} else if(piece === 'queen') {
				return (col_to === col) || (row_to === row) || (Math.abs(col_to - col) === Math.abs(row_to - row));
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
				piece   = $(ui.draggable).attr('class').split(' ')[0];

			board[col][row] = 0;
			board[col_to][row_to] = pieces[piece];

			audio_element.play();

			if($('#' + dropped).children('img').length > 0) {
				$('#' + dropped).children('img').removeClass('ui-draggable').appendTo('#taken');
			}

			$(ui.draggable).parent('div').removeClass('down').children('img').appendTo('#' + dropped).css({ 'top': 0, 'left': 0 });
		}
	});
});