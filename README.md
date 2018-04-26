# 这是一个指尖大冒险的Phaser版本

------

前些天看了一篇很赞的文章：https://aotu.io/notes/2017/11/28/h5_game_jumping/，又因为想学习phaser，所以有了这个案例，在线预览可以点下方链接。
本案例中，核心原理是按文章中所提到的内容制作，整体遵循“大道至简”的原则开发，其实是懒的去封装模块。。。


### [在线预览](www.winqee.com/backup/phaser1)


------

## 关键技术点

除去上面提到的文章中的技术点外，还有几处需要注意的地方：

##### 1. 元素渲染层级
开发时候不注意的话，某些情况下可能会出现后面的装饰物，被前面的挡住，或者是机器人被石头挡住等尴尬的局面。对此，不同的框架不同的处理方式，以phaser为例，使用sort及分组来进行处理
```javascript
stoneStopFlagGroup.sort('y',Phaser.Group.SORT_ASCENDING);
```
```javascript
//普通阶梯组
stonesGroup = game.add.group();

//阻碍阶梯组
stoneStopGroup = game.add.group();

//装饰组
stoneStopFlagGroup = game.add.group();

//全局组，包括robot，各种阶梯，装饰
groupItem = game.add.group();
```

##### 2. 行走动画
看素材里，原本是有这段动画的，也就是sprite中的0-9帧，但原案例中不知什么原因去掉了，这里我重新加上了这部分动画。
重新加上后，就有了行走与跳跃动画切换的问题，如何调整使得动作连贯不突兀，就需要使用不同框架的童鞋自行研究了。
phaser中，尝试出来的最连贯的写法
```javascript
robot.animations.stop('walk',20,false);
robot.animations.play('stand',30,false);
robot.animations.play('jump',30,false);
```

##### 3. 断点续传
其实就是一开始只加载数量不多的阶梯，然后随着进度加多加多再加多，达到玩不完的效果
此处要注意结合渲染层级，保证后续添加进来的阶梯能正确的绘制，而不会挡住机器人。
```javascript
function randomNum(num){
    //无阻碍阶梯数组
    stoneRandomNum = stoneRandomNum.concat(utils.createRandomArr(num,2,0));
    //阻碍阶梯数组
    stoneRandomNum2 = stoneRandomNum2.concat(utils.getRandomPool(num,3));
    //阻碍阶梯装饰品
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
```

## 问题

代码中的阶梯掉落处理比较耗费资源，有想法的童鞋可以给点优化建议
```javascript
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
```
