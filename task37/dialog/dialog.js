/**
 *   var d = new Dialog;
 *   d.show({
 *        okText : 填写确定按钮文字，不写默认“确定”,
 *        cancelText : 填写取消按钮文字，不写默认“取消”,
 *        title : 弹出层标题文字,
 *        mainText : 弹出层内容,
 *        okCallback : 确定按钮回调函数,
 *        cancelCallback : 取消按钮回调函数,
 *    })
 *   d.close()//关闭弹出层
 */
function Dialog() {
    var event = false;
    var _this = this;
    var createHtmlTag = (function () {
        var c = function (tag) {
            return document.createElement(tag);
        };
        var wrap = c("div");
        wrap.className = "dialog-wrap";
        document.body.appendChild(wrap);
        var title = c("div");
        title.className = "dialog-title";
        wrap.appendChild(title);
        var main = c("div");
        main.className = "dialog-main";
        wrap.appendChild(main);
        var footer = c("div");
        footer.className = "dialog-footer";
        wrap.appendChild(footer);
        var ok = c("div");
        ok.className = "dialog-ok";
        footer.appendChild(ok);
        var cancel = c("div");
        cancel.className = "dialog-cancel";
        footer.appendChild(cancel);
        var mask = c("div");
        mask.className = "dialog-mask";
        document.body.appendChild(mask);
        return {
            mask : mask,
            wrap : wrap,
            title : title,
            main : main,
            footer : footer,
            ok : ok,
            cancel : cancel
        }
    }());
    var addInnerHtml = function (popup,obj) {
        var okText = obj.okText || "确定",
            cancelText = obj.cancelText || "取消",
            title = obj.title || "",
            mainText = obj.mainText || "";
        popup.title.innerHTML = title;
        popup.main.innerHTML = mainText;
        popup.cancel.innerHTML = cancelText;
        popup.ok.innerHTML = okText;
    };
    var addEventListener = function (popup,obj) {
        var eventHandler = function(target,type,func){
            if(target.addEventListener){
                target.addEventListener(type, func, false);
            }else if(target.attachEvent){
                target.attachEvent("on" + type, func);
            }else{
                target["on" + type] = func;
            }
        };
        var sX,sY,sWL,sWT,
            drag = false;
        eventHandler(popup.cancel,"click",cancelClick);
        eventHandler(popup.ok,"click",okClick);
        eventHandler(popup.title,"mousedown",mouseDown);
        eventHandler(popup.title,"mousemove",mouseMove);
        eventHandler(window,"mouseup",mouseUp);
        function okClick() {
            _this.close();
            obj.okCallback();
        }
        function cancelClick() {
            _this.close();
            obj.cancelCallback();
        }
        function mouseDown(e) {
            drag = true;
            sX = e.pageX;
            sY = e.pageY;
            sWL = popup.wrap.offsetLeft + popup.wrap.clientWidth/2;
            sWT = popup.wrap.offsetTop + popup.wrap.clientHeight/2;
        }
        function mouseMove(e) {
            if(drag){
                var dX = e.pageX - sX,
                    dY = e.pageY - sY,
                    eWL = sWL + dX,
                    eWT = sWT + dY;
                popup.wrap.style.left = eWL+"px";
                popup.wrap.style.top = eWT+"px";
            }
        }
        function mouseUp() {
            drag = false;
        }
    };
    this.show = function (obj) {
        if(!event){
            addEventListener(createHtmlTag,obj);
            event = true;
        }
        addInnerHtml(createHtmlTag,obj);
        document.body.style.overflow = "hidden";
        createHtmlTag.wrap.style.display = "block";
        createHtmlTag.mask.style.display = "block";
    };
    this.close = function () {
        document.body.style.overflow = "auto";
        createHtmlTag.wrap.style.display = "none";
        createHtmlTag.mask.style.display = "none";
    };
}