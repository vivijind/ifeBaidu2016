// table 实现
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
    // table 主体html模板
    var template = 
    '<table class="m-table">\
        <thead class="table_head"></thead>\
        <tbody class="table_body"></tbody>\
    </table>';
}();