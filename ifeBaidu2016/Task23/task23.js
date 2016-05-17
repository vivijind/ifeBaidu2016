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

// 构建一棵树的类
// 树节点
function TreeNode(data){
    this.data = data;
    this.parent = null;
    this.child = [];

    // tree关联dom结点
    this.domElement = document.createElement('div'); // 访问对应的DOM结点
    this.domElement.innerHTML = this.data;
}
// 树
function Tree(data) {
    var node = new TreeNode(data);
    this._root = node;
}
// 树的方法
Tree.prototype = {
    constructor: Tree,

    // 树的遍历结果存储，用于绘制
    treeList: [],

    // 绘制标识
    rendering: false,

    traverseDF: function(callback) {
        treeList = [];
        (function recurse(currentNode) {
            for (var i = 0, node; node = currentNode.child[i]; i ++) {
                recurse(node);
            }
            
            treeList.push(currentNode);
            callback(currentNode);
        })(this._root);
    },
    traverseBF: function(callback) {
        treeList = [];
        var queue = [];
        var listpos = 0;
        queue.push(this._root);
        (function recurse(currentNode) {
            if (currentNode) {
                for (var i = 0,node; node = queue[listpos].child[i]; i ++) {
                    queue.push(node);
                }

                listpos ++;
                callback(currentNode);
                recurse(queue[listpos]);
            }
        })(this._root);
        treeList = queue;
    },
    search: function(data,traverse) {
        var result = [];
        traverse.call(this, function(node){
            if(node.data === data) {
                result.push(node);
            }
        });
        return result;
    },
    /**
     * 给树增加结点，将data增加到toData结点下
     * @param {[Array]} dataList     [子节点data（可以多个）]
     * @param {[string]} toData   [需要添加子节点的父节点data]
     * @param {[function]} traverse [遍历查找父节点方式]
     * @param {[boolean]} insertAll [true/false 添加到所有找到的父节点中/仅添加到找到的第一个]
     */
    add: function(dataList, toData, traverse, insertAll) {
        // 先查找需要添加子节点的父节点
        var result = this.search(toData,traverse);
        var len = result.length;
        if (len === 0) {
            throw new Error('找不到' + toData + '结点，不能往不存在的节点中添加子节点');
        }
        if (!insertAll) {
            len = 1;
        }
        // 添加子节点
        for (var j = 0; j < len; j++) {
            for (var i = 0, nodeData; nodeData = dataList[i]; i ++) {
                var child = new TreeNode(nodeData),
                    parent = result[j];
                parent.child.push(child);
                child.parent = parent;

                //dom结点添加
                parent.domElement.appendChild(child.domElement);
            }
        }
    },
    /**
     * 删除树结点，将fromData下的data均删除
     * @param {[Array]} dataList     [需要删除的子节点data（可以多个）]
     * @param {[string]} toData   [需要删除子节点的父节点data]
     * @param {[function]} traverse [遍历查找父节点方式]
     * @param {[boolean]} insertAll [true/false 删除到所有找到的父节点中/仅删除找到的第一个]
     */
    remove: function(dataList, fromData, traverse, insertAll) {
        // 先查找需要删除子节点的父节点
        var childToRemove = [];
        var result = search(toData,traverse);
        var len = result.length;
        if (len === 0) {
            throw new Error('找不到' + toData + '结点，不能往不存在的节点中添加子节点');
        }
        if (!insertAll) {
            len = 1;
        }
        // 删除子节点
        for (var j = 0; j < len; j++) {
            for (var i = 0, nodeData; nodeData = dataList[i]; i ++) {
                var parent = result[i];
                var index = findIndex(result[i].children, data);;
                if (index === undefined) {
                    throw new Error('需要删除的子节点' + nodeData + '不存在');
                } else {
                    childToRemove.push(parent.children.splice(index, 1));
                    // dom结点删除
                    parent.domElement.removeChild(child.domElement);
                }
            }
        }

        return childToRemove;

        // node中查找
        function findIndex(arr, data) {
            var index;
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].data === data) {
                    index = i;
                }
            }
            return index;
        }
    },
    renderTree: function(callback, search) {    // search表示是否需要搜索提示
        if (this.rendering) {
            alert('正在遍历啦，别急~');
            return;
        }
        
        var changePos = 0;
        var timmer = setInterval(render,500);
        function render() {
            this.rendering = true;
            // color，对应三个值，分别表示：颜色、 0/1 不是需要标志的结点/找到需要标志的结点 、0/1 不中断，中断
            var color = [];
            for(var i=0,node; node = treeList[i]; i++) {
                color = !callback? ['pink',0,0]:callback(node);
                if (i < changePos) {
                    node.domElement.setAttribute('style', 'background-color: white;');
                }
                else {
                    node.domElement.setAttribute('style', 'background-color:' + color[0] + ';');
                    if (color[2] === 1) {
                        this.rendering = false;
                        clearInterval(timmer);
                        break;
                    }
                    if (color[1] === 1) {
                        treeList.splice(i,1);
                        break;
                    }
                    changePos ++;
                    break;
                } 
            }
            if (i === treeList.length) {
                this.rendering = false;
                clearInterval(timmer);
                if (search) {
                    alert("找不到噢~请重新输入");
                }
            }
        }
    },
    resetRender: function() {
        this.traverseDF(function(node) {
            node.domElement.setAttribute('style', '');
        });
    }
}

window.onload = function (){
    // 构建树
    var tree = new Tree('super');
    tree.add(['cat','Note','fish'],'super',tree.traverseDF);
    tree.add(['Apple','Phone','study'],'cat',tree.traverseDF);
    tree.add(['Human','program'],'Note',tree.traverseDF);
    tree.add(['Iphone','Ipad','Mac','Ipod'],'Apple',tree.traverseDF);
    tree.add(['book','Note'],'study',tree.traverseDF);
    tree.add(['man','woman'],'Human',tree.traverseDF);
    tree.add(['web','c++','java'],'program',tree.traverseDF);
    tree.add(['HTML','CSS','JavaScript'],'web',tree.traverseDF);

    $('tree').appendChild(tree._root.domElement);

    var print = function(node) {
        if (node) {
            console.log(node.data);
        } 
    }

    var clickData = '';

    addEvent($('traverse-BF'),'click',function(){
        tree.resetRender();
        tree.traverseBF(print);
        tree.renderTree();
    });

    addEvent($('traverse-DF'),'click',function(){
        tree.resetRender();
        tree.traverseDF(print);
        tree.renderTree();
    });

    addEvent($('search'),'click',function(){
        tree.resetRender();

        var data = $('node-data').value,
            type = $('traverse-Type').value,
            result = [];
        if (type === 'traverseBF') {
            result = tree.search(data,tree.traverseBF);
        } else {
            result = tree.search(data,tree.traverseDF);
        }

        var len = result.length;

        var endRender = function(node) {
            var ele = result[0];
            if (ele && node.data === ele.data) {
                result.shift();
                if (result.length === 0) {
                    return ['red',1,1];
                }
                else {
                    return ['red',1,0];
                }
            }
            return ['yellow',0,0];
        }

        tree.renderTree(endRender,1);
    });

    addEvent($('tree'), 'click', function() {
        tree.resetRender();
        var clicknode = event.target;
        clickData = clicknode.value;
        clicknode.setAttribute('style',"background-color: red;");
    });
}

