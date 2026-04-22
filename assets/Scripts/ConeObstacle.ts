import { _decorator, Component, Sprite, Color, tween, Tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ConeObstacle')
export class ConeObstacle extends Component {
    @property
    additionalSpeed: number = 200;

    @property
    blinkDuration: number = 0.18;

    @property
    offscreenX: number = -1500;

    private isStopped: boolean = false;
    private sprite: Sprite | null = null;

    onLoad() {
        this.sprite = this.getComponent(Sprite);
    }

    start() {
        this.startBlink();
    }

    update(dt: number) {
        if (this.isStopped) return;

        const pos = this.node.position;
        this.node.setPosition(pos.x - this.additionalSpeed * dt, pos.y, pos.z);

        if (this.node.position.x < this.offscreenX) {
            this.node.active = false;
        }
    }

    public stop() {
        this.isStopped = true;

        if (this.sprite) {
            Tween.stopAllByTarget(this.sprite);
            this.sprite.color = Color.WHITE;
        }
    }

    private startBlink() {
        if (!this.sprite) return;

        const redTint = new Color(255, 120, 120, 255);
        const normalTint = Color.WHITE;

        tween(this.sprite)
            .repeatForever(
                tween()
                    .to(this.blinkDuration, { color: redTint })
                    .to(this.blinkDuration, { color: normalTint })
            )
            .start();
    }
}