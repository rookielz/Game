var width = 1000.0;
var height = 1000.0;
var num = 20.0;
var w = width / num;
var h = height / num;
var isUser = false;
var points = [];
var userPoints = [];
var aiPoints = [];
var username = num;
$(function() {
    create();
	context.save();
    username = prompt("请输入你的名字","");
	while(username == null || username.length < 1) {

    }
	connServer();
	$("#canvas").click(function(event) {
		//		var ctx = canvas.getContext("2d");
		var e = event || window.event;
		var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
		var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
		var x = e.pageX || e.clientX + scrollX;
		var y = e.pageY || e.clientY + scrollY;
		var point = getPoint({
			"x": x,
			"y": y
		});
		//		console.log("point",JSON.stringify(point));
		if(JSON.stringify(points).indexOf(JSON.stringify(point)) != -1) {
			console.log("msg", "点已存在");
			return;
		}
		addPoint(point,"black");
		send('{"name":"point","value":{"username":"'+username+'","x":'+point.x+',"y":'+y+'}}');
	});
});

function  create() {
    var canvas = document.getElementById("canvas");
    $("#canvas").replaceWith('<canvas id="canvas" width="1000" height="1000" style="background-color: #f1f2f3;margin: 0 auto;"></canvas>');
    var context = canvas.getContext("2d");
    context.strokeStyle = "black";
    for(var i = 0; i <= num; i++) {
        context.moveTo(0, i * w);
        context.lineTo(width, i * w);
        context.moveTo(i * h, 0);
        context.lineTo(i * h, height);
    }
    context.stroke();
    context.closePath();
}

function addPoint(point,color) {
	var canvas = document.getElementById("canvas");
	var context = canvas.getContext("2d");
	context.beginPath();
	context.fillStyle = color;
	isUser = !isUser;
	console.log("point",point);
	context.arc(point.x, point.y, w / 3, 0, Math.PI * 2, true);
	context.fill();
	context.closePath();
	if (color == "black"){
		userPoints.push(point);
	}else{
		points.push(point);
	}
	if(checkIsWin(userPoints)) {
		alert("You win! game over!");
		return;
	}
	if (checkIsWin(aiPoints)){
		alert("You lost! game over!");
		return;
	}
}

var websocket = null;

function connServer() {

	//判断当前浏览器是否支持WebSocket  
	if('WebSocket' in window) {
		websocket = new WebSocket("ws://192.168.0.11:8080/websocket");
	} else {
		alert('Not support websocket')
	}

	//连接发生错误的回调方法  
	websocket.onerror = function() {
		setMessageInnerHTML("error");
	};

	//连接成功建立的回调方法  
	websocket.onopen = function(event) {
		setMessageInnerHTML("链接成功");
		send('{"name":"username","value":"' + username + '"}');
	}

	//接收到消息的回调方法  
	websocket.onmessage = function(event) {
		setMessageInnerHTML(event.data);
		var data = JSON.parse(event.data);
		console.log("data",data);
		if (data.name == "point"){
		    console.log("data2",data.value.username);
		    // data = data.value
			if (username == data.value.username){
                return;
            }
			var point = data.value;
			// point = JSON.parse(JSON.stringify(point));
			console.log("point",JSON.stringify(point));
			addPoint(point,"red");
		}else if (data.name == "over"){
		    alert(data.value + " win! game over!");
		    create();
        }
	}

	//连接关闭的回调方法  
	websocket.onclose = function() {
		setMessageInnerHTML("关闭链接");
		send('{"name":"close","value":"' + username + '"}');
	}

	//监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。  
	window.onbeforeunload = function() {
		websocket.close();
	}

	//将消息显示在网页上  
	function setMessageInnerHTML(innerHTML) {
		console.log("msg", innerHTML);
	}

}
//关闭连接  
function closeWebSocket() {
	websocket.close();
}

//发送消息  
function send(str) {
	websocket.send(str);
}

