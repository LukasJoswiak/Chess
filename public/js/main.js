$(document).ready(function() {
	var audio_element = document.createElement('audio');
	audio_element.setAttribute('src', '/sound/move_final.mp3');

	/*var */board = {
		8: ['', 7, 1, 0, 0, 0, 0, 2, 8],
		7: ['', 3, 1, 0, 0, 0, 0, 2, 4],
		6: ['', 5, 1, 0, 0, 0, 0, 2, 6],
		5: ['', 11, 1, 0, 0, 0, 0, 2, 12],
		4: ['', 9, 1, 0, 0, 0, 0, 2, 10],
		3: ['', 5, 1, 0, 0, 0, 0, 2, 6],
		2: ['', 3, 1, 0, 0, 0, 0, 2, 4],
		1: ['', 7, 1, 0, 0, 0, 0, 2, 8],
		'turn': 'white',
		'castle': { 'white': [false, false, false], 'black': [false, false, false] },
		'taken': [],
		'moves': 0
	};

	var orig = {
		8: ['', 7, 1, 0, 0, 0, 0, 2, 8],
		7: ['', 3, 1, 0, 0, 0, 0, 2, 4],
		6: ['', 5, 1, 0, 0, 0, 0, 2, 6],
		5: ['', 11, 1, 0, 0, 0, 0, 2, 12],
		4: ['', 9, 1, 0, 0, 0, 0, 2, 10],
		3: ['', 5, 1, 0, 0, 0, 0, 2, 6],
		2: ['', 3, 1, 0, 0, 0, 0, 2, 4],
		1: ['', 7, 1, 0, 0, 0, 0, 2, 8],
		'turn': 'white',
		'castle': { 'white': [false, false, false], 'black': [false, false, false] },
		'taken': [],
		'moves': 0
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
		'black_king': 12,
		1: 'white_pawn',
		2: 'black_pawn',
		3: 'white_knight',
		4: 'black_knight',
		5: 'white_bishop',
		6: 'black_bishop',
		7: 'white_rook',
		8: 'black_rook',
		9: 'white_queen',
		10: 'black_queen',
		11: 'white_king',
		12: 'black_king'
	};

	var previous_move = {};

	var socket   	= io.connect('http://' + window.location.hostname + ':4000'),
		me 	     	= 'Player_' + Math.floor(Math.random() * 11110),
		my_color 	= 0,
		multiplayer = true; // CHANGE BACK TO LOCAL
		switched	= false;

	if(html5_storage()) {
		if(sessionStorage.getItem('name') !== null) {
			me = sessionStorage.getItem('name');
		}
	}

	$('#me').html(me);

	socket.on('connect', function() {
		socket.emit('add_user', me);
	});

	socket.on('update_players', function(data) {
		$('#users').empty();
		$.each(data, function(key) {
			var append = "<div>" + key + "</div>";
			if(key === me) {
				append = "<div class='me'>" + key + "</div>";
			}
			$('#users').append(append);
		});
	});

	socket.on('update', function(data) {
		if(data) {
			update(data.board, false, false, false);
			if(!switched)
				board = jQuery.extend(true, {}, data.board);
			console.log("");
		} else {
			console.log("There is a problem: " + data);
		}
	});

	socket.on('reset_game', function() {
		update(orig, true, true, false);
	});

	function update(new_board, reset, server, is_switched) {
		if(new_board['turn'] === 'black' && new_board['moves'] === 1) {
			switched = true;
		}

		if(switched && !is_switched) {
			board = jQuery.extend(true, {}, new_board);
			var rotated_board = jQuery.extend({}, new_board);

			for(var o = 1; o <= 8; o++) {
				rotated_board[o].push("");
				rotated_board[o].reverse();
				// board[o][0] = "";
			}

			rotated_board[1] = new_board[8];
			rotated_board[2] = new_board[7];
			rotated_board[3] = new_board[6];
			rotated_board[4] = new_board[5];
			rotated_board[5] = new_board[4];
			rotated_board[6] = new_board[3];
			rotated_board[7] = new_board[2];
			rotated_board[8] = new_board[1];

			if(board['moves'] === 0) {
				board['turn'] = 'black';
				board['moves'] = 1;
			}

			update(rotated_board, false, false, true);
			return;
		}

		for(var c = 1; c <= 8; c++) {
			for(var r = 1; r <= 8; r++) {
				var img = '';
				if(new_board[c][r] === 0) {
					$('#' + c + '-' + r).html('');
				} else if(new_board[c][r] !== board[c][r] || switched) {
					img = '<img src="/img/' + pieces[new_board[c][r]] + '.svg" class="' + pieces[new_board[c][r]] + '" />';
					$('#' + c + '-' + r).html(img);
				}
			}
		}

		if(board['taken'].length !== new_board['taken'].length) {
			$('#taken').html('');
			for(var g = 0; g < new_board['taken'].length; g++) {
				$('<img src="/img/' + pieces[new_board['taken'][g]] + '.svg" />').appendTo('#taken');
			}
		}

		if(reset) {
			board = {
				8: ['', 7, 1, 0, 0, 0, 0, 2, 8],
				7: ['', 3, 1, 0, 0, 0, 0, 2, 4],
				6: ['', 5, 1, 0, 0, 0, 0, 2, 6],
				5: ['', 11, 1, 0, 0, 0, 0, 2, 12],
				4: ['', 9, 1, 0, 0, 0, 0, 2, 10],
				3: ['', 5, 1, 0, 0, 0, 0, 2, 6],
				2: ['', 3, 1, 0, 0, 0, 0, 2, 4],
				1: ['', 7, 1, 0, 0, 0, 0, 2, 8],
				'turn': 'white',
				'castle': { 'white': [false, false, false], 'black': [false, false, false] },
				'taken': [],
				'moves': 0
			};

			multiplayer = true;
			my_color = 0;

			if(!server)
				socket.emit('reset');
		}

		$('section#board img').draggable({ containment: 'section#board', cursorAt: { top: 50, left: 50 }, revert: 'invalid', revertDuration: 10 });
		console.log("");
	}

	$('#edit_name').click(function() {
		if($('#save').is(':visible')) {
			$('#save').hide();
			$('#edit_name').html('edit name');
			$('#me').html(me);
		} else {
			$(this).html('cancel');
			$('#save').show();
			$('#me').html('<input type="text" name="name" value="' + $('#me').html() + '" />').children('input').select();
		}
	});

	$('#me').on('keydown', 'input', function(e) {
		var code = e.keyCode || e.which;

		if(code === 13) {
			$('#save_name').trigger('click');
		}
	});

	$('#save_name').click(function() {
		$('#save').hide();
		$('#edit_name').html('edit name');
		var old = me;
		me = $('input[name=name]').val();
		$('#me').html(me);

		if(html5_storage()) {
			sessionStorage.setItem('name', me);
		}

		socket.emit('update_user', { old: old, me: me });
	});

	$('#reset').click(function() {
		update(orig, true, false, false);
	});

	$('section#board').on('mousedown', 'img', function() {
		$('section#board div').removeClass('down');

		var id = $(this).parent('div').addClass('down').attr('id');
	}).on('click', '.promote', function() {
		var promote  = $(this).attr('class').split(' ')[0],
			selector = $(this).parent('div'),
			col 	 = selector.attr('id').split('-')[0],
			row 	 = selector.attr('id').split('-')[1];

		selector.html('<img src="/img/' + promote + '.svg" class="' + promote + '" />');
		board[col][row] = pieces[promote];
		$('section#board img').draggable({ containment: 'section#board', cursorAt: { top: 50, left: 50 }, revert: 'invalid', revertDuration: 10 });
	});

	$('section#board img').draggable({ containment: 'section#board', cursorAt: { top: 50, left: 50 }, revert: 'invalid', revertDuration: 10 });
	$('section#board .column div').droppable({
		tolerance: 'intersect',
		accept: function(e) {
			var from   = $(e).parent('div').attr('id').split('-'),
				col    = parseInt(from[0]),
				row	   = parseInt(from[1]),
				to 	   = $(this).attr('id').split('-'),
				col_to = parseInt(to[0]),
				row_to = parseInt(to[1]),
				whole  = $(e).attr('class').split(' ')[0],
				color  = whole.split('_')[0],
				piece  = whole.split('_')[1];

			if(switched) {
				// console.log('Col to: ' + col_to + '. Row to: ' + row_to);
				col = 9 - col;
				row = 9 - row;
				col_to = 9 - col_to;
				row_to = 9 - row_to;

				// console.log('Col to s: ' + col_to + '. Row tos: ' + row_to + "\n");
			}

			if(color !== board['turn'])
				return false;

			var start = 0,
				end   = 1;
			if(color === 'black') {
				start = 1,
				end   = 2;
			}

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
				return ((col_result === 0 || col_result === 1) && (row_result === 0 || row_result === 1)) || ((color === 'white' && row_to == 1 && (col_to == 3 || col_to == 7)) || (color === 'black' && row_to == 8 && (col_to == 3 || col_to == 7)));
			}

			return false;
		},
		drop: function(e, ui) {
			var from    = $(ui.draggable).parent('div').attr('id').split('-'),
				col     = from[0],
				row	    = from[1],
				dropped = $(this).attr('id'),
				col_to  = parseInt(dropped.split('-')[0]),
				row_to  = parseInt(dropped.split('-')[1]),
				whole   = $(ui.draggable).attr('class').split(' ')[0],
				color	= whole.split('_')[0],
				piece	= whole.split('_')[1];

			if(switched) {
				// console.log('Col to: ' + col_to + '. Row to: ' + row_to);
				col = 9 - col;
				row = 9 - row;
				col_to = 9 - col_to;
				row_to = 9 - row_to;

				// console.log('Col to s: ' + col_to + '. Row tos: ' + row_to + "\n");
			}

			var previous_piece = board[col_to][row_to];

			var my_color_val = (my_color === 0) ? 'white' : 'black';
			if(board['moves'] > 2 && multiplayer && color != my_color_val) {
				$(ui.draggable).css({ 'top': 0, 'left': 0 });
				return false;
			}

			// king next to king
			var col_check = col_to + 1;
			var row_check = row_to + 1;
			for(var m = 0; m < 8; m++) {
				switch(m) {
					case 1:
						row_check = row_to;
						col_check = col_to + 1;
						break;
					case 2:
						row_check = row_to - 1;
						col_check = col_to + 1;
						break;
					case 3:
						col_check = col_to;
						row_check = row_to - 1;
						break;
					case 4:
						col_check = col_to - 1;
						row_check = row_to - 1;
						break;
					case 5:
						col_check = col_to - 1;
						row_check = row_to;
						break;
					case 6:
						col_check = col_to - 1;
						row_check = row_to + 1;
						break;
					case 7:
						col_check = col_to;
						row_check = row_to + 1;
				}

				if(col_check >= 1 && col_check <= 8 && row_check >= 1 && row_check <= 8) {
					if((color === 'white' && board[col_check][row_check] === 12) || (color === 'black' && board[col_check][row_check] === 11)) {
						$(ui.draggable).css({ 'top': 0, 'left': 0 });
						return false;
					}
				}
			}

			var to_castle = false;
			// castle check
			if(piece === 'king' && (color === 'white' && row_to == 1 && (col_to == 3 || col_to == 7) || (color === 'black' && row_to == 8 && (col_to == 3 || col_to == 7)))) {
				if((color === 'white' && !check(0, 1, false) && board['castle']['white'][1] === false) || (color === 'black' && !check(1, 2, false) && board['castle']['black'][1] === false)) {
					var color_c  = 1,
						rook_num = 7,
						start 	 = 0,
						end 	 = 1;

					if(color === 'black') {
						color_c  = 8,
						rook_num = 8,
						start 	 = 1,
						end 	 = 2;
					}

					if(col == 5 && col_to == 3 && board['castle'][color][0] === false && board[1][color_c] === rook_num && board[2][color_c] === 0 && board[3][color_c] === 0 && board[4][color_c] === 0 && !check(start, end, '3-' + color_c) && !check(start, end, '4-' + color_c)) {
						// queen side castle
						if(switched)
							$('#8-' + (9 - color_c)).children('img').appendTo('#5-' + (9 - color_c));
						else
							$('#1-' + color_c).children('img').appendTo('#4-' + color_c);
						board[1][color_c] = 0;
						board[4][color_c] = rook_num;
						to_castle = true;
					} else if(col == 5 && col_to == 7 && board['castle'][color][2] === false && board[6][color_c] === 0 && board[7][color_c] === 0 && board[8][color_c] === rook_num && !check(start, end, '6-' + color_c) && !check(start, end, '7-' + color_c)) {
						// king side castle
						if(switched)
							$('#1-' + (9 - color_c)).children('img').appendTo('#3-' + (9 - color_c));
						else
							$('#8-' + color_c).children('img').appendTo('#6-' + color_c);
						board[8][color_c] = 0;
						board[6][color_c] = rook_num;
						to_castle = true;
					} else if(col == 5) {
						board[col][row] = pieces[whole];
						board[col_to][row_to] = 0;
						board['turn'] = color;
						$(ui.draggable).css({ 'top': 0, 'left': 0 });
						return false;
					}
				} else {
					board[col][row] = pieces[whole];
					board[col_to][row_to] = 0; // get piece?
					board['turn'] = color;
					$(ui.draggable).css({ 'top': 0, 'left': 0 });
					return false;
				}
			} else if(piece === 'king') {
				board['castle'][color][1] = true;
			}

			// rook move check
			if(board['castle']['white'][0] === false && piece === 'rook' && col == 1 && row == 1) {
				board['castle']['white'][0] = true;
			} else if(board['castle']['white'][2] === false && piece === 'rook' && col == 8 && row == 1) {
				board['castle']['white'][2] = true;
			} else if(board['castle']['black'][0] === false && piece === 'rook' && col == 1 && row == 8) {
				board['castle']['black'][0] = true;
			} else if(board['castle']['black'][0] === false && piece === 'rook' && col == 8 && row == 8) {
				board['castle']['black'][2] = true;
			}

			board[col][row] = 0;
			board[col_to][row_to] = pieces[whole];
			board['turn'] = (color === 'white') ? 'black' : 'white';

			if(en_passant) {
				var start = (color === 'white') ? 0 : 1,
					end   = start + 1;
				if(!check(start, end, false)) {
					if(!en_passant_check(col, row, col_to, row_to, color, previous_move)) {
						$(ui.draggable).css({ 'top': 0, 'left': 0 });
						return false;
					}
				}
			}

			for(var e = 0; e < 2; e++) {
				var start = 0,
					end   = 1,
					cc 	  = 'white';
				if(e === 1) {
					start = 1,
					end   = 2;
					cc 	  = 'black';
				}

				var third = false;
				if(piece == 'king' && board['turn'] !== cc && !to_castle) {
					third = dropped;

					if(switched) {
						var dropped_col = parseInt(dropped.split('-')[0]),
							dropped_row = parseInt(dropped.split('-')[1]);

						third = (9 - dropped_col) + "-" + (9 - dropped_row)
					}
				}
				var is_in_check = check(start, end, third);
				if(previous_move['check'] == true && is_in_check) {
					console.log('still in check');
					board[col][row] = pieces[whole];
					board[col_to][row_to] = previous_piece;
					board['turn'] = color;
					$(ui.draggable).css({ 'top': 0, 'left': 0 });
					return false;
				} else if(is_in_check && color == cc) {
					console.log('moved into check');
					board[col][row] = pieces[whole];
					board[col_to][row_to] = previous_piece;
					board['turn'] = color;
					$(ui.draggable).css({ 'top': 0, 'left': 0 });
					return false;
				}
			}

			if(board['moves'] < 2 && board['moves'] % 2 !== 0) {
				my_color = 1;
			} else if(board['moves'] % 2 !== my_color) {
				multiplayer = false;
			}

			audio_element.play();

			if($('#' + dropped).children('img').length > 0) {
				board['taken'].push(pieces[$('#' + dropped).children('img').attr('class').split(' ')[0]]);
				$('#' + dropped).children('img').removeClass('ui-draggable').appendTo('#taken');
			}

			$(ui.draggable).parent('div').removeClass('down').children('img').appendTo('#' + dropped).css({ 'top': 0, 'left': 0 });

			if(piece === 'pawn' && (row_to == 8 || row_to == 1)) {
				// pawn promotion
				$(ui.draggable).hide();
				$('<img src="/img/' + color + '_knight.svg" class="' + color + '_knight promote" /><img src="/img/' + color + '_bishop.svg" class="' + color + '_bishop promote" /><img src="/img/' + color + '_rook.svg" class="' + color + '_rook promote" /><img src="/img/' + color + '_queen.svg" class="' + color + '_queen promote" />').appendTo('#' + dropped);
			}

			board['moves']++;

			previous_move = {
				'col': col,
				'row': row,
				'col_to': col_to,
				'row_to': row_to,
				'color': color,
				'piece': piece,
				'check': is_in_check
			};

			socket.emit('send', { board: board });
		}
	});

	function en_passant_check(col, row, col_to, row_to, color, previous) {
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

	function check(a, b, dropped) {
		// check if king is in check
		for(a; a < b; a++) {
			if(dropped !== false/* && $('#' + dropped).children('img').attr('class') === 'white_king' || $('#' + dropped).children('img').attr('class') === 'black_king'*/) {
				var location = dropped.split('-');
			} else {
				dropped = false;
				var location = $('.white_king').parent('div').attr('id').split('-');
				if(a === 1)
					location = $('.black_king').parent('div').attr('id').split('-');
			}

			var col = parseInt(location[0]),
				row = parseInt(location[1]);

			if(switched && dropped === false) {
				col = 9 - col;
				row = 9 - row;
			}

			// check pawns
			for(g = 0; g < 2; g++) {
				// white king
				var col_check = col + 1;
				var row_check = row + 1;
				if(g === 1) {
					col_check = col - 1;
					row_check = row + 1;
				}

				if(a === 1) {
					// black king
					col_check = col + 1;
					row_check = row - 1;
					if(g === 1) {
						col_check = col - 1;
						row_check = row - 1;
					}
				}

				if(col_check >= 1 && col_check <= 8 && row_check >= 1 && row_check <= 8) {
					var is_pawn = board[col_check][row_check];
					if((is_pawn === 1 && a === 1) || (is_pawn === 2 && a === 0)) {
						// check by pawn
						console.log('check by pawn');
						return true;
					}
				}
			}

			// check knights
			for(f = 0; f < 8; f++) {
				var col_check = col + 1;
				var row_check = row + 2;

				if(f === 1) {
					col_check = col + 2;
					row_check = row + 1;
				} else if(f === 2) {
					col_check = col + 2;
					row_check = row - 1;
				} else if(f === 3) {
					col_check = col + 1;
					row_check = row - 2;
				} else if(f === 4) {
					col_check = col - 1;
					row_check = row - 2;
				} else if(f === 5) {
					col_check = col - 2;
					row_check = row - 1;
				} else if(f === 6) {
					col_check = col - 2;
					row_check = row + 1;
				} else if(f === 7) {
					col_check = col - 1;
					row_check = row + 2;
				}

				if(col_check >= 1 && col_check <= 8 && row_check >= 1 && row_check <= 8) {
					var is_knight = board[col_check][row_check];
					if((is_knight === 3 && a === 1) || (is_knight === 4 && a === 0)) {
						// check by knight
						console.log('check by knight');
						return true;
					}
				}
			}

			// check up, right, down, left, up-right, down-right, down-left, up-left
			for(var d = 0; d < 8; d++) {
				var i 		  = row + 1,
					j		  = 0,
					condition = 8,
					i_step 	  = 1,
					j_step 	  = 0;

				var predicate = function(i, j) { return i <= condition; }

				if(d === 1) {
					// right
					i = col + 1;
					// condition = (8 - col >= 4) ? 8 : Math.abs(col - 8) + col;
					condition = 8;
				} else if(d === 2) {
					// down
					i = row - 1;
					condition = 1;
					predicate = function(i, j) { return i >= condition;  }
					i_step = -1;
				} else if(d === 3) {
					// left
					i = col - 1;
					condition = 1;
					predicate = function(i, j) { return i >= condition;  }
					i_step = -1;
				} else if(d === 4) {
					// up-right (piece checking)
					i = col + 1;
					j = row + 1;
					var predicate = function(i, j) { return i <= condition && j <= condition; }
					j_step = 1;
				} else if(d === 5) {
					// down-right
					i = col + 1;
					j = row - 1;
					var predicate = function(i, j) { return i <= 8 && j >= 1; }
					j_step = -1;
				} else if(d === 6) {
					// down-left
					i = col - 1;
					j = row - 1;
					var predicate = function(i, j) { return i >= 1 && j >= 1; }
					i_step = -1;
					j_step = -1;
				} else if(d === 7) {
					// up-left
					i = col - 1;
					j = row + 1;
					var predicate = function(i, j) { return i >= 1 && j <= 8; }
					i_step = -1;
					j_step = 1;
				}

				var space;
				for(; predicate(i, j); i += i_step, j += j_step) {
					if(d === 0 || d === 2)
						space = board[col][i];
					else if(d === 1 || d === 3)
						space = board[i][row];
					else if(d > 3)
						space = board[i][j];

					if(i < 0 || i > 8 || j < 0 || j > 8)
						break;

					if(space !== 0) {
						// console.log(/*"A: " + a + "\n*/"D: " + d + "\nI: " + i + "\nCol: " + col + "\nCondition: " + condition + "\nSpace: " + space);
						if(space % 2 !== 0) {
							// white piece at space
							if((space === 5 || space === 7 || space === 9) && a !== 0) {
								// white checks black with bishop, rook, or queen
								if((space === 5 && d <= 3) || (space === 7 && d > 3)) // don't allow bishop vertical/horizontal check or rook diagonal check
									break;

								// black in check
								console.log('black in check');
								return true;
							}
							break;
						} else {
							// black piece at space
							if((space === 6 || space === 8 || space === 10) && a !== 1) {
								// white checks black with bishop, rook, or queen
								if((space === 6 && d <= 3) || (space === 8 && d > 3)) // don't allow bishop vertical/horizontal check or rook diagonal check
									break;

								// white in check
								console.log('white in check');
								return true;
							}
							break;
						}
						break;
					}

				}
			}
			return false;
		}
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
					col_var = parseInt(col) + 1;
					row_var = parseInt(row) - 1;
					row_step = -1;
					predicate = function(i, j) { return i <= col_to && j >= row_to; }
				}
			} else if(col_to < col) {
				// left
				if(row_to > row) {
					// up
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

	function html5_storage() {
		try {
			return 'localStorage' in window && window['localStorage'] !== null;
		} catch(e) {
			return false;
		}
	}
});