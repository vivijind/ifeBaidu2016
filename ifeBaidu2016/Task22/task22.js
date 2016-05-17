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

var treeEle = $('tree').firstElementChild;
var treeList = [];

//前序遍历
function preOrder(node) {
    if (node) {
        treeList.push(node);
        preOrder(node.firstElementChild); 
        preOrder(node.lastElementChild);
    }
}

//中序遍历
function inOrder(node) {
    if (node) {
        inOrder(node.firstElementChild);
        treeList.push(node);
        inOrder(node.lastElementChild);
    }
}

function postOrder(node) {
    if (node) {
        postOrder(node.firstElementChild); 
        postOrder(node.lastElementChild );
        treeList.push(node);
    }
}

function renderTree() {
    var changePos = 0;
    var timmer = setInterval(render,500);
    function render() {
        for(var i=0,node; node = treeList[i]; i++) {
            if (i < changePos) {
                node.setAttribute('style', 'background-color: white;');
            }
            else {
                node.setAttribute('style', 'background-color: pink;');
                for(var j=0,nodetemp; nodetemp = node.children[j]; j++) {
                    nodetemp.setAttribute('style', 'background-color: white;');
                }
                changePos ++;
                break;
            }
        }
    }
}

window.onload = function (){
    addEvent($('preorder'),'click',function(){
        treeList = [];
        preOrder(treeEle);
        renderTree();
    });

    addEvent($('inorder'),'click',function(){
        treeList = [];
        inOrder(treeEle);
        renderTree();
    });

    addEvent($('postorder'),'click',function(){
        treeList = [];
        postOrder(treeEle);
        renderTree();
    });
}

