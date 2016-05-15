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

// 函数random用于生成min-max范围内的随机数
function random(min,max) {
	return Math.floor(Math.random()*(max - min)) + min;
}

var colors = ["#441d49", "#538289", "#a02730", "#73832a", "#005db1", "#10193a"];
 //根据值的大小选择颜色
 function getColor(value) {
     if (value < 60) {
         return colors[0];
     } else if (value >= 60 && value < 70) {
         return colors[1];
     } else if (value >= 70 && value < 80) {
         return colors[2];
     } else if (value >= 80 && value < 90) {
         return colors[3];
     } else if (value >= 90 && value < 100) {
         return colors[4];
     } else if (value === 100) {
         return colors[5];
     }
 }

var inputNumber = $('number');
var renderEle = $('queue');

// 获取输入框的值，并验证是否为数字
function getNumber(number) {
	number = inputNumber.value;
	if(!/[0-9]+/.test(number)){
		alert('请输入数字');
		return false;
	}
	if (number-10<0 || 100-number<0) {
		alert('请输入10-100以内的数字');
		return false;
	}
	return number-0;
}

// 队列
var queue = {
	numbers: [10,3,7,12],
	maxLength: 60,
	check: function() {
		var len = this.numbers.length;
		if (len>this.maxLength) {
			alert("队列元素数量最多限制60个");
			return false;
		}
		return true;
	},
	leftIn: function(number) {
		if (this.check()) {
			this.numbers.unshift(number);
		}
	},
	rightIn: function(number) {
		if (this.check()) {
			this.numbers.push(number);
		}
	},
	leftOut: function(number) {
		this.numbers.shift();
	},
	rightOut: function(number) {
		this.numbers.pop();
	},
	deletePos: function(pos) {
		this.numbers.splice(pos,1);
	},
	randomInit: function(amount,min,max) {	// 随机重新生成amount个队列元素
		var len = this.numbers.length;
		this.numbers.splice(0,len-1);
		for (var i=0; i<amount; i ++) {
			this.numbers.push(random(min,max));
		}
	}
}

// 绘制
function renderQueue(array) {
	// <div style='height: 100px;'>10</div>
	var str = '';
	for (var i = 0,number; number=array[i]; i++) {
		str += "<div style='height: " + number*5 + "px; background-color: " + getColor(number) + ";'></div>";
	}
	renderEle.innerHTML = str;
}

// 排序及可视化
// var sort = {
// 	Bubble: function(array, callback) {
// 		var timmer = setInterval(run,50);
// 		var len = array.length;
// 		var i = 0,j = 0;
// 		function run() {
// 			if(i<len){
// 				if(j < len-1-i){
// 					if (array[j] > array[j+1]) {
// 						array[j+1] = array.splice(j, 1, array[j+1])[0];
// 						callback();
// 					}
// 					j ++;
// 					return;
// 				}
// 				else {
// 					j = 0;
// 				}
// 				i ++;
// 			}
// 			else {
// 				clearInterval(timmer);
// 			}
// 		}
// 	},
// 	QuickSort: function(array, callback) {

