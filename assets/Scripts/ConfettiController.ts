import {
    _decorator,
    Component,
    Node,
    Prefab,
    instantiate,
    Sprite,
    SpriteFrame,
    Vec3,
    tween,
    UITransform,
    randomRange,
    randomRangeInt
} from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ConfettiController')
export class ConfettiController extends Component {
    @property(Prefab)
    confettiPrefab: Prefab = null!;

    @property([SpriteFrame])
    confettiFrames: SpriteFrame[] = [];

    @property(Node)
    leftSpawn: Node = null!;

    @property(Node)
    rightSpawn: Node = null!;

    @property
    piecesPerBurst: number = 20;

    @property
    burstCount: number = 4;

    @property
    burstInterval: number = 0.18;

    @property
    minScale: number = 0.6;

    @property
    maxScale: number = 1.2;

    @property
    minTravelX: number = 180;

    @property
    maxTravelX: number = 380;

    @property
    minTravelY: number = 350;

    @property
    maxTravelY: number = 700;

    @property
    minDuration: number = 0.9;

    @property
    maxDuration: number = 1.4;

    @property
    minRotation: number = 180;

    @property
    maxRotation: number = 720;

    private isPlaying: boolean = false;

    public play(): void {
        if (this.isPlaying) return;
        this.isPlaying = true;

        for (let i = 0; i < this.burstCount; i++) {
            this.scheduleOnce(() => {
                this.spawnBurst(true);
                this.spawnBurst(false);

                if (i === this.burstCount - 1) {
                    this.scheduleOnce(() => {
                        this.isPlaying = false;
                    }, this.maxDuration);
                }
            }, i * this.burstInterval);
        }
    }

    private spawnBurst(isLeft: boolean): void {
        const spawnNode = isLeft ? this.leftSpawn : this.rightSpawn;
        if (!spawnNode || !this.confettiPrefab || this.confettiFrames.length === 0) return;

        for (let i = 0; i < this.piecesPerBurst; i++) {
            const piece = instantiate(this.confettiPrefab);
            this.node.addChild(piece);

            const sprite = piece.getComponent(Sprite);
            if (sprite) {
                sprite.spriteFrame = this.confettiFrames[randomRangeInt(0, this.confettiFrames.length)];
            }

            const start = spawnNode.position.clone();

            start.x += randomRange(-30, 30);
            start.y += randomRange(-30, 30);

            piece.setPosition(start);

            const scale = randomRange(this.minScale, this.maxScale);
            piece.setScale(new Vec3(scale, scale, 1));

            const dirX = isLeft ? 1 : -1;
            const endPos = new Vec3(
                start.x + dirX * randomRange(this.minTravelX, this.maxTravelX),
                start.y + randomRange(this.minTravelY, this.maxTravelY),
                0
            );

            const duration = randomRange(this.minDuration, this.maxDuration);
            const rotation = dirX * randomRange(this.minRotation, this.maxRotation);

            tween(piece)
                .parallel(
                    tween().to(duration, { position: endPos }, { easing: 'quadOut' }),
                    tween().by(duration, { angle: rotation })
                )
                .call(() => {
                    tween(piece)
                        .to(duration * 0.8, {
                            position: new Vec3(
                                endPos.x + randomRange(-80, 80),
                                endPos.y - randomRange(500, 800),
                                0
                            ),
                            scale: new Vec3(scale * 0.85, scale * 0.85, 1)
                        }, { easing: 'quadIn' })
                        .call(() => {
                            piece.destroy();
                        })
                        .start();
                })
                .start();
        }
    }
}