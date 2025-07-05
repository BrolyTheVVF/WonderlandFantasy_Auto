//Fix SpriteClip class destroy function not properly deleting the children array
var SpriteClipParent = Object.getPrototypeOf(SpriteClip.prototype);
SpriteClip.prototype.destroy = function(...args){
    if(this.__timer){
        clearTimeout(this.__timer);
        this.__timer = false;
    }
    for(let i = 0; i < SpriteClip.children.length; i++){
        if(SpriteClip.children[i] && SpriteClip.children[i].__index === this.__index){
            SpriteClip.children.splice(i, 1);
            break;
        }
    }
    // delete SpriteClip.children[this.__index];
    this.autoAnimate = false;
    this.active = false;
    this.visible = false;
    SpriteClipParent.destroy.apply(this, args);
}

//Fix the Particle class not properly calling it's children destroy functions
var ParticleParent = Object.getPrototypeOf(Particle.prototype);
Particle.prototype.destroy = function(...args){
    this.active = false;
    this.visible = false;
    clearTimeout(this.__TO);
    if(this.sound){
        this.sound.destroy();
        this.sound = false;
    }
    
	if(this && this.C2){
		for(let i = this.C2.length; i >= 0; i--){
			if(!this.C2[i]){
				continue;
			}
			this.C2[i].destroy();
			this.C2.splice(i, 1);
		}
	}
    delete Particle.list[this.__id];
    ParticleParent.destroy.apply(this, args);
    //super.destroy();
}


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