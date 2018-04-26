(function(){
    var size = {width:window.innerWidth,height:window.innerHeight};
    var game = new Phaser.Game(size.width * 2, size.height * 2, Phaser.AUTO, 'phaser');
    var start = false;
    var states = {};
    //全局组，包括robot，各种阶梯，装饰
    var groupItem;
    //阻碍阶梯组
    var stoneStopGroup;
    //阻碍阶梯装饰组
    var stoneStopFlagGroup;
    //树叶组
    var bullets;
    //普通阶梯组
    var stones;
    //无阻碍台阶数组
    var stoneArr = [];
    //阻碍台阶数组
    var stoneStopArr = [];
    //装饰数组
    var stoneStopFlagArr = [];
    //机器人
    var robot;
    //机器人跳跃动画
    var robotJump;
    //机器人行走动画
    var robotWalk;
    //机器人停止动画
    var robotStand;
    //机器人坐标记录
    var robotX;
    var robotY;
    //树移动控制阈
    var treemove = false;
    //当前位置
    var currentPos = 0;
    //鼠标按下
    var touchdown = false;
    //机器人行走控制
    var shouldRobotWalk = true;
    //手指按下后方向
    var fingerD;
    //分数
    var score = 0;
    //游戏开始与否
    var start = false;
    //游戏结束与否
    var over = false;
    //创建无阻碍阶梯数组，0代表在上一级阶梯的左边，1代表在上一级阶梯的右边
    var stoneRandomNum = [];
    //创建阻碍阶梯数组，0代表没有，1代表在上一级阶梯上方一格，2代表在上一级阶梯上方两格
    var stoneRandomNum2 = [];
    //创建阻碍阶梯装饰品
    var stoneRandomFlag = [];
    //控制点击间隔
    var clickStep = 100;
    var clickTime = 0 ;
    //石头掉下的时间
    var stoneDropStep = 800;

    var utils = {
        getRandom: function(min, max) {
            return Math.floor(Math.random() * (max - min) + min)
        },
        createRandomArr:function(len,max,min){
            // 生成指定长度的0、1随机数数组
            var arr = [];
            for(var i = 0 ; i < len ; i++){
                arr.push(utils.getRandom(min,max));
            }
            return arr;
        },
        getRandomPool:function(len){
            var arr = [];
            for(var i = 0 ; i < len ; i++){
                var rnum = Math.floor(Math.random() * (10 - 0) + 0);
                if(rnum < 3){
                    arr.push(1);
                }else if(rnum < 7){
                    arr.push(0);
                }else if(rnum < 9){
                    arr.push(2);
                }else{
                    arr.push(3);
                }
            }
            return arr;
        },
        getPathName:function(){
            var pn = window.location.pathname;
            var pnArr = pn.split('/');
            var newArr = [];
            for(var i=0;i<pnArr.length;i++){
                if(pnArr[i] && pnArr[i].indexOf('html') == -1){
                    newArr.push(pnArr[i]);
                }
            }
            return newArr.length > 0 ? '/' + newArr.join('/') : '';
        }
    }

    states.load = {
        preload: function() {
            game.scale.pageAlignHorizontally = true;
            game.scale.pageAlignVertically = true;
            game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            var path = utils.getPathName();
            game.load.image('leafLeft', path + '/dist/images/leaf_left.png');
            game.load.image('leafRight', path + '/dist/images/leaf_right.png');
            game.load.atlas('spritestairs', path + '/dist/images/spritestairs.png', path + '/dist/images/spritestairs.json');
            game.load.spritesheet('robot', path + '/dist/images/spriterobot.png', 150, 294, 17);

            game.load.onFileComplete.add(function(progress) {
                document.querySelector('.curr_process').style.width = progress + '%';
                if(progress == 100){
                    setTimeout(function(){
                        document.getElementById('J_loadLayer').style.display = 'none';
                        document.getElementById('J_Layer').style.display = 'block';
                        document.getElementById('J_startLayer').className = 'jumping_alert in';
                    },500);
                    game.state.start('play');
                }
            });
            randomNum(20);
        }
    }


    states.play = {
        create: function() {
            create();
        },
        update: function() {
            update();
        }
    }

    function create() {
        //创建第一颗阶梯
        stoneCreateFirst();

        //创建无阻碍阶梯
        stoneCreate(stoneRandomNum);

        //创建阻碍阶梯
        stoneStopCreate(stoneRandomNum,stoneRandomNum2);

        //创建机器人
        robotCreate();

        //创建两边的树叶
        TreeCreate();
    }

    function randomNum(num){
        stoneRandomNum = stoneRandomNum.concat(utils.createRandomArr(num,2,0));
        stoneRandomNum2 = stoneRandomNum2.concat(utils.getRandomPool(num,3));
        stoneRandomFlag = stoneRandomFlag.concat(utils.createRandomArr(num,6,1));
    }

    function addRandomNum(num){
        var len = stoneRandomNum.length;
        randomNum(num);
        //创建无阻碍阶梯
        stoneCreate(stoneRandomNum,len);
        //创建阻碍阶梯
        stoneStopCreate(stoneRandomNum,stoneRandomNum2,len);
    }

    function update() {
        TreeMove(6);
        stoneStopFlagGroup.sort('y',Phaser.Group.SORT_ASCENDING);
    }


    function reset(){
        randomNum();
        stoneArr = [];
        stoneStopArr = [];
        stoneStopFlagArr = [];
        start = false;
        over = false;
        currentPos = 0;
        score = 0;
        document.querySelector('.score').innerHTML = 0;
    }

    //创建机器人
    function robotCreate(){
        robot = game.add.sprite(0, 0, 'robot', 1);
        robot.anchor.set(0.5);
        robotX = robot.x = game.world.centerX;
        robotY = robot.y = stoneArr[0].y - 75;
        robot.scale.x = -getRobotDirection();
        robotWalk = robot.animations.add('walk',[0,1,2,3,4,5,6,7,8,9],60,true);
        robotStand = robot.animations.add('stand',[16],60,true);
        robotJump = robot.animations.add('jump',[10,11,12,13,14,15,16],60,true);
        game.input.touch.onTouchStart = onTouchStart;
        robotJump.onComplete.add(function(){
            robot.animations.play('walk',30,true);
            shouldRobotWalk = true;
            if(!checkRobotSuccess(fingerD)){
                gameoverFun();
            }
        }, this);
        groupItem.addChild(robot);
    }


    function onTouchStart(e) {
        if(over){
            return false;
        }
        if(!start){
            start = true;
            //掉落阶梯
            dropStone(currentPos);
        }

        //控制连点
        var ct = new Date().getTime();
        if(ct - clickTime < 100){
            return false;
        }
        clickTime = ct;

        //跳跃动画
        shouldRobotWalk = false;
        robot.animations.stop('walk',20,false);
        robot.animations.play('stand',30,false);
        robot.animations.play('jump',30,false);

        //移动方向
        currentPos ++;
        fingerD = getFingleDirection(e);
        var robotDis = robotMoveDistance(fingerD);
        robotX = robotX + robotDis.x;
        robotY = robotY + robotDis.y;
        game.add.tween(robot).to( { x:robotX,y:robotY },220, Phaser.Easing.Linear.None).start();
        robot.scale.x = -fingerD;

        //掉落阶梯
        dropStone(currentPos);

        //画面移动
        game.add.tween(groupItem).to( { x:groupItem.x - robotDis.x,y:groupItem.y - robotDis.y },250, Phaser.Easing.Linear.None).start();
        treemove = true;

        //判断点击时的方向是否正确，否则停止游戏，但最终播放动画在另一处
        if(checkRobotSuccess(fingerD)){
            score ++ ;
            document.querySelector('.score').innerHTML = score;
        }else{
            over = true;
        }

        //创建新阶梯
        if(currentPos % 10 == 0){
            addRandomNum(10);
        }

        setTimeout(function(){
            treemove = false;
        },250)
    }

    //阶梯掉落处理
    function dropStone(pos){
        (function(){
            setTimeout(function(){
                    if(currentPos == pos){
                        gameoverFun();
                    }
                    var stone = stoneArr[pos];
                    game.add.tween(stone).to( { x:stone.x,y:stone.y + game.height },stoneDropStep, Phaser.Easing.Quadratic.In).start();
                    for(var i=0;i<stoneStopArr.length;i++){
                        if(stoneStopArr[i] && (stoneStopArr[i].y == stone.y)){
                            game.add.tween(stoneStopArr[i]).to( { x:stoneStopArr[i].x,y:stoneStopArr[i].y + game.height },stoneDropStep, Phaser.Easing.Quadratic.In).start();
                            game.add.tween(stoneStopFlagArr[i]).to( { x:stoneStopFlagArr[i].x,y:stoneStopFlagArr[i].y + game.height },stoneDropStep, Phaser.Easing.Quadratic.In).start();
                        }
                    }
            },500);
        })(pos);
    }

    //游戏结束处理
    function gameoverFun(){
        //掉下去
        game.add.tween(robot).to( { x:robot.x,y:robot.y + game.height },stoneDropStep, Phaser.Easing.Quadratic.In).start();
        over = true;
        document.getElementById('J_restarLayer').className = 'jumping_alert in';
    }


    //检查机器人跳跃是否成功
    function checkRobotSuccess(direction) {
        if(stoneArr[currentPos].direction == direction){
            return true;
        }else{
            return false;
        }
    }

    //机器人移动到下一个阶梯的距离
    function robotMoveDistance(direction){
        return {
            x: direction * stoneArr[0].width / 2,
            y: - (stoneArr[0].height - 26)
        };
    }

    //获取机器人朝向
    function getRobotDirection(type){
        var currStone = stoneArr[currentPos];
        if(type == 'curr'){
            return currStone.direction;
        }else{
            var nextStone;
            if(stoneArr.length >= currentPos + 1){
                nextStone = stoneArr[currentPos + 1];
                var direction = nextStone.direction;
                return direction;
            }
        }
        return 1;
    }

    //获取手指点击的方向
    function getFingleDirection(e){
        var x = e.changedTouches[0].clientX;
        if(x > game.world.centerX / 2){
            return 1;
        }else{
            return -1;
        }
    }

    //创建两边的树叶
    function TreeCreate(){
        bullets = game.add.group();
        var bullet11 = game.add.image(0, 0, 'leafLeft');
        var bullet12 = game.add.image(0, -bullet11.height, 'leafLeft');
        var bullet21 = game.add.image(0, 0, 'leafRight');
        var bullet22 = game.add.image(0, -bullet11.height, 'leafRight');

        bullet21.x = bullet22.x = game.width - Math.ceil(bullet21.width);
        bullets.y = -bullet12.height + game.height;

        bullets.addChild(bullet11);
        bullets.addChild(bullet21);
        bullets.addChild(bullet12);
        bullets.addChild(bullet22);

        bullets.z = 100;
    }

    //树叶移动
    function TreeMove(transY){
        if(!treemove)
            return false;

        //获取滑动后的新位置，transY是滑动偏移量
        bullets.y += transY;
        if(bullets.y > game.height){
            bullets.y = -(bullets.children[0].height - game.height);
        }
    }

    //第一颗台阶
    function stoneCreateFirst(){
        //普通阶梯组
        stonesGroup = game.add.group();

        //阻碍阶梯组
        stoneStopGroup = game.add.group();

        //装饰组
        stoneStopFlagGroup = game.add.group();

        //全局组，包括robot，各种阶梯，装饰
        groupItem = game.add.group();

        groupItem.addChild(stonesGroup);
        groupItem.addChild(stoneStopGroup);
        groupItem.addChild(stoneStopFlagGroup);

        var stone1 = game.add.sprite(0, 0, 'spritestairs', 'stone.png');
        stone1.x = game.world.centerX - stone1.width / 2;
        stone1.y = game.height / 2 +  stone1.height;
        stonesGroup.addChild(stone1);
        stoneArr.push(stone1);
    }

    //创建无阻碍阶梯
    function stoneCreate(rm,pos){
        if(!pos) pos = 0;
        for(var i=pos;i<rm.length;i++){
            var tempPos = {
                x:0,
                y:0
            };

            var direction = rm[i] ? 1 : -1;

            tempPos = {
                x:stoneArr[i].x + direction * (stoneArr[i].width / 2),
                y:stoneArr[i].y - (stoneArr[i].height - 26)
            };
            var temp = game.add.sprite(tempPos.x, tempPos.y, 'spritestairs', 'stone.png');
            temp.direction = direction;
            stonesGroup.addChild(temp);
            stoneArr.push(temp);
        }
    }

    //创建阻碍阶梯
    function stoneStopCreate(rm,num,pos){
        if(!pos) pos = 0;
        for(var i=pos;i<rm.length;i++){
            if(num[i]){
                var direction = -(rm[i] ? 1 : -1);
                var tempPos = {
                    x:0,
                    y:0
                };
                //起始的阶梯
                var stone = stoneArr[i];

                tempPos.x = stone.x + direction * (stone.width / 2) * num[i],
                tempPos.y = stone.y - (stone.height - 26) * num[i];

                var temp = game.add.sprite(tempPos.x, tempPos.y, 'spritestairs', 'stone.png');
                stoneStopGroup.addChild(temp);
                stoneStopArr.push(temp);

                var beauty = game.add.sprite(tempPos.x, tempPos.y - stone.height / 2, 'spritestairs', 'flag' + stoneRandomFlag[i] + '.png');
                stoneStopFlagGroup.addChild(beauty);
                stoneStopFlagArr.push(beauty);
            }else{
                stoneStopArr.push(null);
                stoneStopFlagArr.push(null);
            }
        }
    }


    function init(){
        game.state.add('load', states.load);
        game.state.add('play', states.play);
        game.state.start('load');

        document.getElementById('J_startBtn').onclick = function(){
            document.getElementById('J_startLayer').className = 'jumping_alert out';
            setTimeout(function(){
                document.getElementById('J_Layer').style.display = 'none';
            },500);
        };

        document.getElementById('J_restartBtn').onclick = function(){
            reset();
            document.getElementById('J_restarLayer').className = 'jumping_alert out';
            game.state.start('play');
        };
    }

    init();

})();
