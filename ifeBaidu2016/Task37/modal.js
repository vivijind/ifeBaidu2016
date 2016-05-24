// 兼容函数
var addEvent = document.addEventListener ?
    function(elem, type, listener, useCapture) {
        elem.addEventListener(type, listener, useCapture);
    } :
    function(elem, type, listener, useCapture) {
        elem.attachEvent('on' + type, listener);
    };

// 事件处理
var emitter = {
	// 注册事件，event为事件名称，fn为事件执行函数
	on: function(event, fn) {
		var handles = this._handles || (this._handles = {}),
			calls = handles[event] || (handles[event] = []);
		
		// 找到对应名字的栈
		calls.push(fn);

		return this;
	},
	// 解绑事件
	off: function(event, fn) {
		if(!event || !this._handles) this._handles = {};
		if (!this._handles) return;

		var handles = this._handles, 
			calls;

		if (calls = handles[event]) {
			if (!fn) {
				handles[event] = [];
				return this;
			}
			// 找到和fn对应的event，移除
			for (var i = 0, len = calls.length; i < len; i ++) {
				if (fn === calls[i]) {
					calls.splice(i,1);
					return this;
				}
			}
		}
		return this;
	},
	// 触发事件
	emit: function(event) {
		var args = [].slice.call(arguments, 1),
			handles = this._handles,
			calls;

		if (!handles || !(calls = handles[event])) return this;
		// 触发所有对应名字的listeners
		for (var i = 0, len = calls.length; i < len; i ++) {
			calls[i].apply(this, args);
		}
		return this;
	}
}


