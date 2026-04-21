import { _decorator, Component, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SimpleSpriteAnim')
export class SimpleSpriteAnim extends Component {
    @property([SpriteFrame])
    frames: SpriteFrame[] = []; // Твой массив из 8 кадров бега

    @property
    animationFPS: number = 12; // Скорость бега (кадров в секунду)

    private sprite: Sprite = null!;
    private timer: number = 0;
    private frameIndex: number = 0;

    start() {
        this.sprite = this.getComponent(Sprite)!;
        if (this.frames.length > 0) {
            this.sprite.spriteFrame = this.frames[0];
        }
    }

    update(dt: number) {
        if (this.frames.length <= 1) return;

        this.timer += dt;

        // Вычисляем, пора ли менять кадр
        if (this.timer >= 1 / this.animationFPS) {
            this.timer = 0;
            
            // Инкремент индекса с закольцовкой (Modulo)
            this.frameIndex = (this.frameIndex - 1 + this.frames.length) % this.frames.length;
            
            // Прямая замена ресурса в компоненте
            this.sprite.spriteFrame = this.frames[this.frameIndex];
        }
    }

    // Метод для остановки, если врезался
    stopAnimation() {
        this.enabled = false;
    }
}