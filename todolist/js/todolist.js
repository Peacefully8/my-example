$(function () {
    load();
    //存储的数据格式list=[{title:"文本框的内容",done:"false"}]

    $(".add").on("keydown", function (e) {
        $(".tip").hide();
        if (e.key === "Enter") {
            if($(this).val()===""){
                $(this).siblings(".tip").show();
                setTimeout(function(){
                    $(".tip").hide();
                },2000);
                return;
            }
            //1.得到本地存储里的数据
            var localData = getData();
            //2.把localData进行更新
            localData.push({
                title: $(this).val(),
                done: false
            });
            //3.更新保存本地存储
            saveData(localData);
            // 4.渲染页面
            load();
            $(this).val("");
        };
    });

    $("ol,ul").on("click", "a", function () {
        // console.log($(this).parent().attr("data-index"));
        var data = getData();
        var i = $(this).parent().attr("data-index");
        data.splice(i, 1);
        saveData(data);
        load();
    });

    $("ol,ul").on("click", "input", function () {
        // 获取本地存储数据
        var data = getData();
        // 修改数据
        var index = $(this).parent().attr("data-index");
        data[index].done = $(this).prop("checked");
        // 保存数据到本地存储
        saveData(data);
        // 渲染页面
        load();
    })

    /**
     * 得到本地存储里的数据
     */
    function getData() {
        var data = localStorage.getItem("todolist");
        if (data !== null) {
            return JSON.parse(data);
        } else {
            return [];
        }

    }
    /**
     * 更新保存本地存储
     * @param {*} data 
     */
    function saveData(data) {
        localStorage.setItem("todolist", JSON.stringify(data));
    }
    /**
     * 渲染页面
     */
    function load() {
        var r = 0,
            d = 0; //r表示还有几件事没完成，d表示已经完成了几件事
        $("ol,ul").html("");
        //得到本地数据
        var data = getData();
        //遍历数据到页面
        $.each(data, function (index, items) {
            if (items.done) {
                $("ul").prepend(`<li data-index='${index}'><input type="checkbox" checked>
            <p>${items.title}</p>
            <a href="javascript:;"></a></li>`);
                d++;
            } else {
                $("ol").prepend(`<li data-index='${index}'><input type="checkbox">
                <p>${items.title}</p>
                <a href="javascript:;"></a></li>`);
                r++;
            }
        });
        $(".rest").html(r);
        $(".done").html(d);
    }

});