// 基本事件
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

// trim方法 进行前后去空格及空字符处理
function trim(str) {
    return str.replace(/^(\s|\u00A0)+|(\s|\u00A0)+$/g, "");
}

/**
 * 定义tag对象
 * @param  {[string]} type     [input/textarea 表示tag输入框为input或textarea，输入值为]
 * @param  {[string]} inputId  [输入框id]
 * @param  {[string]} quenueId [标签队列id]
 * @param  {[string]} buttonId [button按钮，传入表示关联button，不传入表示默认enter键输入]
 * @return {[type]}          [description]
 */
// 对象属性
function Tag(inputId,quenueId,buttonId) {
	// 公有属性
	this.input = $(inputId);
	this.queue = $(quenueId);
	this.button = $(buttonId);

	// protected属性
	// 队列
	this._queue = {
		dataList: ["HTML", "CSS", "JavaScript"],
		maxLength: 10,
		leftIn: function(value) {
			this.dataList.indexOf(value) !== -1? alert(value + "已存在"):this.dataList.unshift(value);
			this.check();
		},
		rightIn: function(value) {
			this.dataList.indexOf(value) !== -1? alert(value + "已存在"):this.dataList.push(value);
			this.check();
		},
		leftOut: function(value) {
			this.dataList.shift();
		},
		rightOut: function(value) {
			this.dataList.pop();
		},
		deletePos: function(pos) {
			this.dataList.splice(pos,1);
		},
		check: function() { // 保证数组最大长度不超过maxLength
			if (this.dataList.length > this.maxLength) {
				this.dataList.splice(0,-this.maxLength);
			}
		}
	}
}

// 对象方法
Tag.prototype = {
	// 构造器，表示对象类型
	constructor: Tag,

	// 公有方法
	init: function() {
		this._renderQueue();
		this._innitialEvent();	
	},
	// 私有方法
	// 获取输入框的值，根据type类型获取
	_getNumber: function() {
		var type = this.input.tagName;
		var str = this.input.value;
		switch(type) {
			case "INPUT": // 直接获取输入的值
				return str.trim();
			case "TEXTAREA": // 以所有非数字、中文、英文字符作为间隔
				var list = str.split(/[^\u4E00-\u9FA5\uF900-\uFA2Da-zA-Z0-9]/);
				// 移除空字符串
				for (var i = 0; i < list.length; i++) {
					list[i].trim();
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
	},
	// 绘制
	_renderQueue: function() {
		// // 先移除mouse事件
		// console.log("delete mouse event");
		// var eleList = this.queue.children;
		// for(var i=0,ele; ele=eleList[i]; i++) {
		// 	ele.onmouseover = null;
		// 	ele.onmouseout = null;
		// }

		var str = '';
		for (var i = 0,number; number = this._queue.dataList[i]; i++) {
			str += "<div>" + number + "</div>";
		}
		this.queue.innerHTML = str;

		// // render的时候给所有div增加mouseover和mouseout的事件绑定，这两个事件不适合事件委托，所以需要实时绑定
		// // 鼠标移动上去显示删除
		// console.log("add mouse event");
		// for(var i=0,ele; ele=eleList[i]; i++) {
		// 	addEvent(ele, 'mouseover', function(event){
		// 		var str = event.target.innerHTML;
		// 		str = '点击删除' + str;
		// 		event.target.innerHTML = str;
		// 		return;
		// 	});
		// 	// 鼠标移开，恢复
		// 	addEvent(ele, 'mouseout', function(event){
		// 		event.target.innerHTML.replace("点击删除",'');
		// 	});
		// }
	},

	// 事件绑定
	_innitialEvent: function() {
		var selfThis = this;
		// 删除事件
		delegateEvent(this.queue, 'div', 'click', function(event) {
			var eventList = event.currentTarget.children;
			var pos = 0;
			for (var i= 0,tar; tar = eventList[i]; i ++) {
				if (tar === event.target) {
					selfThis._queue.deletePos(pos);
					selfThis._renderQueue.apply(selfThis);
					break;
				}
				pos ++;
			}
		});

		var className = this.input.getAttribute('class');
		// 输入框focus事件，当focus时，给输入框增加class=“tagInput”
		addEvent(this.input, 'focus', function() {
			selfThis.input.setAttribute('class', className + " tagInput");
		})
		// 失去焦点时，还原class
		addEvent(this.input, 'blur', function() {
			selfThis.input.setAttribute('class', className);
		})

		// 存在button时，给button绑定增加事件
		if (this.button) {
			addEvent(this.button, 'click', function(){
				var list = selfThis._getNumber.apply(selfThis);
				for (var i = 0,data; data = list[i]; i ++) {
					selfThis._queue.rightIn(data);
				}
				selfThis._renderQueue.apply(selfThis);
			});
		} else {	// 不存在button，给input绑定键盘输入enter事件
			addEvent(this.input, 'keyup', function(){
				var keycode = event.keyCode;
				if(keycode === 8 || keycode === 188 || keycode === 13) { // 判断空格，逗号，回车
					var number = selfThis._getNumber.apply(selfThis);
					if(number) {
						selfThis._queue.rightIn(number);
						selfThis._renderQueue(selfThis._queue.dataList);
						return false;
					}
				}
			});
		}
	}
}

// 创建两个tag对象，并执行初始化
var tagInput = new Tag('tag-container', 'tag-queue');
tagInput.init();

var hobbyInput = new Tag('hobby-container', 'hobby-queue', 'confirm');
hobbyInput.init();