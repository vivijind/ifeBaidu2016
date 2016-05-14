var $ = function(id) {
	return document.getElementById(id);
}

var addEvent = document.addEventListener ?
    function(elem, type, listener, useCapture) {
        elem.addEventListener(type, listener, useCapture);
    } :
    function(elem, type, listener, useCapture) {
        elem.attachEvent('on' + type, listener);
    };

// 获取输入框的值，并验证是否为数字
function getNumber(number) {
	number = $('number').value;
	if(!/[0-9]+/.test(number)){
		alert('请输入数字');
		return false;
	}
	return number;
}

// 队列
var queue = {
	numbers: [10,3,7,12],
	leftIn: function(number) {
		this.numbers.unshift(number);
	},
	rightIn: function(number) {
		this.numbers.push(number);
	},
	leftOut: function(number) {
		this.numbers.shift();
	},
	rightOut: function(number) {
		this.numbers.pop();
	}
}

// 绘制
function renderQueue() {
	var str = '';
	var renderEle = $('queue');
	for (var i = 0; number=queue.numbers[i]; i++) {
		str += "<div>" + number + "</div>";
	}
	renderEle.innerHTML = str;
}

// 事件绑定
function innitialEvent() {
	var leftInButton = $('leftin');
	var leftOutButton = $('leftout');
	var rightInButton = $('rightin');
	var rightOutButton = $('rightout');


	addEvent(leftInButton, 'click', function(){
		var number = getNumber();
		if(number) {
			queue.leftIn(getNumber());
			renderQueue();
		}
	});
	addEvent(leftOutButton, 'click', function(){
		queue.leftOut(number);
		renderQueue();
	});
	addEvent(rightInButton, 'click', function(){
		var number = getNumber();
		if(number) {
			queue.rightIn();
			renderQueue();
		}
	});
	addEvent(rightOutButton, 'click', function(){
		queue.rightOut(number);
		renderQueue();
	});
}

function init() {
	innitialEvent();
	renderQueue();
}

init();