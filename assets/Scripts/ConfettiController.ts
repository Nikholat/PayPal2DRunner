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
    randomRangeInt,
    Tween
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
    piecesPerBurst: number = 14;

    @property
    burstCount: number = 3;

    @property
    burstInterval: number = 0.18;

    @property
    minScale: number = 0.45;

    @property
    maxScale: number = 0.9;

    @property({
        tooltip: 'Horizontal travel as percent of layer width'
    })
    minTravelXRatio: number = 0.25;

    @property({
        tooltip: 'Horizontal travel as percent of layer width'
    })
    maxTravelXRatio: number = 0.55;

    @property({
        tooltip: 'Up travel as percent of layer height'
    })
    minTravelYRatio: number = 0.35;

    @property({
        tooltip: 'Up travel as percent of layer height'
    })
    maxTravelYRatio: number = 0.75;

    @property({
        tooltip: 'Fall distance as percent of layer height'
    })
    minFallYRatio: number = 0.45;

    @property({
        tooltip: 'Fall distance as percent of layer height'
    })
    maxFallYRatio: number = 0.85;

    @property
    spawnRandomOffset: number = 30;

    @property
    fallRandomX: number = 80;

    @property
    minDuration: number = 0.9;

    @property
    maxDuration: number = 1.4;

    @property
    minRotation: number = 180;

    @property
    maxRotation: number = 720;

    private isPlaying: boolean = false;
    private layerTransform: UITransform | null = null;

    onLoad() {
        this.layerTransform = this.getComponent(UITransform);
    }

    public play(): void {
        if (this.isPlaying) return;
        if (!this.confettiPrefab || this.confettiFrames.length === 0) return;

        this.isPlaying = true;

        for (let i = 0; i < this.burstCount; i++) {
            this.scheduleOnce(() => {
                this.spawnBurst(true);
                this.spawnBurst(false);

                if (i === this.burstCount - 1) {
                    this.scheduleOnce(() => {
                        this.isPlaying = false;
                    }, this.maxDuration * 2);
                }
            }, i * this.burstInterval);
        }
    }

    private spawnBurst(isLeft: boolean): void {
        const spawnNode = isLeft ? this.leftSpawn : this.rightSpawn;
        if (!spawnNode || !this.confettiPrefab || this.confettiFrames.length === 0) return;

        const layerSize = this.getLayerSize();
        const width = layerSize.x;
        const height = layerSize.y;

        const minTravelX = width * this.minTravelXRatio;
        const maxTravelX = width * this.maxTravelXRatio;

        const minTravelY = height * this.minTravelYRatio;
        const maxTravelY = height * this.maxTravelYRatio;

        const minFallY = height * this.minFallYRatio;
        const maxFallY = height * this.maxFallYRatio;

        for (let i = 0; i < this.piecesPerBurst; i++) {
            const piece = instantiate(this.confettiPrefab);
            this.node.addChild(piece);

            const sprite = piece.getComponent(Sprite);
            if (sprite) {
                sprite.spriteFrame = this.confettiFrames[randomRangeInt(0, this.confettiFrames.length)];
            }

            const start = this.getLocalPositionInLayer(spawnNode);

            start.x += randomRange(-this.spawnRandomOffset, this.spawnRandomOffset);
            start.y += randomRange(-this.spawnRandomOffset, this.spawnRandomOffset);

            piece.setPosition(start);

            const scale = randomRange(this.minScale, this.maxScale);
            piece.setScale(new Vec3(scale, scale, 1));

            const dirX = isLeft ? 1 : -1;

            const peakPos = new Vec3(
                start.x + dirX * randomRange(minTravelX, maxTravelX),
                start.y + randomRange(minTravelY, maxTravelY),
                0
            );

            const endPos = new Vec3(
                peakPos.x + randomRange(-this.fallRandomX, this.fallRandomX),
                peakPos.y - randomRange(minFallY, maxFallY),
                0
            );

            const upDuration = randomRange(this.minDuration, this.maxDuration);
            const fallDuration = upDuration * 0.8;
            const rotation = dirX * randomRange(this.minRotation, this.maxRotation);

            Tween.stopAllByTarget(piece);

            tween(piece)
                .parallel(
                    tween().to(upDuration, { position: peakPos }, { easing: 'quadOut' }),
                    tween().by(upDuration, { angle: rotation })
                )
                .call(() => {
                    tween(piece)
                        .parallel(
                            tween().to(fallDuration, {
                                position: endPos,
                                scale: new Vec3(scale * 0.85, scale * 0.85, 1)
                            }, { easing: 'quadIn' }),
                            tween().by(fallDuration, { angle: rotation * 0.65 })
                        )
                        .call(() => {
                            piece.destroy();
                        })
                        .start();
                })
                .start();
        }
    }

    private getLayerSize(): Vec3 {
        const uiTransform = this.layerTransform || this.getComponent(UITransform);

        if (!uiTransform) {
            return new Vec3(720, 1280, 0);
        }

        return new Vec3(uiTransform.width, uiTransform.height, 0);
    }

    private getLocalPositionInLayer(target: Node): Vec3 {
        const uiTransform = this.layerTransform || this.getComponent(UITransform);

        if (!uiTransform) {
            return target.position.clone();
        }

        const local = new Vec3();
        uiTransform.convertToNodeSpaceAR(target.worldPosition, local);
        return local;
    }
}