// 	}
// }
// 学习到的方法：每次排序，建立一个快照的思想，放到另一个数组里，
// 然后在绘制的时候，定时绘制，这样将数据和绘制动画在一定程度上分离了，比之前每次排序进行判断要好
var snapshoots = []; // 给定一个快照集合，用于存储每次绘制
var sort = {
	Bubble: function(array) {
		snapshoots = [];
		var len = array.length;
		for (var i = 0; i < len; i ++) {
			for (var j = 0; j < len-1-i; j ++) {
				if (array[j] > array[j+1]) {
					array[j+1] = array.splice(j,1,array[j+1])[0];
					snapshoots.push(array.slice(0));	//拷贝一份到新的数组中
				}
			}
		}
	},
	QuickSort: function(array) {
		snapshoots = [];
		var left = 0;
		var right = array.length-1;
		function quick_sort(left, right) {
			if(left - right >= 0) {
				return;
			}
			var i = left,j = right;
			var key = array[left];
			while(j-i>0) {
				while (j-i>0 && array[j]-key>0) {
					j --;
				}
				if (j-i>0) {
					array[i++] = array[j];
					snapshoots.push(array.slice(0));
				}
				while (j-i>0 && array[i]-key<0) {
					i++;
				}
				if (j-i>0) {
					array[j--] = array[i]; 
					snapshoots.push(array.slice(0));
				}
			}
			array[i] = key;
			snapshoots.push(array.slice(0));
			// 递归调用
			quick_sort(left,j-1);
			quick_sort(i+1,right);
		}
		quick_sort(left,right);
	},
	InsertSort: function(array) {
		snapshoots = [];
		var len = array.length;
		var hasSort = 1;
		for (var i = 1; i < len; i ++) {
			var key = array[i];	// 当前要插入的元素
			for (var j = 0; j < hasSort; j ++) {	// 插入已经排序的数组，hassort表示已经排好序的数组长度
				if (key < array[j]) {
					array.splice(j,0,key);
					array.splice(i+1,1);
					snapshoots.push(array.slice(0));
					break;
				}
				else if (key >= array[j] && key < array[j+1]) {
					array.splice(j+1,0,key);
					array.splice(i+1,1);
					snapshoots.push(array.slice(0));
					break;
				}
			}
			hasSort ++;
		}
	},
	SelectSort: function(array) {
		snapshoots = [];
		var len = array.length;
		for (var i = 0; i < len; i ++) {
			// 在剩下的数组中找到最小值
			var min = array[i];
			var pos = i;
			for (var j = i+1; j < len; j ++) {
				if (array[j] < min) {
					min = array[j];
					pos = j;
				}
			}
			// 交换最小值和i位置上的值
			array.splice(pos,1,array[i]);
			snapshoots.push(array.slice(0));
			array[i] = min;
			snapshoots.push(array.slice(0));
		}
	},
	MergeSort: function(array) {
		snapshoots = [];
		// 新增数组，来实现归并的方法，不能满足动画要求
		// function merge(left,right){
		//     var result=[];
		//     while(left.length>0 && right.length>0){
		//         if(left[0]<right[0]) {
		//             result.push(left.shift());
		//         } else {
		//             result.push(right.shift());
		//         }
		//     }
		//     return result.concat(left).concat(right);
		// }
		// function merge_sort(array){
		// 	var len = array.length;
		//     if(len == 1) {
		//         return array;
		//     }
		//     var middle=Math.floor(len/2),
		//     left=array.slice(0,middle),
		//     right=array.slice(middle);
		//     return merge(merge_sort(left),merge_sort(right));
		//     snapshoots.push(temp.slice(0));
		//     return temp;
		// }
		// merge_sort(array);

		var len = array.length-1;
		mergeSort(array,0,len);
		function mergeSort(array, p, r) {
			if (p < r) {
				var q = Math.floor((p+ r) / 2);
				mergeSort(array, p, q);
				mergeSort(array, q + 1,r);
				merge(array, p, q, r);
			}
		}
		function merge(array, p, q, r){
			var n1 = q - p + 1, n2 = r - q, left = [], right = [], m = n = 0;
			for(var i = 0; i < n1; i++) {
				left[i] = array[p + i];
			}
			for (var j = 0;j < n2; j++) {
				right[j] = array[q + 1 + j];
			}
			left[n1] = right[n2] = Number.MAX_VALUE;
			for (var k = p; k <= r; k++) {
				if (left[m] <= right[n]) {
					array[k] = left[m];
					snapshoots.push(array.slice(0));
					m++;
				} else {
					array[k] =right[n];
					snapshoots.push(array.slice(0));
					n++;
				}
			}
		}
	}
}

var flag = false; // 给定一个flag，判断是否在绘制中
// 绘制快照
function renderSnapShoots(time) {
	flag = true;
	var i = 0,len = snapshoots.length;
	var timmer = setInterval(render,time);
	function render() {
		renderQueue(snapshoots[i]);
		i ++;
		if (i === len) {
			clearInterval(timmer);
			flag = false;
			return;
		}
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

// 事件绑定
function innitialEvent() {
	addEvent($('leftin'), 'click', function(){
		var number = getNumber();
		if(number) {
			queue.leftIn(getNumber());
			renderQueue(queue.numbers);
		}
	});
	addEvent($('leftout'), 'click', function(){
		queue.leftOut();
		renderQueue(queue.numbers);
	});
	addEvent($('rightin'), 'click', function(){
		var number = getNumber();
		if(number) {
			queue.rightIn(number);
			renderQueue(queue.numbers);
		}
	});
	addEvent($('rightout'), 'click', function(){
		queue.rightOut();
		renderQueue(queue.numbers);
	});

	delegateEvent(renderEle, 'div', 'click', deleteQuenueNumber);

	// 随机生成
	addEvent($('generate'), 'click', function(){
		queue.randomInit(55,10,100);
		renderQueue(queue.numbers);
	});
	// 排序事件
	// 冒泡排序
	addEvent($('bubble'), 'click', function(){
		if (flag) {
			alert("正在绘制噢，请稍后");
		}
		sort.Bubble(queue.numbers);
		renderSnapShoots($('interval').value);
	});
	// 快速排序
	addEvent($('quick'), 'click', function(){
		if (flag) {
			alert("正在绘制噢，请稍后");
		}
		sort.QuickSort(queue.numbers);
		renderSnapShoots($('interval').value);
	});
	// 插入排序
	addEvent($('insert'), 'click', function(){
		if (flag) {
			alert("正在绘制噢，请稍后");
		}
		sort.InsertSort(queue.numbers);
		renderSnapShoots($('interval').value);
	});
	// 选择排序
	addEvent($('select'), 'click', function(){
		if (flag) {
			alert("正在绘制噢，请稍后");
		}
		sort.SelectSort(queue.numbers);
		renderSnapShoots($('interval').value);
	});
	// 归并排序
	addEvent($('merge'), 'click', function(){
		if (flag) {
			alert("正在绘制噢，请稍后");
		}
		sort.MergeSort(queue.numbers);
		renderSnapShoots($('interval').value);
	});
}

function init() {
	innitialEvent();
	renderQueue(queue.numbers);
}

init();