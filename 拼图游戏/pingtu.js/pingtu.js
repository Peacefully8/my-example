var gameConfig = {
    width: 500,
    height: 500,
    rows: 3, //行数
    cols: 3, //列数
    imgurl: "imags/1.jpg", //图片路径
    dom: document.getElementById("game"),
};
//每一块的宽高
gameConfig.pieceWidth = gameConfig.width / gameConfig.cols;
gameConfig.pieceHeight = gameConfig.height / gameConfig.rows;
//小块的数量
gameConfig.pieceNum = gameConfig.rows * gameConfig.cols;
// console.log(gameConfig);
var blocks = []; //存储每一个小块的信息，里面是对象
var wrong=gameConfig.pieceNum-1; //图片位置错误的个数,假定默认全部错
/**
 * 初始化游戏
 */
function init() {
    //1.初始化游戏的容器
    initGameDom();
    //2.初始化小块信息
    initBlockInfo();
    //3.打乱建立的小块数组，并显示到页面
    shuffle();
    //4.注册点击事件
    regEvent();


    /**
     * 注册点击事件
     */
    function regEvent() {
        //找到没有显示的div
        var noDisplay = blocks.find(function (items) {
            return items.domBlock.style.display === "none";
        })
        // console.log(noDisplay);
        for (let i = 0; i < blocks.length; i++) {
            blocks[i].domBlock.onclick = function () {
                if(wrong === 0){
                    return;
                }
                //判断什么时候交换
                /*
                          left top
                    空白    0   0
                    相邻1   w   0
                    相邻2   0   h
                    总结：left值相等，top值相隔一个小块的高度；top值相等，left相隔一个小块的宽度
                */
                //点击的div与没有显示的div交换位置
                if (noDisplay.left === blocks[i].left && Math.abs(noDisplay.top - blocks[i].top) === gameConfig.pieceHeight ||
                    noDisplay.top === blocks[i].top && Math.abs(noDisplay.left - blocks[i].left) === gameConfig.pieceWidth) {
                changePosition(noDisplay, blocks[i]);
                isWin();
                }
            }
        }
    }
    /**
     * 游戏是否结束
     */
    function isWin() {
        wrong = 9;
        blocks.forEach(function(items){
            if(items.left===items.correctLeft&&items.top===items.correctTop){
                wrong--;
            }
        })
        if(wrong === 0){
            blocks.forEach(function(items){
                items.domBlock.style.display = "block";
                items.domBlock.style.border = "none";
            })
        }
    }

    /**
     * 数组洗牌
     */
    function shuffle() {
        //1.循环数组,随机产生一个下标
        //2.将当前项的left和top值与随机的进行交换(不与最后一项交换)
        for (var i = 0; i < blocks.length - 1; i++) {
            var index = getRandom(0, gameConfig.pieceNum - 1);
            changePosition(blocks[index], blocks[i]);
        }
    }

    function changePosition(b1, b2) {
        var tempLeft = b1.left;
        var tempTop = b1.top;
        b1.left = b2.left;
        b1.top = b2.top;
        b2.left = tempLeft;
        b2.top = tempTop;
        blocks.forEach(function (items) {
            items.show();
        })
    }
    /**
     * 
     * @param {*} min 最小值
     * @param {*} max 最大值，取不到最大
     */
    function getRandom(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }




    /**
     * 初始话小块的信息
     */
    function initBlockInfo() {
        for (var i = 0; i < gameConfig.rows; i++) {
            for (var j = 0; j < gameConfig.cols; j++) {
                /*
                    w:每个小块的宽度
                    h:每个小块的高度
                    i   j   left    top
                    0   0   0       0
                    1   0   0       h
                    0   1   w       0
                    1   1   w       h
                    2   2   2w      2h
                    i   j   j*w     i*h
                */
                var isVisible = true;
                if (i === gameConfig.rows - 1 && j === gameConfig.cols - 1) {
                    isVisible = false;
                }
                blocks.push(new Block(j * gameConfig.pieceWidth, i * gameConfig.pieceHeight, isVisible));
            }
        }
        // console.log(blocks); 
    }

    /**
     * 小块的构造函数
     * @param{*} left
     * @param{*} top
     * @param{*} isVisible 是否可见
     */
    function Block(left, top, isVisible) {
        this.left = left;
        this.top = top;
        this.correctLeft = this.left; //正确位置的left值
        this.correctTop = this.top; //正确位置的top值

        this.domBlock = document.createElement("div");
        this.domBlock.style.width = gameConfig.pieceWidth + "px";
        this.domBlock.style.height = gameConfig.pieceHeight + "px";
        this.domBlock.style.position = "absolute";
        this.domBlock.style.background = `url("${gameConfig.imgurl}") no-repeat -${this.correctLeft}px -${this.correctTop}px`;
        this.domBlock.style.border = "1px solid #ccc";
        this.domBlock.style.boxSizing = "border-box";
        this.domBlock.style.cursor = "pointer";
        this.domBlock.style.transition = "all .5s";
        if (!isVisible) {
            this.domBlock.style.display = "none";
        }
        gameConfig.dom.appendChild(this.domBlock);
        this.show = function () {
            this.domBlock.style.left = this.left + "px";
            this.domBlock.style.top = this.top + "px";
        }
        this.show();

    }

    /**
     * 初始化游戏的容器
     */
    function initGameDom() {
        gameConfig.dom.style.width = gameConfig.width + "px";
        gameConfig.dom.style.height = gameConfig.height + "px";
        gameConfig.dom.style.border = "1px solid #ccc";
        gameConfig.dom.style.position = "relative";
    }
}

init();