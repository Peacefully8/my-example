function Mine(tr, td, mineNum) {
    this.tr = tr; //行数
    this.td = td; //列数
    this.mineNum = mineNum; //雷的数量

    this.squares = []; //存储所有方块的信息，它是一个二维数组。按行与列的顺序排放，存取都使用行列形式
    this.tds = []; //存储所有单元格的DOM对象
    this.surplusMine = mineNum; //剩余的雷的数量
    this.allRight = true; //右击的小红旗是否全是雷，用来判断游戏是否成功

    this.parent = document.getElementsByClassName("gameBox")[0];
    this.mineNumDom = document.getElementsByClassName("mineNum")[0];
}

Mine.prototype.init = function () {
    this.createDom();
    // console.log(this.randomNum());
    var rn = this.randomNum(); //得到雷所在的位置
    var n = 0; //记录遍历的位置
    for (var i = 0; i < this.tr; i++) {
        this.squares[i] = [];
        for (var j = 0; j < this.td; j++) {
            if (rn.indexOf(n++) != -1) {
                //是雷
                this.squares[i][j] = {
                    type: "mine",
                    x: j,
                    y: i
                }
            } else {
                this.squares[i][j] = {
                    type: "number",
                    x: j,
                    y: i,
                    value: 0
                }
            }
        }
    }
    // console.log(this.squares);
    this.parent.oncontextmenu = function () {
        return false;
    }
    this.mineNumDom.innerHTML = this.surplusMine;
    this.updateNum();
}

//生成n个随机数
Mine.prototype.randomNum = function () {
    var square = new Array(this.tr * this.td);
    for (var i = 0; i < square.length; i++) {
        square[i] = i;
    }
    square.sort(function () {
        return 0.5 - Math.random();
    })
    return square.slice(0, this.mineNum);
}

//创建表格
Mine.prototype.createDom = function () {
    var This = this;
    var table = document.createElement("table");
    for (var i = 0; i < this.tr; i++) {
        var domTr = document.createElement("tr");
        this.tds[i] = [];
        for (var j = 0; j < this.td; j++) {
            var domTd = document.createElement("td");

            domTd.pos = [i, j]; //把格子对应的行与列存到格子身上，为了下面通过这个值去数组里取到相应的值
            domTd.onmousedown = function (event) {
                This.play(event, this);
            }
            this.tds[i][j] = domTd;
            // 展示结果
            // if (this.squares[i][j].type === "mine") {
            //     domTd.className = "mines";
            // } else {
            //     domTd.innerHTML = this.squares[i][j].value;
            // }
            domTr.appendChild(domTd);
        }
        table.appendChild(domTr);
    }
    this.parent.innerHTML = "";
    this.parent.appendChild(table);
}

//找到某个方块周围的八个方块
Mine.prototype.getAround = function (square) {
    var result = []; //把找到的格子的坐标返回出去（二维数组）
    var x = square.x;
    var y = square.y;
    /*
            x-1,y-1      x,y-1       x+1,y-1
            x-1,y        x,y         x+1,y
            x-1,y+1      x,y+1       x+1,y+1
    */
    //通过坐标循环九宫格
    for (var i = x - 1; i <= x + 1; i++) {
        for (var j = y - 1; j <= y + 1; j++) {
            if (i < 0 || i > this.td - 1 || j < 0 || j > this.tr - 1 || (i == x && j == y) || this.squares[j][i].type === "mine") {
                continue;
            }
            result.push([j, i]); //要以行和列的形式返回出去，因为到时需要用它去取数组里面的数据
        }
    }
    return result;
}

//更改数字
Mine.prototype.updateNum = function () {
    for (var i = 0; i < this.tr; i++) {
        for (var j = 0; j < this.td; j++) {
            if (this.squares[i][j].type === "number") {
                continue;
            }
            var num = this.getAround(this.squares[i][j]);
            // console.log(num);
            for (var k = 0; k < num.length; k++) {
                this.squares[num[k][0]][num[k][1]].value += 1;
            }
        }
    }
    // console.log(this.squares);
}