function checkIsWin(ps) {
	for(var index = 0; index < ps.length; index++) {
		var p = ps[index];
		// 纵向
		// 0 4
		var v1 = [{ "x": p.x, "y": p.y + h }, { "x": p.x, "y": p.y + h * 2 }, { "x": p.x, "y": p.y + h * 3 }, { "x": p.x, "y": p.y + h * 4 }];
		// 1 3
		var v2 = [{ "x": p.x, "y": p.y - h }, { "x": p.x, "y": p.y + h * 1 }, { "x": p.x, "y": p.y + h * 2 }, { "x": p.x, "y": p.y + h * 3 }];
		// 2 2
		var v3 = [{ "x": p.x, "y": p.y - h * 2 }, { "x": p.x, "y": p.y - h }, { "x": p.x, "y": p.y + h }, { "x": p.x, "y": p.y + h * 2 }];
		// 3 1
		var v4 = [{ "x": p.x, "y": p.y - h * 3 }, { "x": p.x, "y": p.y - h * 2 }, { "x": p.x, "y": p.y - h }, { "x": p.x, "y": p.y + h }];
		// 4 0
		var v5 = [{ "x": p.x, "y": p.y - h * 4 }, { "x": p.x, "y": p.y - h * 3 }, { "x": p.x, "y": p.y - h * 2 }, { "x": p.x, "y": p.y - h }];

		// 横向
		// 0 4
		var h1 = [{ "x": p.x + w, "y": p.y }, { "x": p.x + w * 2, "y": p.y }, { "x": p.x + w * 3, "y": p.y }, { "x": p.x + w * 4, "y": p.y }];
		// 1 3
		var h2 = [{ "x": p.x - w, "y": p.y }, { "x": p.x + w, "y": p.y }, { "x": p.x + w * 2, "y": p.y }, { "x": p.x + w * 3, "y": p.y }];
		// 2 2
		var h3 = [{ "x": p.x - w * 2, "y": p.y }, { "x": p.x - w, "y": p.y }, { "x": p.x + w, "y": p.y }, { "x": p.x + w * 2, "y": p.y }];
		// 3 1
		var h4 = [{ "x": p.x - w * 3, "y": p.y }, { "x": p.x - w * 2, "y": p.y }, { "x": p.x - w, "y": p.y }, { "x": p.x + w, "y": p.y }];
		// 4 0
		var h5 = [{ "x": p.x - w * 4, "y": p.y }, { "x": p.x - w * 3, "y": p.y }, { "x": p.x - w * 2, "y": p.y }, { "x": p.x - w, "y": p.y }];

		// 斜1
		// 0 4
		var p1 = [{ "x": p.x - w, "y": p.y - h }, { "x": p.x - w * 2, "y": p.y - w * 2 }, { "x": p.x - w * 3, "y": p.y - h * 3 }, { "x": p.x - w * 4, "y": p.y - h * 4 }];
		// 1 3
		var p2 = [{ "x": p.x + w, "y": p.y + h }, { "x": p.x - w, "y": p.y - h }, { "x": p.x - w * 2, "y": p.y - h * 2 }, { "x": p.x - w * 3, "y": p.y - h * 3 }];
		// 2 2
		var p3 = [{ "x": p.x + w * 2, "y": p.y + h * 2 }, { "x": p.x + w, "y": p.y + h }, { "x": p.x - w, "y": p.y - h }, { "x": p.x - w * 2, "y": p.y - h * 2 }];
		// 3 1
		var p4 = [{ "x": p.x + w * 3, "y": p.y + h * 3 }, { "x": p.x + w * 2, "y": p.y + h * 2 }, { "x": p.x + w, "y": p.y + h }, { "x": p.x - w, "y": p.y - h }];
		// 4 0
		var p5 = [{ "x": p.x + w * 4, "y": p.y + h * 4 }, { "x": p.x + w * 3, "y": p.y + h * 3 }, { "x": p.x + w * 2, "y": p.y + h * 2 }, { "x": p.x + w, "y": p.y + h }];

		// 0 4
		var s1 = [{ "x": p.x + w, "y": p.y - h }, { "x": p.x + w * 2, "y": p.y - h * 2 }, { "x": p.x + w * 3, "y": p.y - h * 3 }, { "x": p.x + w * 4, "y": p.y - h * 4 }];
		// 1 3
		var s2 = [{ "x": p.x - w, "y": p.y + h }, { "x": p.x + w, "y": p.y - h }, { "x": p.x + w * 2, "y": p.y - h * 2 }, { "x": p.x + w * 3, "y": p.y - h * 3 }];
		// 2 2
		var s3 = [{ "x": p.x - w * 2, "y": p.y + h * 2 }, { "x": p.x - w, "y": p.y + h }, { "x": p.x + w, "y": p.y - h }, { "x": p.x + w * 2, "y": p.y - h * 2 }];
		// 3 1
		var s4 = [{ "x": p.x - w * 3, "y": p.y + h * 3 }, { "x": p.x - w * 2, "y": p.y + h * 2 }, { "x": p.x - w, "y": p.y + h }, { "x": p.x + w, "y": p.y - h }];
		// 4 0
		var s5 = [{ "x": p.x - w * 4, "y": p.y + h * 4 }, { "x": p.x - w * 3, "y": p.y + h * 3 }, { "x": p.x - w * 2, "y": p.y + h * 2 }, { "x": p.x - w, "y": p.y + h }];
		//		
		if(check(v1) || check(v2) || check(v3) || check(v4) || check(v5) || check(h1) || check(h2) || check(h3) || check(h4) || check(h5) || check(p1) || check(p2) || check(p3) || check(p4) || check(p5) || check(s1) || check(s2) || check(s3) || check(s4) || check(s5))
			return true;
	}
	return false;
}

