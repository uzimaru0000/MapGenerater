APP = {};
APP.cell = {};
APP.color = [
	[37, 137, 210],	// 海
	[154, 108, 39],	// 陸
	[186, 186, 186],	// 山
	[217, 202, 7],	// 砂漠
	[123, 168, 112],	// 森
	[189, 186, 153]	// 砂漠+山
];

window.onload = function(){
	// キャンバス、コンテクストの取得
	APP.canvas = document.getElementById('canv');
	APP.context = APP.canvas.getContext('2d');
	APP.loopCount = Math.round((APP.canvas.height+APP.canvas.width) / 2);

	// 配列の初期化
	var array = [];
	for(var y = 0;y < APP.canvas.height;++y){
		array[y] = [];
		for(var x = 0;x < APP.canvas.width;++x){
			array[y][x] = Math.round(rand(0, 1));
			if(y == 0 || x == 0 || y == APP.canvas.height-1 || x == APP.canvas.width-1) array[y][x] = 0;
		}
	}
	APP.cell.ground = array.concat();

	// 大地の生成
	loop(1, APP.loopCount, function(){
		calcCell(APP.cell.ground);
		draw();
	}, function(){
		// 山の生成
		APP.cell.mountain = APP.cell.ground.slice();
		for(var y = 0;y < APP.canvas.height;++y){
			APP.cell.mountain[y] = APP.cell.ground[y].slice();
		};
		loop(1, APP.loopCount/2, function(){
			calcCell(APP.cell.mountain, function(x, y){
				return APP.cell.ground[y][x] == 0;
			});
			draw();
		}, function(){
			// 砂漠の生成
			APP.cell.desert = APP.cell.ground.slice();
			for(var y = 0;y < APP.canvas.height;++y){
				APP.cell.desert[y] = APP.cell.ground[y].slice();
			};
			loop(1, APP.loopCount/2, function(){
				calcCell(APP.cell.desert, function(x, y){
					return APP.cell.ground[y][x] == 0;
				});
				draw();
			}, function(){
				// 森の生成
				APP.cell.forest = APP.cell.ground.slice();
				for(var y = 0;y < APP.canvas.height;++y){
					APP.cell.forest[y] = APP.cell.ground[y].slice();
				};
				loop(1, APP.loopCount/2, function(){
					calcCell(APP.cell.forest, function(x, y){
						return APP.cell.desert[y][x] == 1;
					});
					draw();
				}, function(){
					calcHeight();
					draw();
				});
			});
		});
	});
}

function calcCell(baseArray, Evaluation){
	var array = baseArray.concat();
	var w = APP.canvas.width;
	var h = APP.canvas.height;
	for(var y = 0;y < h;++y){
		for(var x = 0;x < w;++x){
			var count = 0;
			var type = array[y][x];
			for(var s = -1;s < 2;s++){
				for(var t = -1;t < 2;t++){
					if(s == 0 && t == 0) continue;
					var nx = x + t;
					var ny = y + s;
					if((nx >= 0 && nx < w) && (ny >= 0 && ny < h)){
						if(array[ny][nx] != type) count++;
					} else if(type == 1) {
						count++;
					}
				}
			}
			baseArray[y][x] = (rand(0, 1) < count / 8) ? (type+1) % 2 : type;
			if(count == 0) baseArray[y][x] = type;
			else if(count == 1) baseArray[y][x] = (rand(0, 1) < 0.1) ? (type+1) % 2 : type;
			else if(count == 2 || count == 3) baseArray[y][x] = (rand(0, 1) < 0.3) ? (type+1) % 2 : type;
			else if(count == 4) baseArray[y][x] = (rand(0, 1) < 0.5) ? (type+1) % 2 : type;
			else if(count == 5 || count == 6) baseArray[y][x] = (rand(0, 1) < 0.7) ? (type+1) % 2 : type;
			else if(count == 7) baseArray[y][x] = (rand(0, 1) < 0.9) ? (type+1) % 2 : type;
			else if(count == 8) baseArray[y][x] = (type+1) % 2;

			if(Evaluation && Evaluation(x, y)) baseArray[y][x] = 0;
		}
	}
}

