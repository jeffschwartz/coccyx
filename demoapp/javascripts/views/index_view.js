define(["coccyx"], function(Coccyx){
    return {
        name: "indexView",
        render: function(){
            var html = this.$("#index-page").html(),
                common = Coccyx.userspace.common;
            common.setMenuItemActive("/");
            this.$("#content").html(html);
        }
    }
});