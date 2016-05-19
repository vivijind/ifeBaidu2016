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

    // 节点相关操作
    this.expand = true;    // 是否展开
    this.highlight = false; // 是否高亮

    // tree关联dom结点
    this.domElement = document.createElement('ul'); // 访问对应的DOM结点
    var str = "<li class=' expand ' data-level='";
    str += this.level + "'><i class='show-icon'></i>" + this.data + 
        "<i class='add-icon  dispear '></i><i class='delete-icon  dispear '></i></li>";
    this.domElement.innerHTML = str;
    // 对应dom关联到children节点
    this.domElement.treeNode = this;
}
// 树
function Tree(data) {
    var node = new TreeNode(data);
    this._root = node;
}
// 树的方法
Tree.prototype = {
    constructor: Tree,

    traverseDF: function(callback) {
        (function recurse(currentNode) {
            for (var i = 0, node; node = currentNode.child[i]; i ++) {
                recurse(node);
            }

            callback(currentNode);
        })(this._root);
    },
    traverseBF: function(callback) {
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
    // 针对值进行操作查找
    search: function(data,traverse,callback) {
        var result = [];
        traverse.call(this, function(node){
            if(node.data === data) {
                result.push(node);
                if (callback) {
                    callback(node);
                }
            }
        });
        return result;
    },
    /**
     * 给树增加结点，将data增加到toData结点下，针对数据值进行添加
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
                var parent = result[j],
                    child = new TreeNode(nodeData);
                parent.child.push(child);
                child.parent = parent;
                parent.expand = true;

                //dom结点添加
                parent.domElement.appendChild(child.domElement);
            }
        }
    },
    /**
     * 删除树结点，将fromData下的data均删除，针对数据值进行删除
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
    // 对节点的操作，增加
    addToNode: function(data, node) {
        var child = new TreeNode(data);
        node.child.push(child);
        child.parent = node;
        node.expand = true;

        //dom结点添加
        node.domElement.appendChild(child.domElement);
    },
    // 对节点的操作，删除
    removeNode: function(node) {
        var index = node.parent.child.indexOf(node);
        node.parent.child.splice(index,1);
        // dom节点删除
        node.domElement.parentNode.removeChild(node.domElement);
    },
    renderTree: function() {
        // 深度遍历节点，绘制
        var str = "";
        (function recurse(currentNode) {
            if (!currentNode) {
                return;
            }
            var liNode = currentNode.domElement.children[0];
            if (currentNode.child.length === 0) {
                liNode.className = liNode.className.replace(" expand ","");
                if (currentNode.level !== 0) {
                    liNode.children[0].className = liNode.children[0].className.replace(" dispear ","");
                    liNode.children[0].className += " dispear ";
                }
                else {
                    liNode.children[0].className = liNode.children[0].className.replace(" dispear ","");
                }
            } else {
                liNode.children[0].className = liNode.children[0].className.replace(" dispear ","");
            }
            if (currentNode.expand) {
                liNode.className = liNode.className.replace(" expand ","");
                liNode.className += " expand ";
                for (var j = 1,tempEle; tempEle = currentNode.domElement.children[j]; j++) {
                    tempEle.setAttribute("class","");
                }
            }
            else {
                for (var j = 1,tempEle; tempEle = currentNode.domElement.children[j]; j++) {
                    tempEle.setAttribute("class"," dispear ");
                }
                liNode.className = liNode.className.replace(" expand ","");
            }
            if (currentNode.highlight) {
                liNode.className = liNode.className.replace(" highlight ","");
                liNode.className += " highlight ";
            } else {
                liNode.className = liNode.className.replace(" highlight ","");
            }
            // 遍历查找其子元素
            for (var i = 0, node; node = currentNode.child[i]; i ++) {
                recurse(node);
            }
        })(this._root);
    },
    resetHighlight: function(){
        this.traverseBF(function(node){
            node.highlight = false;
        });
    }
}

window.onload = function (){
    // 构建树
    var tree = new Tree('走在前端的路上');
    tree.add(['前端技能栈','听说你要做前端啦'],'走在前端的路上',tree.traverseDF);
    tree.add(['HTML','CSS','Javascript'],'前端技能栈',tree.traverseDF);

    $('tree').appendChild(tree._root.domElement);

    tree.renderTree();

    addEvent($('search'),'click',function(){
        tree.resetHighlight();

        var highlightNode = function(node) {
            node.highlight = true;
            var tempNode = node.parent;
            while(tempNode) {
                tempNode.expand = true;
                tempNode = tempNode.parent;
            } 
        }
        var data = $('search-value').value,
            result = tree.search(data,tree.traverseBF,highlightNode);

        tree.renderTree();
    });

    addEvent($('tree'), 'click', function() {
        var event = arguments[0] || window.event,
            target = event.target || event.srcElement;
        if (target && target.tagName === 'I' && target.className.indexOf("add-icon") !== -1) {
            var data = prompt("请输入要添加的节点值：");
            if (data) {
                tree.addToNode(data, target.parentNode.parentNode.treeNode);
            }
            else {
                alert("没有输入啊亲~");
            }
        }
        if (target && target.tagName === 'I' && target.className.indexOf("delete-icon") !== -1) {
            tree.removeNode(target.parentNode.parentNode.treeNode);
        }
        if (target && target.tagName === 'I' && target.className.indexOf("show-icon") !== -1) {
            target.parentNode.parentNode.treeNode.expand = !target.parentNode.parentNode.treeNode.expand;
        }
        if (target && target.tagName === 'LI') {
            target.parentNode.treeNode.expand = !target.parentNode.treeNode.expand;
        }

        tree.renderTree();
    });

    addEvent($('tree'), 'mouseover', function() {
        var event = arguments[0] || window.event,
            target = event.target || event.srcElement;
        if (target && target.tagName === 'LI') {
            target.children[1].className = target.children[1].className.replace(" dispear ","");
            if (target.parentNode.treeNode.parent) {    // 对非根节点进行操作
                target.children[2].className = target.children[2].className.replace(" dispear ","");
            }
        }
    });

    addEvent($('tree'), 'mouseout', function() {
        var event = arguments[0] || window.event,
            target = event.target || event.srcElement;
        if (target && target.tagName === 'LI') {
            target.children[1].className = target.children[1].className.replace(" dispear ","");
            target.children[1].className += " dispear ";
            if (target.parentNode.treeNode.parent) {    // 对非根节点进行操作
                target.children[1].className = target.children[1].className.replace(" dispear ","");
                target.children[2].className += " dispear ";
            } 
        }
    });
}

