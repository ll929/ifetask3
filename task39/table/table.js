/**
 * Created by liulei on 2016/5/11.
 */

/**
*
*
   var obj = {
       tbody:{
           0:["第一列","第二列","第三列","第四列","第五列","第六列"], //表头
           1:["小明","arrewr","a1","1a",76,76.3], //表格第一行数据
           2:["王红","gqrwree","d2","2d",75,35.2],
           3:["小刚","bewrwe","b3","3b",25,95.1],
           4:["大亮","uerew","g4","4g",49,65.7],
           5:["小六","aewrwe","y5","5y",66,46.9]
       },
   };
   var a = new Table(obj);
 */

function Table(obj) {
    //兼容不同浏览器事件
    var eventHandler = function(target,type,func){
        if(target.addEventListener){
            target.addEventListener(type, func, false);
        }else if(target.attachEvent){
            target.attachEvent("on" + type, func);
        }else{
            target["on" + type] = func;
        }
    };
    //创建table元素
    var table = (function () {
        var _table = document.createElement("table");
        for (var key in obj.tbody){
            var tr = document.createElement("tr");
            for (var i = 0; i < obj.tbody[key].length; i++){
                var t;
                key == 0 ? t = document.createElement("th") : t = document.createElement("td");
                t.innerHTML = obj.tbody[key][i];
                tr.appendChild(t);
            }
            _table.appendChild(tr);
        }
        var parent = obj.parent || document.body;
        _table.className +=  " table-table";
        parent.appendChild(_table);
        return _table;
    }());
    //获取滚动条高度
    var getScrollTop = function () {
        var scrollPos;
        if (window.pageYOffset) {
            scrollPos = window.pageYOffset;
        } else if (document.compatMode && document.compatMode != 'BackCompat')
        { scrollPos = document.documentElement.scrollTop;
        } else if (document.body) {
            scrollPos = document.body.scrollTop;
        }
        return scrollPos;
    };

    var th = table.firstChild || table.firstElementChild;
    //克隆一个表头，用于固定
    var cloneThead = (function () {
        var cTable = document.createElement("table");
        cTable.className += " table-cloneTable table-table";
        cTable.appendChild(th.cloneNode(true));
        document.body.appendChild(cTable);
        return cTable;
    }());
    var setCloneTheadStyle = function () {
        var currentTh = th.firstChild || th.firstElementChild,
            currentCTh = cloneThead.firstChild.firstChild || cloneThead.firstElementChild.firstElementChild;
        cloneThead.style.left = table.offsetLeft + "px";
        while (currentCTh != undefined){
            currentCTh.style.width = currentTh.clientWidth + "px";
            currentCTh.style.height = currentTh.clientHeight + "px";
            currentTh = currentTh.nextSibling;
            currentCTh = currentCTh.nextSibling;
        }
    };
    //设置克隆表头的样式和原表头保持一致
    setCloneTheadStyle();
    //监听窗口变化事件
    eventHandler(window,"resize",setCloneTheadStyle);
    //监听滚动事件
    eventHandler(window,"scroll",function (e) {
        console.dir(th.childNodes[0]);
        getScrollTop() >= table.offsetTop && !/active/.test(cloneThead.className) ? cloneThead.className += " active" : void(0);
        getScrollTop() < table.offsetTop ? cloneThead.className = cloneThead.className.replace("active","") : void(0);
        var dY = getScrollTop() - table.offsetHeight - table.offsetTop;
        dY >= 0 ? cloneThead.style.top = -dY + "px" : cloneThead.style.top = 0;
    })
}