/**
 * Created by liulei on 2016/5/12.
 */
/**
 *
 * var data = {
        initDate : [2016,9,1], //初始化日期，默认设备日期
        limitDate : [1988,2017], //日期上下限，默认1970~2099
        callBack : function (date) {  //点击日期回调函数，返回当前点击的date对象
            //console.log(date)
        },
        parent : document.body  //日历组件要添加到的元素节点，默认body
   };
   var calender = new Calendar(data);  // 实例化一个日历组件
   calender.setDate(2008,8,8)  //用于外部设置日历日期
 */
function Calendar(obj) {
    var _this = this;
    //获取初始日期
    this.today = !!obj.initDate ? new Date(obj.initDate[0],obj.initDate[1]-1,obj.initDate[2]) : new Date();
    this.limitDate = !!obj.limitDate ? obj.limitDate : [1970,2099];
    //初始化临时日期；用于日期切换
    this.tempDate = new Date(this.today);
    var parent = obj.parent || document.body;
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
            tbody = document.createElement("tbody");
        var _calenderNodes = {
            theadNodes : {},
            tbodyNodes : []
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
        for(var i = 0 ; i < 6; i++){
            var tr = document.createElement("tr");
            for (var j = 0 ; j < 7; j++){
                var td = document.createElement("td"),
                    div = document.createElement("div");
                td.appendChild(div);
                tr.appendChild(td);
                _calenderNodes.tbodyNodes.push(div);
            }
            tbody.appendChild(tr)
        }
        table.className = "calendarJs";
        table.appendChild(thead);
        table.appendChild(tbody);
        parent.appendChild(table);
        _calenderNodes.tbody = tbody;
        return _calenderNodes;
    }());
    var yearNode = calenderNodes.theadNodes.current.firstChild.firstChild || calenderNodes.theadNodes.current.firstElementChild.firstElementChild,
        monthNode = calenderNodes.theadNodes.current.childNodes[2].firstChild || calenderNodes.theadNodes.current.lastElementChild.firstElementChild;
    //渲染日历
    var renderCalender = function (allData) {
        var data = allData.data,
            year = allData.today.year,
            month = allData.today.month;
        yearNode.childNodes[year - _this.limitDate[0]].selected = "selected";
        monthNode.childNodes[month - 1].selected = "selected";
        for (var i = 0; i < calenderNodes.tbodyNodes.length; i++){
            calenderNodes.tbodyNodes[i].innerHTML = data[i].data;
            calenderNodes.tbodyNodes[i].className = data[i].className;
        }
    };
    eventHandler(calenderNodes.theadNodes.pre,"click",function () {
        if(_this.tempDate.getFullYear() == _this.limitDate[0] - 1) return;
        _this.tempDate.setMonth(_this.tempDate.getMonth()-1);
        if(_this.tempDate.getFullYear() == _this.limitDate[0] - 1) return;
        renderCalender(getMonthData(_this.tempDate))
    });
    eventHandler(calenderNodes.theadNodes.next,"click",function () {
        if(_this.tempDate.getFullYear() == _this.limitDate[1] + 1) return;
        _this.tempDate.setMonth(_this.tempDate.getMonth()+1);
        if(_this.tempDate.getFullYear() == _this.limitDate[1] + 1) return;
        renderCalender(getMonthData(_this.tempDate))
    });
    eventHandler(yearNode,"change",function () {
        var e = event || window.event;
        _this.tempDate.setFullYear(e.target.value);
        renderCalender(getMonthData(_this.tempDate))
    });
    eventHandler(monthNode,"change",function () {
        var e = event || window.event;
        _this.tempDate.setMonth(e.target.value-1);
        renderCalender(getMonthData(_this.tempDate))
    });
    eventHandler(calenderNodes.tbody,"click",function (event) {
            var e = event || window.event;
        if(/calender-currentMonth/.test(e.target.className)){
            _this.tempDate.setDate(e.target.innerHTML);
            if (obj.callBack) obj.callBack(_this.tempDate)
        }
    });
    renderCalender(getMonthData(this.today));
    //设置日期
    this.setDate = function (year,month,day) {
        this.today.setFullYear(year);
        this.today.setMonth(month - 1);
        this.today.setDate(day);
        this.tempDate.setFullYear(year);
        this.tempDate.setMonth(month -1);
        this.tempDate.setDate(day);
        renderCalender(getMonthData(this.today))
    }
}
