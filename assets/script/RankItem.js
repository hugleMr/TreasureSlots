
cc.Class({
    extends: cc.Component,

    properties: {
        bg: cc.Sprite,
        icon_rank: cc.Sprite,
        user_rank : cc.Label,
        self_rank : cc.Label,
        avatar : cc.Sprite,
        lbl_user_name : cc.Label,
        lbl_score : cc.Label,
        icon_rank_frames : [cc.SpriteFrame]
    },
    
    init : function (index,rank,url_picture,user_name,score) {
        console.log("yyy : ",index);
        if(index == 0){
            this.icon_rank.node.active = false;
            this.user_rank.node.active = false;
            this.lbl_user_name.node.active = false;

            this.self_rank.node.active = true;

            this.self_rank.string = "#" + rank;

            this.bg.node.color = cc.hexToColor("#a08d5f");
        }

        if(rank == 1 || rank == 2 || rank == 3){
            this.icon_rank.spriteFrame = this.icon_rank_frames[rank - 1];
        }else if(rank > 3){
            this.icon_rank.node.active = false;
            if(index != 0){
                this.user_rank.node.active = true;
                this.user_rank.string = rank;
            }
        }

        if(url_picture != null){
            var self = this;
            cc.loader.load({url: url_picture, type: 'png'}, function (err, texture) {
                if (err == null) {
                    self.avatar.spriteFrame = new cc.SpriteFrame(texture);
                }
            });
        }

        if(user_name != null){
            this.lbl_user_name.string = user_name;
        }

        this.lbl_score.string = score;
    }


});
