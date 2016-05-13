/* 数据格式演示
var aqiSourceData = {
  "北京": {
    "2016-01-01": 10,
    "2016-01-02": 10,
    "2016-01-03": 10,
    "2016-01-04": 10
  }
};
*/

var $ = function(id){
    return document.getElementById(id);
}

var addEvent = document.addEventListener ?
    function(elem, type, listener, useCapture) {
        elem.addEventListener(type, listener, useCapture);
    } :
    function(elem, type, listener, useCapture) {
        elem.attachEvent('on' + type, listener);
    };

// 以下两个函数用于随机模拟生成测试数据
function getDateStr(dat) {
  var y = dat.getFullYear();
  var m = dat.getMonth() + 1;
  m = m < 10 ? '0' + m : m;
  var d = dat.getDate();
  d = d < 10 ? '0' + d : d;
  return y + '-' + m + '-' + d;
}
function randomBuildData(seed) {
  var returnData = {};
  var dat = new Date("2016-01-01");
  var datStr = ''
  for (var i = 1; i < 92; i++) {
    datStr = getDateStr(dat);
    returnData[datStr] = Math.ceil(Math.random() * seed);
    dat.setDate(dat.getDate() + 1);
  }
  return returnData;
}

var aqiSourceData = {
  "北京": randomBuildData(500),
  "上海": randomBuildData(300),
  "广州": randomBuildData(200),
  "深圳": randomBuildData(100),
  "成都": randomBuildData(300),
  "西安": randomBuildData(500),
  "福州": randomBuildData(100),
  "厦门": randomBuildData(100),
  "沈阳": randomBuildData(500)
};

// 用于渲染图表的数据
var chartData = {};

// 记录当前页面的表单选项
var pageState = {
  nowSelectCity: -1,
  nowGraTime: "day"
}

function getRandomColor(){ 
return "#"+("00000"+((Math.random()*16777215+0.5)>>0).toString(16)).slice(-6); 
} 

/**
 * 渲染图表
 */
function renderChart() {
    // canvas方法，没有实现用title属性提示这个柱子的具体日期和数据
    // // 判断是否有canvs节点，没有创建canvs节点 渲染上下文
    // var myCanvas = document.getElementsByClassName('aqi-chart-wrap')[0].children[0];
    // if (!myCanvas) {
    //     myCanvas = document.createElement('canvas');
    //     myCanvas.setAttribute('style','margin: 0 auto');
    //     document.getElementsByClassName('aqi-chart-wrap')[0].appendChild(myCanvas);
    // }
    // var ctx = myCanvas.getContext('2d');
    // // 设置画布宽高
    // myCanvas.width = 1000;
    // myCanvas.height = 500;
    // // 清除画布
    // ctx.clearRect(0,0,1000,500);

      
    // // 根据数据绘制
    // var city = pageState.nowSelectCity;
    // var time = pageState.nowGraTime;
    // var renderData = chartData[city][time];
    // if (renderData === null) {
    //     return;
    // }
    // // 绘制宽度
    // var rectWidth = myCanvas.width/(Object.getOwnPropertyNames(renderData).length);
    // var x = 0;
    // for (var data in renderData) {
    //     ctx.fillStyle = getRandomColor();
    //     ctx.fillRect(x,500-renderData[data],rectWidth,renderData[data]);
    //     x += rectWidth;
    // }
    
    var chart = document.getElementsByClassName('aqi-chart-wrap')[0];
    var fillRect = '';
    // 根据数据绘制
    var city = pageState.nowSelectCity;
    var time = pageState.nowGraTime;
    var renderData = chartData[city][time];
    if (renderData === null) {
        return;
    }
    // 绘制宽度，创建div
    var rectWidth = 1000/(Object.getOwnPropertyNames(renderData).length);
    var x = 0;
    for (var data in renderData) {
        var color = getRandomColor();
        fillRect += '<div title="'+data+":"+renderData[data]+'" style="height:'+renderData[data]+'px; background-color:'+color+'"></div>';
    }
    
    chart.innerHTML = fillRect;
}

/**
 * 日、周、月的radio事件点击时的处理函数
 */