Mine.prototype.play = function (evt, obj) {
    var This = this;
    if (evt.button === 0 && obj.className !== "redFlag") { //限制右键标小红旗就不能左键点击了
        // console.log(obj);
        var curSquare = this.squares[obj.pos[0]][obj.pos[1]];
        // console.log(curSquare);
        var cl = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight"];
        if (curSquare.type === "number") {
            //点到了数字
            obj.innerHTML = curSquare.value;
            obj.className = cl[curSquare.value];
            if (curSquare.value === 0) {
                //用户点到了零
                /* 
                    1.显示自己
                    2.找四周
                        1.显示四周（如果四周的值不为零，就显示到这里，不需要再找了）
                        2.如果值为零
                            1.显示自己
                            2.显示四周（如果四周的值不为零，就显示到这里，不需要再找了）
                */
                obj.innerHTML = "";

                function getAllZero(square) {
                    var around = This.getAround(square); //找到了周围的n个格子
                    for (var i = 0; i < around.length; i++) {
                        var x = around[i][0];
                        var y = around[i][1];
                        This.tds[x][y].className = cl[This.squares[x][y].value];

                        if (This.squares[x][y].value === 0) {
                            //如果一某个格子为中心找到的为零，则继续以这个零继续为中心找周围（递归）
                            if (!This.tds[x][y].check) {
                                //给对应的td添加一个属性，这条属性用于决定这个格子有没有被找到过，如果找过的话，就设置为true，下次就不用再找了
                                This.tds[x][y].check = true;
                                getAllZero(This.squares[x][y]);
                            }
                        } else {
                            This.tds[x][y].innerHTML = This.squares[x][y].value;
                        }
                    }
                }
                getAllZero(curSquare);
            }
        } else {
            //点到了雷
            this.gameOver(obj);
        }
    }
    if (evt.button === 2) {
        //鼠标点击了右键
        if (obj.className && obj.className !== "redFlag") {
            return;
        }
        if (!obj.count) {
            obj.className = "redFlag";
            obj.count = 1;
        } else {
            obj.className = "";
            obj.count = null;
        }
        if (this.squares[obj.pos[0]][obj.pos[1]].type === "mine" && this.allRight !== false) {
            this.allRight = true;
        } else {
            this.allRight = false;
        }
        if (obj.className === "redFlag") {
            this.mineNumDom.innerHTML = --this.surplusMine;
        } else {
            this.mineNumDom.innerHTML = ++this.surplusMine;
        }
        if (this.surplusMine === 0) {
            if (this.allRight) {
                alert("真厉害，游戏成功！");
            } else {
                alert("很遗憾，游戏失败");
                this.gameOver();
            }
        }
    }
}

Mine.prototype.gameOver = function (clickTd) {
    /*
        1.显示所有的雷
        2.取消所有格子的点击事件
        3.给点中的雷加个红
    */
    for (var i = 0; i < this.tr; i++) {
        for (var j = 0; j < this.td; j++) {
            if (this.squares[i][j].type === "mine") {
                this.tds[i][j].className = "mines";
            }
            this.tds[i][j].onmousedown = null;
        }
    }
    if (clickTd) {
        clickTd.className = "minesClick";
    }
}

var buttons = document.getElementsByTagName("button");
var mine = null; //生成实例
var ln = 0; //按钮状态
var arr = [
    [9, 9, 10],
    [16, 16, 40],
    [28, 28, 99]
];
for (let i = 0; i < buttons.length; i++) {
    buttons[i].onclick = function () {
        ln = i;
        for(var j=0; j < buttons.length; j++){
            buttons[j].className = "";
        }
        buttons[i].className = "active";
        mine = new Mine(...arr[i]);
        mine.init();
    }
}
buttons[0].onclick();   //默认是初始状态
buttons[3].onclick = function(){
    buttons[0].className=buttons[1].className=buttons[2].className= "";
    this.className = "active";
    mine.init();
}