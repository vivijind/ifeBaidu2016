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

var input = $('number');
var renderEle = $('queue');

// 获取输入框的值，并根据符号分隔
function getNumber() {
	// 格式可以为数字、中文、英文等，
	// 可以通过用回车，逗号（全角半角均可），顿号，空格（全角半角、Tab等均可）等符号作为不同内容的间隔
	// 在此以所有非数字、中文、英文字符作为间隔
	var inputValue = input.value;
	if (inputValue === inputOrigin) {
		alert("请输入数据");
		return false;
	}
	var list = inputValue.split(/[^\u4E00-\u9FA5\uF900-\uFA2Da-zA-Z0-9]/);
	// 移除空字符串
	for (var i = 0; i < list.length; i++) {
		if (list[i] === '') {
			list.splice(i,1);
			i --;
		}
	}
	if (list.length === 0) {
		alert("输入数据为空，请重新输入");
		return false;
	}
	return list;
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
	for (var i = 0,number; number=queue.numbers[i]; i++) {
		str += "<div>" + number + "</div>";
	}
	renderEle.innerHTML = str;
}

// 查询高亮显示
// 将<div>3</div>替换为
// <div><strong class="mark">10</strong></div>		
function renderSearch(inquire) {
	// // 先重置
	// renderQueue();
	// // 再查找
	// var elementlist = renderEle.children;
	// for (var i = 0,ele; ele = elementlist[i]; i ++) {
	// 	var str = ele.innerHTML;
	// 	var newstr = "<strong class='mark'>" + inquire + "</strong>";
 //        ele.innerHTML = str.replace(inquire,newstr);
	// }

	// 学习到的方法，不使用dom操作，效率不高，直接重组innerhtml，通过arry
    var str = queue.numbers.map(function(d) {
    	  var r = d + '';
          if (inquire != null && inquire.length > 0) {
            r = r.replace(new RegExp(inquire, "g"), "<span class='mark'>" + inquire + "</span>");
          }
          return "<div>" + r + "</div>";
        }).join('');
	renderEle.innerHTML = str;
}

// 事件绑定
function innitialEvent() {
	addEvent($('leftin'), 'click', function(){
		var list = getNumber();
		for (var i = list.length-1; i >= 0; i --) {
			queue.leftIn(list[i]);
		}
		renderQueue();
	});
	addEvent($('leftout'), 'click', function(){
		queue.leftOut(number);
		renderQueue();
	});
	addEvent($('rightin'), 'click', function(){
		var list = getNumber();
		for (var i = 0,data; data = list[i]; i ++) {
			queue.rightIn(data);
		}
		renderQueue();
	});
	addEvent($('rightout'), 'click', function(){
		queue.rightOut(number);
		renderQueue();
	});

	delegateEvent(renderEle, 'div', 'click', deleteQuenueNumber);

	// 使用html5新特性placeholder来改进下面内容的实现
	// // textarea 对话框focus事件，当focus时，value为空
	// addEvent(input, 'focus', function() {
	// 	if (inputValue === '') {
	// 		input.value = '';
	// 	}
	// })
	// // 输入时，获取input的值
	// addEvent(input, 'input', function() {
	// 		inputValue = input.value;
	// })
	// // 失去焦点时，如果没有输入值，还原
	// addEvent(input, 'blur', function() {
	// 	if (inputValue === '') {
	// 		input.value = inputOrigin;
	// 	}
	// })

	// 查询
	addEvent($('search'), 'click', function() {
		renderSearch($('searchInput').value);
	});
}

function init() {
	innitialEvent();
	renderQueue();
}

init();