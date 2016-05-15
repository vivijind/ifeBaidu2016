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

// 事件代理
function delegateEvent(element, tag, eventName, listener) {
    addEvent(element, eventName, function () {
        var event = arguments[0] || window.event,
            target = event.target || event.srcElement;
        if (target && target.tagName === tag.toUpperCase()) {
            listener.call(target, event);
        }
    });
}

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
		alert(this.numbers.shift());
	},
	rightOut: function(number) {
		alert(this.numbers.pop());
	},
	deletePos: function(pos) {
		this.numbers.splice(pos,1);
	}
}

// 删除
function deleteQuenueNumber(event) {
	var eventList = event.currentTarget.children;
	var pos = 0;
	for (var i= 0,tar; tar = eventList[i]; i ++) {
		if (tar === event.target) {
			queue.deletePos(pos);
			renderQueue(queue.numbers);
			break;
		}
		pos ++;
	}
}

// 绘制
function renderQueue() {
	var str = '';
	var renderEle = $('queue');
	for (var i = 0,number; number=queue.numbers[i]; i++) {
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
		queue.leftOut();
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
		queue.rightOut();
		renderQueue();
	});

	delegateEvent($('queue'), 'div', 'click', deleteQuenueNumber);
}

function init() {
	innitialEvent();
	renderQueue();
}

init();