function check(p) {
	var str = JSON.stringify(userPoints);
	//	console.log("str",str);
	var p1 = JSON.stringify(p[0]);
	var p2 = JSON.stringify(p[1]);
	var p3 = JSON.stringify(p[2]);
	var p4 = JSON.stringify(p[3]);
	//	console.log("p1",(str.indexOf(p1) != -1 )+ "" + p1);console.log("p2",(str.indexOf(p2) != -1) + "" + p2);console.log("p3",(str.indexOf(p3) != -1) + "" + p3);console.log("p4",(str.indexOf(p4) != -1) + "" + p4);
	if(str.indexOf(p1) != -1 && str.indexOf(p2) != -1 && str.indexOf(p3) != -1 && str.indexOf(p4) != -1)
		return true;
	else
		return false;
}

function ai(point) {
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = "blue";
	ctx.arc(point.x + 50, point.y + 50, w / 3, 0, Math.PI * 2, true);
	ctx.fill();
	ctx.closePath();
}

// 初级难度
function aiCheck() {
	for(var index = 0; index < userPoints.length; index++) {
		var p = userPoints[index];

		// 横向
		// 0 2
		var h1 = [{ "x": p.x + w, "y": p.y }, { "x": p.x + w * 2, "y": p.y }];
		if(check(h1))
			// 1 1
			var h2 = [{ "x": p.x - w, "y": p.y }, { "x": p.x + w, "y": p.y }];
		// 2 0
		var h3 = [{ "x": p.x - w * 2, "y": p.y }, { "x": p.x - w, "y": p.y }];

		// 纵向
		// 0 2
		var v1 = [{ "x": p.x, "y": p.y + h }, { "x": p.x, "y": p.y + h * 2 }];
		// 1 1
		var v2 = [{ "x": p.x, "y": p.y - h }, { "x": p.x, "y": p.y + h }];
		// 2 0
		var v3 = [{ "x": p.x, "y": p.y - h * 2 }, { "x": p.x, "y": p.y - h }];

		// 斜1 右上至左下
		// 0 2
		var p1 = [{ "x": p.x + w, "y": p.y - h }, { "x": p.x + w * 2, "y": p.y - h * 2 }];
		// 1 1
		var p2 = [{ "x": p.x - w, "y": p.y + h }, { "x": p.x + w, "y": p.y - h }];
		// 2 0
		var p3 = [{ "x": p.x - w * 2, "y": p.y + h * 2 }, { "x": p.x - w, "y": p.y + h }];

		// 左上-右下
		// 0 2
		var p1 = [{ "x": p.x + w, "y": p.y + h }, { "x": p.x + w * 2, "y": p.y + h * 2 }];
		// 1 1
		var p2 = [{ "x": p.x - w, "y": p.y - h }, { "x": p.x + w, "y": p.y + h }];
		// 2 0
		var p3 = [{ "x": p.x - w * 2, "y": p.y - h * 2 }, { "x": p.x - w, "y": p.y - h }];

	}
}

