authorize
=========

国内各大微博的authorize链接生成方法集合。原理基本一样，稍有差别。

目前支持列表：
 * 新浪微博 authorize.sina
 * 腾讯微博 authorize.tqq
 * 人人网    authorize.renren
 * 豆瓣       authorize.douban
 * 淘宝网    authorize.taobao

###用法。

var authorize=require("./../lib/index.js");

for(var i in authorize){
    console.log(authorize[i]({
        client_id:"1234567890",
        redirect_uri:"http://localhost"
    }))
}