/**
 * Created by liulei on 2016/5/12.
 */
/**
var data = {
    initDate : [2016,9,1], //初始化日期，默认设备日期<br>
    limitDate : [1988,2017], //日期上下限，默认1970~2099<br>
    duration : true, // 为true，点击选择一天，为false选择时间段，默认false<br>
    limitDuration : [2,5], //日期可选上下线，默认最小2天，最大1个月<br>
    limitCallBack : function (a) {  //选择时间段超出范围回调函数，返回1或-1，1高于最大值，-1小于最小值<br>
},
okCallBack : function (a,b){  //确定按钮回调函数，返回两个值，a:{year:[firstYear,lastYear],month:[……],day:[……]}，b:成功选取日期段返回"success"
},
callBack : function (date) {  //点击日期回调函数，返回当前点击的date对象<br>
    //console.log(date)<br>
},
parent : document.body  //日历组件要添加到的元素节点，默认body<br>
};
var calender = new Calendar(data);  // 实例化一个日历组件<br>
calender.setDate(2008,8,8)  //用于外部设置日历日期<br>
*/


function Calendar(obj) {
    var _this = this;
    //获取初始日期
    this.today = !!obj.initDate ? new Date(obj.initDate[0],obj.initDate[1]-1,obj.initDate[2]) : new Date();
    this.limitDate = !!obj.limitDate ? obj.limitDate : [1970,2099];
    //初始化临时日期；用于日期切换
    this.tempDate = new Date(this.today);
    this.duration = obj.duration || false;
    this.limitDuration = obj.limitDuration || [2,33];
    var parent = obj.parent || document.body;
    var currentClickTimes = 0;
    var durationData = {
        getMin : function (key) {
            return Math.min(this.firstDate[key],this.lastDate[key])
        },
        getMax : function (key) {
            return Math.max(this.firstDate[key],this.lastDate[key])
        }
    };
    var currentMonthData;
    //事件兼容
    var eventHandler = function(target,type,func){
        if(target.addEventListener){
            target.addEventListener(type, func, false);
        }else if(target.attachEvent){
            target.attachEvent("on" + type, func);
        }else{
            target["on" + type] = func;
        }
    };
    //判断日期是否是今天
    var isToday = function (_today,today) {
        return _today.getFullYear() == today.getFullYear() && _today.getMonth() == today.getMonth() && _today.getDate() == today.getDate();
    };
    //获取当月所有数据以及前后月补齐数据
    var getMonthData = function(initDate){
        var today = new Date(initDate),
            data = [];
        var preTodayDate  = today.getDate(),
            preDate = new Date(initDate),
            week;
        var nextTodayDate  = today.getDate() + 1,
            nextDate = new Date(initDate);
        while (preTodayDate > 0){
            var week = preDate.getDay();
            var className = week == 0 || week == 6 ? "calender-currentMonth calender-holiday" : "calender-currentMonth";
            className += isToday(_this.today,preDate) ? " calender-today" : "";
            data.unshift({
                data : preDate.getDate(),
                date : {
                    year : preDate.getFullYear(),
                    month : preDate.getMonth()+1,
                    date : preDate.getDate(),
                    week : week
                },
                className : className
            });
            preTodayDate--;
            preDate.setDate(preTodayDate);
        }
        week = preDate.getDay();
        preTodayDate = preDate.getDate();
        while (week != 6){
            data.unshift({
                data : preDate.getDate(),
                date : {
                    year : preDate.getFullYear(),
                    month : preDate.getMonth()+1,
                    date : preDate.getDate(),
                    week : preDate.getDay()
                },
                className : "calender-preMonth"
            });
            preTodayDate--;
            preDate.setDate(preTodayDate);
            week = preDate.getDay();
        }
        nextDate.setDate(nextTodayDate);
        while (nextTodayDate != 1){
            var week = nextDate.getDay();
            var className = week == 0 || week == 6 ? "calender-currentMonth calender-holiday" : "calender-currentMonth";
            className += isToday(_this.today,preDate) ? " calender-today" : "";
            data.push({
                data : nextDate.getDate(),
                date : {
                    year : nextDate.getFullYear(),
                    month : nextDate.getMonth()+1,
                    date : nextDate.getDate(),
                    week : week
                },
                className : className
            });
            nextTodayDate++;
            nextDate.setDate(nextTodayDate);
            nextTodayDate = nextDate.getDate();
        }
        while (data.length < 42){
            data.push({
                data : nextDate.getDate(),
                date : {
                    year : nextDate.getFullYear(),
                    month : nextDate.getMonth()+1,
                    date : nextDate.getDate(),
                    week : nextDate.getDay()
                },
                className : "calender-nextMonth"
            });
            nextTodayDate++;
            nextDate.setDate(nextTodayDate);
            nextTodayDate = nextDate.getDate();
        }
        return {
            data : data,
            today : {
                year : today.getFullYear(),
                month : today.getMonth()+1,
                date : today.getDate(),
                week : today.getDay()
            }
        };
    };
    var capWeekNum = {
        0 : "日",
        1 : "一",
        2 : "二",
        3 : "三",
        4 : "四",
        5 : "五",
        6 : "六"
    };
    //创建日历节点
    var calenderNodes = (function () {
        var table = document.createElement("table"),
            thead = document.createElement("thead"),
            tbody = document.createElement("tbody"),
            inputBox = document.createElement("div"),
            input = document.createElement("input");
        input.type = "text";
        inputBox.className = "calendarJs-input";
        inputBox.appendChild(input);
        var _calenderNodes = {
            theadNodes : {},
            tbodyNodes : [],
            input : {
                box : inputBox,
                select : input
            }
        };
        for(var i = 0 ; i < 2; i++){
            var tr = document.createElement("tr");
            for (var j = 0 ; j < 7; j++){
                if(!(i == 0 && j > 2)){
                    var th = document.createElement("th"),
                        div = document.createElement("div");
                    if(i == 0){
                        switch (j){
                            case 0:
                                div.innerHTML = "<<-";
                                _calenderNodes.theadNodes.pre = div;
                                break;
                            case 1:
                                var optionY = "",
                                    optionM = "";
                                th.colSpan = 5;
                                for (var k = _this.limitDate[0];k <= _this.limitDate[1];k++){
                                    optionY+="<option>"+k+"</option>"
                                }
                                for (var k = 1;k < 13;k++){
                                    optionM+="<option>"+k+"</option>"
                                }
                                div.innerHTML = "<span class='calender-year'><select>"+optionY+"</select></span>年<span class='calender-month'><select>"+optionM+"</select></span>月";
                                _calenderNodes.theadNodes.current = div;
                                break;
                            case 2:
                                div.innerHTML = "->>";
                                _calenderNodes.theadNodes.next = div;
                                break;
                        }
                    }else {
                        div.innerHTML = capWeekNum[j];
                        j == 0 || j == 6 ? div.className = "calender-holiday" : void(0);
                    }
                    th.appendChild(div);
                    tr.appendChild(th)
                }
            }
            thead.appendChild(tr)
        }
        for(var i = 0 ; i < 7; i++){
            var tr = document.createElement("tr");
            if(i < 6){
                for (var j = 0 ; j < 7; j++){
                    var td = document.createElement("td"),
                        div = document.createElement("div");
                    td.appendChild(div);
                    tr.appendChild(td);
                    _calenderNodes.tbodyNodes.push(div);
                }
            }else if(_this.duration == true){
                for(var j = 0 ; j < 3; j++){
                    var td = document.createElement("td"),
                        div = document.createElement("div");
                    if(j == 1){
                        td.colSpan = 3;
                        div.innerHTML = "取消";
                        div.className = "calendarJs-cancelBtn"
                    }else if(j == 2){
                        td.colSpan = 3;
                        div.innerHTML = "确定";
                        div.className = "calendarJs-okBtn"
                    }
                    td.appendChild(div);
                    tr.appendChild(td);
                    _calenderNodes.tbodyNodes.push(div);
                }
            }
            tbody.appendChild(tr)
        }
        table.className = "calendarJs";
        table.appendChild(thead);
        table.appendChild(tbody);
        _calenderNodes.tbody = tbody;
        _calenderNodes.table = table;
        parent.appendChild(inputBox);
        parent.appendChild(table);
        return _calenderNodes;
    }());
    var yearNode = calenderNodes.theadNodes.current.firstChild.firstChild || calenderNodes.theadNodes.current.firstElementChild.firstElementChild,
        monthNode = calenderNodes.theadNodes.current.childNodes[2].firstChild || calenderNodes.theadNodes.current.lastElementChild.firstElementChild;
    //渲染日历
    var renderCalender = function () {
        var allData = currentMonthData;
        var data = allData.data,
            year = allData.today.year,
            month = allData.today.month;
        yearNode.childNodes[year - _this.limitDate[0]].selected = "selected";
        monthNode.childNodes[month - 1].selected = "selected";
        for (var i = 0; i < data.length; i++){
            calenderNodes.tbodyNodes[i].innerHTML = data[i].data;
            calenderNodes.tbodyNodes[i].className = data[i].className;
        }
    };
    //为选择的日期时间段添加样式
    var addSelectClass = function () {
        var allNodes = calenderNodes.tbodyNodes;
        var index1 = allNodes.indexOf(durationData.firstNode),
            index2 = allNodes.indexOf(durationData.lastNode),
            firstIndex = Math.min(index1,index2),
            lastIndex = Math.max(index1,index2);
        var count = lastIndex - firstIndex + 1;
        if(count < _this.limitDuration[0]){
            calenderNodes.input.select.value = "";
            renderCalender();
            if(obj.limitCallBack) obj.limitCallBack(-1)
        }else if(count > _this.limitDuration[1]){
            calenderNodes.input.select.value = "";
            renderCalender();
            if(obj.limitCallBack) obj.limitCallBack(1)
        }else {
            for (var i = firstIndex + 1; i < lastIndex; i++){
                allNodes[i].className +=  " select-inner"
            }
        }
    };
    //点击日期执行
    var clickTbodyDate = function (e) {
        _this.tempDate.setDate(e.target.innerHTML);
        if(_this.duration){
            if(currentClickTimes < 2){
                currentClickTimes ++;
                switch (currentClickTimes){
                    case 1 :
                        getMonthData(_this.tempDate);
                        renderCalender();
                        durationData.firstDate = {
                            year :  _this.tempDate.getFullYear(),
                            month : _this.tempDate.getMonth(),
                            day : _this.tempDate.getDate()
                        };
                        durationData.firstNode = e.target;
                        break;
                    case 2 :
                        durationData.lastDate = {
                            year :  _this.tempDate.getFullYear(),
                            month : _this.tempDate.getMonth(),
                            day : _this.tempDate.getDate()
                        };
                        durationData.lastNode = e.target;
                        calenderNodes.input.select.value = durationData.getMin("year") + "-" + (durationData.getMin("month") +1) + "-" + durationData.getMin("day")
                            + "至" + durationData.getMax("year") + "-" + (durationData.getMax("month") + 1) + "-" + durationData.getMax("day");
                        addSelectClass();
                        currentClickTimes = 0;
                        break;
                }
            }
            e.target.className += " select";
        }else {
            calenderNodes.input.select.value = _this.tempDate.getFullYear() + "-" + (_this.tempDate.getMonth() + 1)+ "-" + _this.tempDate.getDate();
            if (obj.callBack) obj.callBack(_this.tempDate)
        }
    };
    //点击确定按钮执行
    var clickOkBtn = function () {
        if(calenderNodes.input.select.value != ""){
            calenderNodes.table.style.display = "none";
            var a = {
                year : [durationData.getMin("year"),durationData.getMax("year")],
                month : [durationData.getMin("month")+1,durationData.getMax("month")+1],
                day : [durationData.getMin("day"),durationData.getMax("day")]
            };
            obj.okCallBack ? obj.okCallBack(a,"success") : void(0);
        }else {
            obj.okCallBack ? obj.okCallBack("","error") : void(0);
        }
    };
    //点击取消按钮执行
    var clickCancelBtn = function () {
        renderCalender();
        calenderNodes.input.select.value = ""
    };
    //添加各种事件
    eventHandler(calenderNodes.theadNodes.pre,"click",function () {
        if(_this.tempDate.getFullYear() == _this.limitDate[0] - 1) return;
        _this.tempDate.setMonth(_this.tempDate.getMonth()-1);
        if(_this.tempDate.getFullYear() == _this.limitDate[0] - 1) return;
        currentMonthData = getMonthData(_this.tempDate);
        renderCalender()
    });
    eventHandler(calenderNodes.theadNodes.next,"click",function () {
        if(_this.tempDate.getFullYear() == _this.limitDate[1] + 1) return;
        _this.tempDate.setMonth(_this.tempDate.getMonth()+1);
        if(_this.tempDate.getFullYear() == _this.limitDate[1] + 1) return;
        currentMonthData = getMonthData(_this.tempDate);
        renderCalender()
    });
    eventHandler(yearNode,"change",function () {
        var e = event || window.event;
        _this.tempDate.setFullYear(e.target.value);
        currentMonthData = getMonthData(_this.tempDate);
        renderCalender()
    });
    eventHandler(monthNode,"change",function () {
        var e = event || window.event;
        _this.tempDate.setMonth(e.target.value-1);
        currentMonthData = getMonthData(_this.tempDate);
        renderCalender()
    });
    eventHandler(calenderNodes.tbody,"click",function (event) {
            var e = event || window.event;
        if(/calender-currentMonth/.test(e.target.className)){
            clickTbodyDate(e);
        }else if(/calendarJs-okBtn/.test(e.target.className)){
            clickOkBtn();
        }else if (/calendarJs-cancelBtn/.test(e.target.className)){
            clickCancelBtn();
        }

    });
    eventHandler(calenderNodes.input.box,"click",function () {
        calenderNodes.table.style.display = calenderNodes.table.style.display == "inline-block" ? "none" : "inline-block";
        calenderNodes.table.style.left = calenderNodes.input.select.offsetLeft + "px";
        calenderNodes.table.style.top = calenderNodes.input.select.offsetTop + calenderNodes.input.select.offsetHeight + "px";
    });
    eventHandler(window,"resize",function () {
        calenderNodes.table.style.left = calenderNodes.input.select.offsetLeft + "px";
        calenderNodes.table.style.top = calenderNodes.input.select.offsetTop + calenderNodes.input.select.offsetHeight + "px";
    });
    //初始化日历
    currentMonthData = getMonthData(this.today);
    renderCalender();
    //设置日期
    this.setDate = function (year,month,day) {
        this.today.setFullYear(year);
        this.today.setMonth(month - 1);
        this.today.setDate(day);
        this.tempDate.setFullYear(year);
        this.tempDate.setMonth(month -1);
        this.tempDate.setDate(day);
        currentMonthData = getMonthData(this.today);
        renderCalender()
    }
}