// 扫描威胁点
function makeAiPoint(ps, type) {
	var str = JSON.stringify(points);
	var p1 = ps[0];
	var p2 = ps[1];
	if(check(ps)) {
		switch(type) {
			case 1:
				var p = { "x": p2.x + w, "y": p2.y };
				if(str.indexOf(JSON.stringify(p)) == -1) {
					return p;
				} else {
					p = { "x": p1.x - w * 2, "y": p1.y };
					if(str.indexOf(JSON.stringify(p)) == -1) {
						return p;
					}
					return null;
				}
				break;
			case 2:
				var p = { "x": p2.x + w, "y": p2.y };
				if(str.indexOf(JSON.stringify(p)) == -1) {
					return p;
				} else {
					p = { "x": p1.x - w, "y": p1.y };
					if(str.indexOf(JSON.stringify(p)) == -1) {
						return p;
					}
					return null;
				}
				break;
			case 3:
				var p = { "x": p2.x + w, "y": p2.y };
				if(str.indexOf(JSON.stringify(p)) == -1) {
					return p;
				} else {
					p = { "x": p1.x - w * 3, "y": p1.y };
					if(str.indexOf(JSON.stringify(p)) == -1) {
						return p;
					}
					return null;
				}
				break;
			case 4:
				var p = { "x": p2.x, "y": p2.y + h };
				if(str.indexOf(JSON.stringify(p)) == -1) {
					return p;
				} else {
					p = { "x": p1.x, "y": p1.y - h * 2 };
					if(str.indexOf(JSON.stringify(p)) == -1) {
						return p;
					}
					return null;
				}
				break;
			case 5:
				var p = { "x": p2.x, "y": p2.y + h };
				if(str.indexOf(JSON.stringify(p)) == -1) {
					return p;
				} else {
					p = { "x": p1.x, "y": p1.y - h };
					if(str.indexOf(JSON.stringify(p)) == -1) {
						return p;
					}
					return null;
				}
				break;
			case 6:
				var p = { "x": p2.x, "y": p2.y - h * 3 };
				if(str.indexOf(JSON.stringify(p)) == -1) {
					return p;
				} else {
					p = { "x": p1.x, "y": p1.y + h };
					if(str.indexOf(JSON.stringify(p)) == -1) {
						return p;
					}
					return null;
				}
				break;
			case 7:
				var p = { "x": p2.x + w, "y": p2.y - h };
				if(str.indexOf(JSON.stringify(p)) == -1) {
					return p;
				} else {
					p = { "x": p1.x - w, "y": p1.y + h };
					if(str.indexOf(JSON.stringify(p)) == -1) {
						return p;
					}
					return null;
				}
				break;
			case 8:
				var p = { "x": p2.x + w * 2, "y": p2.y - h * 2 };
				if(str.indexOf(JSON.stringify(p)) == -1) {
					return p;
				} else {
					p = { "x": p1.x - w * 2, "y": p1.y + h * 2 };
					if(str.indexOf(JSON.stringify(p)) == -1) {
						return p;
					}
					return null;
				}
				break;
			case 9:
				var p = { "x": p2.x - w * 3, "y": p2.y + h * 3 };
				if(str.indexOf(JSON.stringify(p)) == -1) {
					return p;
				} else {
					p = { "x": p1.x + w, "y": p1.y - h };
					if(str.indexOf(JSON.stringify(p)) == -1) {
						return p;
					}
					return null;
				}
				break;
			case 10:
				var p = { "x": p2.x + w, "y": p2.y + h };
				if(str.indexOf(JSON.stringify(p)) == -1) {
					return p;
				} else {
					p = { "x": p1.x - w, "y": p1.y - h };
					if(str.indexOf(JSON.stringify(p)) == -1) {
						return p;
					}
					return null;
				}
				break;
			case 11:
				var p = { "x": p2.x + w, "y": p2.y + h };
				if(str.indexOf(JSON.stringify(p)) == -1) {
					return p;
				} else {
					p = { "x": p1.x - w, "y": p1.y - h };
					if(str.indexOf(JSON.stringify(p)) == -1) {
						return p;
					}
					return null;
				}
				break;;
			case 12:
				var p = { "x": p2.x + w, "y": p2.y + h };
				if(str.indexOf(JSON.stringify(p)) == -1) {
					return p;
				} else {
					p = { "x": p1.x - w * 3, "y": p1.y - h * 3 };
					if(str.indexOf(JSON.stringify(p)) == -1) {
						return p;
					}
					return null;
				}
				break;;
		}
	}
}

// 扫描有利点
function makeAiPoint2() {
	for(var index = 0; index < aiPoints.length; index++) {
		var p = aiPoints[index];
	}

}

function getPoint(p) {
	var x = p.x;
	var y = p.y;
	if(x % w < w / 2) {
		x = parseInt(x / w);
	} else {
		x = parseInt(x / w) + 1;
	}
	if(y % h < h / 2) {
		y = parseInt(y / w);
	} else {
		y = parseInt(y / w) + 1;
	}
	console.log("坐标", (x * w) + "--" + (y * h));
	return {
		"x": x * w,
		"y": y * h
	};
}