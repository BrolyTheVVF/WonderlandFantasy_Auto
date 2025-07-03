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
    
    for(let i = this.C2.length; i >= 0; i--){
        if(!this.C2[i]){
            continue;
        }
        this.C2[i].destroy();
        this.C2.splice(i, 1);
    }
    delete Particle.list[this.__id];
    ParticleParent.destroy.apply(this, args);
    //super.destroy();
}
