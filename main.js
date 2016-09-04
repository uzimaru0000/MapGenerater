APP = {};
APP.cell = [];
APP.color = [
	[255, 0, 0],
	[0, 255, 0],
	[0, 0, 255],
	[255, 128, 0],
	[0, 255, 128]
];
APP.generation = 0;

window.onload = function(){
	APP.canvas = document.getElementById('canv');
	APP.context = APP.canvas.getContext('2d');
	for(var y = 0;y < APP.canvas.height;++y){
		APP.cell[y] = [];
		for(var x = 0;x < APP.canvas.width;++x){
			var type = Math.floor(rand(0, 3));
			APP.cell[y][x] = type;
		}
	}

	var timer = setInterval(function(){
		calc();
		draw();
		APP.generation++;
		document.getElementById('generation').innerHTML = APP.generation;
		if(APP.generation == 500) clearInterval(timer);
	}, 0);
}

function calc(){
	var array = [];
	for(var y = 0;y < APP.canvas.height;++y){
		array[y] = [];
		for(var x = 0;x < APP.canvas.width;++x){
			var dx = Math.random() * 100 > 50 ? -1 : 1;
			var dy = Math.random() * 100 > 50 ? -1 : 1;
			if(y == 0) dy = 1;
			else if(y == APP.canvas.height-1) dy = -1;
			if(x == 0) dx = 1;
			else if(x == APP.canvas.width-1) dx = -1;
			array[y][x] = APP.cell[y+dy][x+dx];
		}
	}
	APP.cell = array.concat();
	for(var y = 0;y < APP.canvas.height;++y){
		for(var x = 0;x < APP.canvas.width;++x){
			var flag = 0;
			var cell;
			for(var i = 0;i < 4;++i){
				var ix, iy;
				switch(i){
					case 0:
						if(y == 0) continue;
						ix = 0;
						iy = -1;
						cell = APP.cell[y+iy][x+ix];
						break;
					case 1:
						if(x == 0) continue;
						ix = -1;
						iy = 0;
						if(y == 0) cell = APP.cell[y+iy][x+ix];
						break;
					case 2:
						if(x == APP.canvas.width-1) continue;
						ix = 1;
						iy = 0;
						if(x == 0) cell = APP.cell[y+iy][x+ix];
						break;
					case 3:
						if(y == APP.canvas.height-1) continue;
						ix = 0;
						iy = 1;
						break;
				}
				if(cell != APP.cell[y][x] && cell == APP.cell[y+iy][x+ix]) flag++;
			}
			if(flag == 4) APP.cell[y][x] = cell;
		}
	}
}

function draw(){
	var idata = APP.context.createImageData(APP.canvas.width, APP.canvas.height);
	for(var y = 0;y < APP.canvas.height;++y){
		for(var x = 0;x < APP.canvas.width;++x){
			var type = APP.cell[y][x];
			idata.data[(x + y * APP.canvas.width) * 4] = setColor(type, 0);
			idata.data[(x + y * APP.canvas.width) * 4 + 1] = setColor(type, 1);
			idata.data[(x + y * APP.canvas.width) * 4 + 2] = setColor(type, 2);
			idata.data[(x + y * APP.canvas.width) * 4 + 3] = 255;
		}
	}
	APP.context.putImageData(idata, 0, 0);
}

function setColor(type, index){
	return APP.color[type][index];
}

function rand(min, max){
	return Math.random() * (max - min) + min;
}