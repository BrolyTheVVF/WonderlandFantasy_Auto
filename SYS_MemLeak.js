//Fix some error flood
delete buff.__proto.POISON_ARROW.particles;
delete buff.__proto.ABYSS_25_POISON.particles;
delete buff.__proto.WB_KADIR_BASE_POISON.particles;
delete buff.__proto.WB_KADIR_2_POISON.particles;
delete buff.__proto.EVENT_MASQUERADE_POISON.particles;
game.on.notification = function(){};

//Try to check if this make any difference in clearing memory ? Why would pixi not properly clean itself the children of a destroyed object :o
entity.prototype.__destroy = function(){
		let self = this;
		for(let k in self.buffs){
			self.buffs[k].destroy();
		}
		for(let k in self.skins){
			if(self.skins[k] instanceof SpriteClip || self.skins[k] instanceof PIXI.Container){
				self.skins[k].destroy();
			}
			delete self.skins[k];
		}
		this.oName.destroy();
		this.oTitle.destroy();
		this.oCastBarC.destroy();
		this.oCastBarD.destroy();
		this.oHealthBarC.destroy();
		this.oHealthBarD.destroy();
		
}