function graTimeChange() {
  // 确定是否选项发生了变化 
  if (event.target.value === pageState.nowGraTime) {
      return;
  }
  // 设置对应数据
  pageState.nowGraTime = event.target.value;

  // 调用图表渲染函数
  renderChart();
}

/**
 * select发生变化时的处理函数
 */
function citySelectChange() {
  // 确定是否选项发生了变化 
  if (event.currentTarget.value === pageState.nowSelectCity) {
      return;
  }
  // 设置对应数据
  pageState.nowSelectCity = event.currentTarget.value;

  // 调用图表渲染函数
  renderChart();
}

/**
 * 初始化日、周、月的radio事件，当点击时，调用函数graTimeChange
 */
function initGraTimeForm() {
    addEvent($("form-gra-time"), "click", graTimeChange);
}

/**
 * 初始化城市Select下拉选择框中的选项
 */
function initCitySelector() {
  // 读取aqiSourceData中的城市，然后设置id为city-select的下拉列表中的选项
  var citySelections = $("city-select");
  var cityList = "";
  //<option>北京</option>
  for(var city in aqiSourceData) {
    cityList += "<option>" + city + "</option>";
  }
  citySelections.innerHTML = cityList;

  pageState.nowSelectCity = citySelections.value;

  // 给select设置事件，当选项发生变化时调用函数citySelectChange
  addEvent(citySelections, 'change', function(){
    citySelectChange();
  });
}

/**
 * 判断当前日期是本月第几周
 * @param  {[Data]} dat [当前日期的data]
 * @return {[Number]}     [第几周]
 */
var getMonthWeek = function (dat) {
    // 当前周几及第几天
    var weekday = dat.getDay(), day = dat.getDate();
    if (weekday === 0) {
        weekday = 7;
    }
    return Math.ceil((day + 7 - weekday) / 7); 
};

/**
 * 初始化图表需要的数据格式
 */
function initAqiChartData() {
  // 将原始的源数据处理成图表需要的数据格式
  // 处理好的数据存到 chartData 中
  for(var city in aqiSourceData){
    var cityData = aqiSourceData[city];
    var weekData = {},dayData = {},monthData = {};

    var weeknow = 1,monthnow = 0,dayWeeknow = 0,dayMonthnow = 0;
    var weeksum = 0, monthSum = 0;

    for(var item in cityData){
        var time = item;
        var value = cityData[item];

        // 处理日数据
        dayData[time] = value;

        // 获得时间
        var dat = new Date(time);
        var week = dat.getDay();    // 周
        var month = dat.getMonth(); // 月份
        var y = dat.getFullYear();

        if (month !== monthnow) {
            if (dayWeeknow !== 1) {
                var weekstr = y + "年" + (monthnow+1) + "月第" + weeknow + "周";
                weekData[weekstr] = weeksum/dayWeeknow;
                weeknow = weekNumber;
                dayWeeknow = 0;
                weeksum = 0;
                weeknow = 1;
            }

            var monthstr = y + "年" + (monthnow+1) + "月";
            monthData[monthstr] = monthSum/dayMonthnow;
            monthnow = month;
            monthSum = 0;
            dayMonthnow = 0;
        }

        // 处理周数据
        var weekNumber = getMonthWeek(dat);

        if (weeknow !== weekNumber) {
            var weekstr = y + "年" + (monthnow+1) + "月第" + weeknow + "周";
            weekData[weekstr] = weeksum/dayWeeknow;
            weeknow = weekNumber;
            dayWeeknow = 0;
            weeksum = 0;
        }
        weeksum += value;
        monthSum += value;
        dayWeeknow ++;
        dayMonthnow ++;
    }

    if (dayMonthnow !== 1) {
        var monthstr = y + "年" + (monthnow+1) + "月";
        monthData[monthstr] = monthSum/dayMonthnow;
        monthnow = month;
        monthSum = 0;
        dayMonthnow = 0;
    }
    chartData[city] = {day : dayData, month : monthData, week : weekData};
    dayData = null;
    monthData = null;
    weekData = null;
  }
}

/**
 * 初始化函数
 */
function init() {
  initGraTimeForm();
  initCitySelector();
  initAqiChartData();
}

init();
