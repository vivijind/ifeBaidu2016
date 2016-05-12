/**
 * 任务描述

参考以下示例代码，用户输入城市名称和空气质量指数后，点击“确认添加”按钮后，就会将用户的输入在进行验证后，添加到下面的表格中，新增一行进行显示
用户输入的城市名必须为中英文字符，空气质量指数必须为整数
用户输入的城市名字和空气质量指数需要进行前后去空格及空字符处理（trim）
用户输入不合规格时，需要给出提示（允许用alert，也可以自行定义提示方式）
用户可以点击表格列中的“删除”按钮，删掉那一行的数据
 */

var $ = function(id){
    return document.getElementById(id);
};

var addEvent = document.addEventListener ?
    function(elem, type, listener, useCapture) {
        elem.addEventListener(type, listener, useCapture);
    } :
    function(elem, type, listener, useCapture) {
        elem.attachEvent('on' + type, listener);
    };

// trim方法 进行前后去空格及空字符处理
function trim(str) {
    return str.replace(/^(\s|\u00A0)+|(\s|\u00A0)+$/g, "");
}

/**
 * 判断一个对象是否为空对象（属性值为空）
 * @param  {[type]}  obj [对象]
 * @return {Boolean}     [是否为空]
 */
var isEmptyObject = function(obj) { 
    for ( var name in obj ) { 
        return false; 
    } 
    return true; 
}; 


// 学习到的代码——事件代理 事件代理可以不用清楚事件，提高性能
function delegateEvent(element, tag, eventName, listener) {
            addEvent(element, eventName, function () {
                var event = arguments[0] || window.event,
                    target = event.target || event.srcElement;
                if (target && target.tagName === tag.toUpperCase()) {
                    listener.call(target, event);
                }
            });
        }

/**
 * aqiData，存储用户输入的空气指数数据
 * 示例格式：
 * aqiData = {
 *    "北京": 90,
 *    "上海": 40
 * };
 */
var aqiData = {};

/**
 * 从用户输入中获取数据，向aqiData中增加一条数据
 * 然后渲染aqi-list列表，增加新增的数据
 */
function addAqiData() {
    var city = $("aqi-city-input").value;
    var value = $("aqi-value-input").value;
    city = trim(city);
    value = trim(value);
    //前后去空格及空字符处理
    if(!(city && value)) {
        alert ("请输入数据，不能为空");
        return;
    }
    var regex = /^[\u4e00-\u9fa5a-zA-Z]+$/;
    var regexValue = /^[\d]+$/;
    if (!regex.test(city)) {
        alert ("输入的城市名必须为中英文字符");
        return;
    }
    if (!regexValue.test(value)) {
        alert ("输入的空气质量指数必须为整数");
        return;
    }
    
    aqiData[city] = value;

    //add成功后input值清空
    $("aqi-city-input").value = "";
    $("aqi-value-input").value = "";
}

/**
 * 渲染aqi-table表格
 */
function renderAqiList() {
    if (isEmptyObject(aqiData)) {
        return;
    }
    // 不要直接对innerHTML+=，这样性能不高
    var aqiTableValue = "<tr><td>城市</td><td>空气质量</td><td>操作</td></tr>";
    for (var city in aqiData) {
        aqiTableValue += "<tr><td>" + city + "</td><td>" + aqiData[city] + "</td><td><button>删除</button></td></tr>";
    }
    $("aqi-table").innerHTML = aqiTableValue;
}

/**
 * 点击add-btn时的处理逻辑
 * 获取用户输入，更新数据，并进行页面呈现的更新
 */
function addBtnHandle() {
  addAqiData();
  renderAqiList();
}

/**
 * 点击各个删除按钮的时候的处理逻辑
 * 获取哪个城市数据被删，删除数据，更新表格显示
 */
function delBtnHandle() {
  // do sth.
  delete aqiData[this.parentNode.parentNode.firstElementChild.innerHTML];
  $("aqi-table").innerHTML = "";
  renderAqiList();
}

function init() {
  // 在这下面给add-btn绑定一个点击事件，点击时触发addBtnHandle函数
    addEvent($("add-btn"), "click", addBtnHandle);
  // 想办法给aqi-table中的所有删除按钮绑定事件，触发delBtnHandle函数
    delegateEvent($("aqi-table"), "button", "click", delBtnHandle);
}

init();
