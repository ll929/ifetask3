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
       unsort:[3],  //禁止排序的列
       sortorder:"z-a",  //排序方法：升序a-z，降序z-a，默认升序
       parent:document.body  //表格的父元素，默认body
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
    var dataArr = [];
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
            key > 0 && dataArr.push(obj.tbody[key]);
        }
        var parent = obj.parent || document.body;
        _table.className +=  " table-table";
        for (var i = 0; i < _table.firstChild.childNodes.length; i++){
            obj.unsort.indexOf(i+1) == -1 ? _table.firstChild.childNodes[i].className += " sort" : void(0);
            console.log(obj.unsort.indexOf(i+1))
        }
        parent.appendChild(_table);
        return _table;
    }());
    //排序
    var sort = function (dataArr,key) {
        var isNum = !/[^\d\.]/g.test(dataArr[0][key]); //检测是否是数字
        var sortOrder = obj.sortorder || "a-z";
        switch (sortOrder){
            case "a-z":
                dataArr.sort(function (a,b) {
                    return isNum ? a[key] - b[key] : a[key].localeCompare(b[key]);
                });
                break;
            case "z-a":
                dataArr.sort(function (a,b) {
                    return isNum ? b[key] - a[key] : b[key].localeCompare(a[key]);
                });
        }
    };
    //渲染表格
    var render = function () {
        for(var i = 1 ; i <　table.childNodes.length ; i++){
            for(var j = 0 ; j <　table.childNodes[i].childNodes.length ; j++){
                table.childNodes[i].childNodes[j].innerHTML = dataArr[i-1][j]
            }
        }
    };
    //表头添加点击事件
    eventHandler(table.firstChild,"click",function (event) {
       var e = event || window.event;
        if(obj.unsort.indexOf(e.target.cellIndex+1) == -1){
            sort(dataArr,e.target.cellIndex);
            render();
        }
    });
}