!function(){
	// 一些辅助函数
	// 将html字符串转换为节点，便于后续操作
	function html2node(str) {
		var container = document.createElement('div');
		container.innerHTML = str;
		return container.children[0];
	}

	// 对象拷贝,将o2拷贝到o1中，不会覆盖o1中已经存在的值
	function extend(o1,o2) {
		for (var i in o2) {
			if (o1[i] === undefined) {
				o1[i] = o2[i];
			}
		}
		return o1;
	}


	// 接口实现
	// modal 主体html模板
	var template = 
	'<div class="m-modal">\
		<div class="modal_mask"><div>\
	        <div class="modal_wrap animated">\
	            <h3 class="modal_head">标题</h3>\
	            <div class="modal_body">内容</div>\
	            <div class="modal_foot">\
	                <a class="confirm" href="#">确认</a>\
	                <a class="cancel" href="#">取消</a>\
	            </div>\
	        </div>\
	    </div>';

	// Modal 实现
	function Modal(options) {
		// options判断，给定初始值，输入不存在为空都等于{}
		options = options || {};
		// 将原型上的_layout赋值一份到Modal构造函数中，保证每个实例有自己的节点
		// cloneNode方法，设置为 true，如果您需要克隆节点及其属性，以及后代，设置为 false，如果您只需要克隆节点及其后代
		this.container = this._layout.cloneNode(true);

		// 将后续经常用到的节点放在实例上，避免查找开销
		// 获得body节点
		this.body = this.container.querySelector(".modal_body");
		// 获得窗体节点，进行动画
		this.wrap = this.container.querySelector(".modal_wrap");
		// 获得head节点
		this.head = this.container.querySelector(".modal_head");
		
		// 将options 复制到 组件实例上，让options.content等于this.content，这样使用比较简单
	    extend(this, options);

	    // 初始化事件
	    this._initEvent();

	    this.drag = this.drag || false;

	    // 允许拖拽
	    if (this.drag) {
	    	this._initDrag();
	    }
	}

	// 构建Modal方法
	extend(Modal.prototype, {
		
		// 根据模板转换为节点
		_layout: html2node(template),

		// Modal setContent接口，设置窗体内容
		setContent: function(content) {
			if (!content) return;

			//支持两种字符串结构和DOM节点
		    if(content.nodeType === 1){ 	// DOM节点
		      this.body.innerHTML = 0;
		      this.body.appendChild(content);
		    }else{	// 字符串
		      this.body.innerHTML = content;
		    }
		},
		// Modal show接口
		// 需要注意窗体内容不仅仅是文字，有可能是其他内容，比如图片，这时候可以传入dom节点
		show: function(content) {
			if (content) {
				this.setContent(content);
			}
			// 给html的body节点增加整个窗体节点
			document.body.appendChild(this.container);
			// 动画
			animateClass(this.wrap, this.animation.enter);
		},

		// Modal hide接口
		hide: function() {
			var container = this.container;

			// 动画
			animateClass(this.wrap, this.animation.leave, function(){
		        document.body.removeChild(container);
		      });
		},

		// 内部接口
		// 确认
		_onConfirm: function() {
			// this.onConfirm();
			this.emit("confirm");
			this.hide();
		},

		// 取消
		_onCancel: function() {
			// this.onCancel();
			this.emit("cancel");
			this.hide();
		},

		// 事件初始化
		_initEvent: function() {
			// 给确认和取消绑定事件
			addEvent(this.container.querySelector(".confirm"), 'click', 
				this._onConfirm.bind(this));
			addEvent(this.container.querySelector(".cancel"), 'click',
				this._onCancel.bind(this));
		},

		// 拖拽初始化
		_initDrag: function() {
			this._dragInfo = {};

			// 移动
			this.head.addEventListener("mousedown", this._dragstart.bind(this));
		    this.head.addEventListener("mousemove", this._dragmove.bind(this));
		    this.head.addEventListener("mouseup", this._dragend.bind(this));
      		this.head.addEventListener("mouseleave", this._dragend.bind(this));
      		// 拖拽放大缩小
      // 		this.wrap.addEventListener("mousedown", this._dragstart.bind(this));
		    // this.wrap.addEventListener("mousemove", this._dragmove.bind(this));
		    // this.wrap.addEventListener("mouseup", this._dragend.bind(this));
      // 		this.wrap.addEventListener("mouseleave", this._dragend.bind(this));
		},

		// 开始移动或者拖拽，记录初始坐标
		_dragstart: function(ev) {
			var dragInfo = this._dragInfo;
			dragInfo.start = {x: ev.pageX, y: ev.pageY};
			dragInfo.zoom = false;

			// 判断是否为拖拽放大缩小，即判断鼠标是否在边框右下角
			var wrapPos = ev.target.getBoundingClientRect();
			if (dragInfo.start.x === wrapPos.right && dragInfo.start.y === wrapPos.bottom) {
				dragInfo.zoom = true;
			}
		},

		// 移动、拖拽
		_dragmove: function(ev) {
			var dragInfo = this._dragInfo;
			if (!dragInfo.start) {
				return;
			}

			// 默认，及选取清除
		    ev.preventDefault();

		    dragInfo.end = {x: ev.pageX, y: ev.pageY};

		    var start = dragInfo.start;
		    // 清除恼人的选区
		    if (window.getSelection) {
		      	window.getSelection().removeAllRanges();
		    } else if (window.document.selection) {
		      	window.document.selection.empty();
		    }

		    var translatex = parseInt(dragInfo.end.x - dragInfo.start.x);
			var translatey = parseInt(dragInfo.end.y - dragInfo.start.y);

			if (translatex === 0 || translatey === 0) {
				return;
			} else {
				this._calMove(translatex,translatey);
			}
		    
			
		},

		_dragend: function(ev) {
			var dragInfo = this._dragInfo;
		    if(!dragInfo) return;

		    ev.preventDefault();

		    // 保存上一次移动的最后为位置
		    // 需要再数据放开的时候获取，如果在move过程中获取，每次需要读取和赋值，导致拖拽很慢，效率低
		    // 最后获取暂时根据transform写死了，还没想到更好的方法
		   	var tempList = this.wrap.style.transform.split(/\(|(px)/);
		   	var tx = parseInt(tempList[2]);
		    var ty = parseInt(tempList[6]);
			this.finalEnd = {x: tx?tx:0, y: ty?ty:0};
		    
		    this._dragInfo = {};		    
		},

		// 移动
		_calMove: function(translatex, translatey) {
			translatex += (this.finalEnd?this.finalEnd.x:0);
			translatey += (this.finalEnd?this.finalEnd.y:0);
			
			this.wrap.style.transform = "translateX(" + translatex + "px) translateY(" + translatey + "px) translateZ(0px)";
		}

	});

	//和多重继承类似（其实可以把 Mixin 看作多重继承的一种在特定场景下的应用），
	//但通常混入 Mixin 的类和 Mixin 类本身不是 is-a 的关系，
	//混入 Mixin 类是为了添加某些（可选的）功能。
	//自由地混入 Mixin 类就可以灵活地为被混入的类添加不同的功能。
	// 使用混入Mixin的方式使得modal具有事件发射器功能
  	extend(Modal.prototype, emitter);

	//          5.Exports
	// ----------------------------------------------------------------------
	// 暴露API:  Amd || Commonjs  || Global 
	// 支持commonjs
	if (typeof exports === 'object') {
	    module.exports = Modal;
	    // 支持amd
	} else if (typeof define === 'function' && define.amd) {
	    define(function() {
	      return Modal
	    });
	} else {
	    // 直接暴露到全局
	    window.Modal = Modal;
	}
	
}();