function calcHeight(){
	APP.cell.height = [];
	for(var y = 0;y < APP.canvas.height;++y){
		APP.cell.height[y] = [];
		for(var x = 0;x < APP.canvas.width;++x){
			APP.cell.height[y][x] = APP.cell.ground[y][x] == 0 ? 0 : -1;
		}
	}

	var count = 0;
	var h = 1;
	do{
		count = 0;
		for(var y = 0;y < APP.canvas.height;++y){
			for(var x = 0;x < APP.canvas.width;++x){
				if(APP.cell.height[y][x] != -1){
					continue;
				}
				for(var s = -1;s < 2;++s){
					for(var t = -1;t < 2;++t){
						if(s == 0 && t == 0) continue;
						var nx = x + t;
						var ny = y + s;
						if(nx >= 0 && nx < APP.canvas.width && ny >= 0 && ny < APP.canvas.height){
							if(APP.cell.height[ny][nx] == h - 1) APP.cell.height[y][x] = h;
						}
					}
				}
				if(APP.cell.height[y][x] == -1){
					count++;
				}
			}
		}
		h++;
	}while(count != 0);
	APP.maxHeight = h-1;

	for(var y = 0;y < APP.canvas.height;++y){
		for(var x = 0;x < APP.canvas.width;++x){
			if(APP.cell.mountain[y][x] == 1 && APP.cell.desert[y][x] == 0){
				APP.cell.height[y][x] *= 2;
				if(APP.cell.height[y][x] > h) APP.maxHeight = APP.cell.height[y][x];
			}
		}
	}
}

function draw(){
	var idata = APP.context.createImageData(APP.canvas.width, APP.canvas.height);
	var canv = document.getElementById('canv2');
	var context = canv.getContext('2d');
	var d = context.createImageData(canv.width, canv.height);
	for(var y = 0;y < APP.canvas.height;++y){
		for(var x = 0;x < APP.canvas.width;++x){
			var type = 0;
			if(APP.cell.ground[y][x] == 1){
				type = 1;
			}
			if(APP.cell.desert && APP.cell.desert[y][x] == 1){
				type = type == 2 ? 5 : 3;
			}
			if(APP.cell.mountain && APP.cell.mountain[y][x] == 1){
				type = 2;
			}
			if(APP.cell.forest && APP.cell.forest[y][x] == 1 && APP.cell.ground[y][x] == 1){
				type = 4;
			}

			idata.data[(x + y * APP.canvas.width) * 4] = setColor(type, 0);
			idata.data[(x + y * APP.canvas.width) * 4 + 1] = setColor(type, 1);
			idata.data[(x + y * APP.canvas.width) * 4 + 2] = setColor(type, 2);
			idata.data[(x + y * APP.canvas.width) * 4 + 3] = 255;

			if(APP.cell.height && APP.cell.height[y][x] != 0){
				d.data[(x + y * APP.canvas.width) * 4] = 255 * (APP.cell.height[y][x] / APP.maxHeight);
				d.data[(x + y * APP.canvas.width) * 4 + 1] = 255 * (APP.cell.height[y][x] / APP.maxHeight);
				d.data[(x + y * APP.canvas.width) * 4 + 2] = 255 * (APP.cell.height[y][x] / APP.maxHeight);
				d.data[(x + y * APP.canvas.width) * 4 + 3] = 255;
			}
		}
	}
	APP.context.putImageData(idata, 0, 0);
	context.putImageData(d, 0, 0);
}

function loop(type, num, func, callback){
	switch (type) {
		case 0:
			for(var i = 0;i < num;++i){
				func();
			}
			break;
		case 1:
			var count = 0;
			var cb = callback;
			var timer = setInterval(function(){
				func();
				count++;
				if(count > num) {
					clearInterval(timer);
					if(cb) cb();
				}
			}, 0);
			break;
	}
	return true;
}

function setColor(type, index){
	return APP.color[type][index];
}

function rand(min, max){
	return Math.random() * (max - min) + min;
}
