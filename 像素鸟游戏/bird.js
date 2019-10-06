var game = {
    dom: document.getElementsByClassName("game")[0],
    overDom: document.getElementsByClassName("over")[0],
    scoreDom: document.getElementsByClassName("score")[0],
    isPause: true, //是否是暂停的
    isOver: false, //是否是结束的
    start: function () {
        sky.timer.start();
        land.timer.start();
        bird.timerSwing.start();
        bird.timerDrop.start();
        pipeManger.timerProduce.start();
        pipeManger.timerMove.start();
        text.timer.start();
        this.isPause = false;
    },
    stop: function () {
        sky.timer.stop();
        land.timer.stop();
        bird.timerSwing.stop();
        bird.timerDrop.stop();
        pipeManger.timerProduce.stop();
        pipeManger.timerMove.stop();
        text.timer.stop();
        this.isPause = true;
    }
};
game.width = game.dom.clientWidth;
game.height = game.dom.clientHeight;

//天空对象
var sky = {
    dom: document.getElementsByClassName("sky")[0],
    left: 0
};

sky.timer = getTimer(32, sky, function () {
    this.left -= 1;
    if (this.left === -game.width) {
        this.left = 0;
    }
    this.dom.style.left = this.left + "px";
});
//大地对象
var land = {
    dom: document.getElementsByClassName("land")[0],
    left: 0,
};
land.top = game.height - land.dom.clientHeight;

land.timer = getTimer(16, land, function () {
    this.left -= 1;
    if (this.left === -game.width) {
        this.left = 0;
    }
    this.dom.style.left = this.left + "px";
});

//鸟对象
var bird = {
    dom: document.getElementsByClassName("bird")[0],
    swingStatas: 0,
    top: 150,
    left: 150,
    height: 20,
    width: 28,
    /*
        物理模型：小鸟的初速度v=0，加速度a=0.002，移动的时间t=16
        向上跳是速度为-0.5
    */
    v: 0,
    a: 0.002,
    t: 40,
    show() {
        if (this.swingStatas === 0) {
            this.dom.style.backgroundPosition = "0 1px";
        } else if (this.swingStatas === 1) {
            this.dom.style.backgroundPosition = "0 -18px";
        } else {
            this.dom.style.backgroundPosition = "0 -38px";
        }
        this.dom.style.top = this.top + "px";
    },
    setTop(newTop) {
        if (newTop < 0) {
            newTop = 0;
        }
        if (newTop > land.top - bird.height) {
            newTop = land.top - bird.height;
        }
        this.top = newTop;
        this.show();
    },
    jump() {
        this.v = -0.4
    }
};


bird.timerSwing = getTimer(100, bird, function () {
    this.swingStatas++;
    if (this.swingStatas === 3) {
        this.swingStatas = 0;
    }
    this.show();
});

bird.timerDrop = getTimer(bird.t, bird, function () {
    //改变小鸟的top值
    //1.求小鸟移动的距离
    var dis = this.v * this.t + 0.5 * this.a * this.t ** 2;
    //2.t时间后小鸟的速度
    this.v = this.v + this.a * this.t;
    this.setTop(this.top + dis);
});

//管道生成(单个管子)
function Pipe(direction, height) {
    this.left = game.width;
    this.top = 0;
    this.height = height;
    this.width = Pipe.width;
    this.dom = document.createElement("div");
    this.dom.className = "pipe " + direction;
    this.dom.style.left = this.left + "px";
    this.dom.style.width = Pipe.width + "px";
    this.dom.style.height = this.height + "px";
    if (direction === "up") {
        this.dom.style.top = 0;
    } else {
        this.top = land.top - this.height;
        this.dom.style.top = this.top + "px";
    }
    game.dom.appendChild(this.dom);
};
Pipe.width = 30;
// var pipe = new Pipe("up" ,220);
// var pipe1 = new Pipe("down" ,100);

//生成管子对
function PipePair() {
    var minHeight = 100;
    var gap = 95;
    var maxHeight = land.top - minHeight - gap;
    this.upHeight = getRandom(minHeight, maxHeight);
    this.downHeight = land.top - this.upHeight - gap;
    this.up = new Pipe("up", this.upHeight);
    this.down = new Pipe("down", this.downHeight);
};

//管子管理器对象
var pipeManger = {
    space: []
};

//生成成对的管道定时器
pipeManger.timerProduce = getTimer(1200, pipeManger, function () {
    var pipePair = new PipePair();
    this.space.push(pipePair);
});

//管道移动定时器
pipeManger.timerMove = getTimer(16, pipeManger, function () {
    for (var i = 0; i < this.space.length; i++) {
        this.space[i].up.left -= 2;
        this.space[i].down.left = this.space[i].up.left;
        if (this.space[i].up.left < -Pipe.width) {
            this.space[i].up.dom.remove();
            this.space[i].down.dom.remove();
            this.space.splice(i, 1);
            i--;
        } else {
            this.space[i].up.dom.style.left = this.space[i].up.left + "px";
            this.space[i].down.dom.style.left = this.space[i].up.left + "px";
        }
    }
})

//鉴定是否碰撞
var text = {
    validata: function () {
        // 1.小鸟是否落地了
        if (bird.top >= land.top - bird.height) {
            return true;
        }
        // 2.小鸟是否与管道碰撞了（矩形碰撞）
        for (var i = 0; i < pipeManger.space.length; i++) {
            var pipe = pipeManger.space[i];
            if (this.validataBirdAndPipe(pipe.up) || this.validataBirdAndPipe(pipe.down)) {
                return true;
            }
        }
        return false;
    },
    validataBirdAndPipe: function (pipe) {
        // 判断相撞：
        // 横纵坐标的中心点坐标相减的绝对值是否小于两则自身款高度相加的一半

        var birdX = bird.left + bird.width / 2;
        var birdY = bird.top + bird.height / 2;
        var pipeX = pipe.left + pipe.width / 2;
        var pipeY = pipe.top + pipe.height / 2;
        if ((Math.abs(birdX - pipeX) <= (bird.width + pipe.width) / 2) && (Math.abs(birdY - pipeY) <= (bird.height + pipe.height) / 2)) {
            return true;
        } else {
            return false;
        }
    }
}
//开始计时器，每时每刻检查一次
text.timer = getTimer(16, text, function () {
    if (this.validata()) {
        game.overDom.style.display = "block";
        game.stop();
        game.isOver = true;
    }
    for (var i = 0; i < pipeManger.space.length; i++) {
        var pipe = pipeManger.space[i];
        if (bird.left > pipe.up.left + Pipe.width) {
            if (!pipe.up.check) {
                game.scoreDom.innerHTML = +game.scoreDom.innerHTML + 1;
            }
            pipe.up.check = true;
        }

    }
});



/**
 * 可以取到最大值
 * @param {*} min 最小值
 * @param {*} max 最大值
 */
function getRandom(min, max) {
    return Math.floor(Math.random() * (max + 1 - min) + min);
}


function getTimer(duration, thisPoint, callback) { //得到一个计时器，返回一个对象，里面有开始和停止方法
    var timer;
    return {
        start: function () {
            if (!timer) {
                timer = setInterval(callback.bind(thisPoint), duration);
            }
        },
        stop: function () {
            clearInterval(timer);
            timer = null;
        }
    }
}


window.onkeypress = function (e) {
    if (e.key === "Enter") {
        if (this.game.isOver) {
            location.reload();
            return;
        }
        if (game.isPause) {
            game.start();
        } else {
            game.stop();
        }
    }
    if (e.key === " ") {
        bird.jump();
    }
}