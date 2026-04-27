import {
    _decorator,
    Component,
    Label,
    Node,
    Vec3,
    instantiate,
    tween,
    UITransform,
    Prefab,
    Tween
} from 'cc';
import { PraiseTextController } from './PraiseTextController';

const { ccclass, property } = _decorator;

@ccclass('MoneyManager')
export class MoneyManager extends Component {
    @property(Label)
    moneyLabel: Label = null!;

    @property(Node)
    visualContainer: Node = null!;

    @property(Node)
    flyTarget: Node = null!;

    @property(Node)
    flyLayer: Node = null!;

    @property(Prefab)
    flyPrefab: Prefab = null!;

    @property(PraiseTextController)
    praiseTextController: PraiseTextController = null!;

    @property
    flyScale: number = 0.2;

    @property
    flyArcHeight: number = 150;

    @property
    flyDuration: number = 0.7;

    public currentAmount: number = 0;

    start() {
        this.updateMoneyLabel();
    }

    public addMoney(amount: number, worldPos?: Vec3) {
        this.currentAmount += amount;

        this.updateMoneyLabel();
        this.playBounceAnimation();

        if (this.praiseTextController) {
            this.praiseTextController.tryShowRandomPraise();
        }

        if (worldPos) {
            this.spawnFlyMoney(worldPos);
        }
    }

    public getCurrentAmount(): number {
        return this.currentAmount;
    }

    private updateMoneyLabel() {
        if (!this.moneyLabel) {
            console.error('[MoneyManager] moneyLabel is null');
            return;
        }

        this.moneyLabel.string = `$${this.currentAmount}`;
    }

    private playBounceAnimation() {
        if (!this.visualContainer) return;

        Tween.stopAllByTarget(this.visualContainer);
        this.visualContainer.setScale(new Vec3(1, 1, 1));

        tween(this.visualContainer)
            .to(0.06, { scale: new Vec3(1.18, 1.18, 1) }, { easing: 'backOut' })
            .to(0.12, { scale: new Vec3(1, 1, 1) }, { easing: 'bounceOut' })
            .start();
    }

    private spawnFlyMoney(worldPos: Vec3) {
        if (!this.flyPrefab || !this.flyTarget || !this.flyLayer) return;

        const layerTransform = this.flyLayer.getComponent(UITransform);
        if (!layerTransform) {
            console.error('[MoneyManager] flyLayer has no UITransform');
            return;
        }

        const fly = instantiate(this.flyPrefab);
        this.flyLayer.addChild(fly);

        const startPos = new Vec3();
        const targetPos = new Vec3();

        layerTransform.convertToNodeSpaceAR(worldPos, startPos);
        layerTransform.convertToNodeSpaceAR(this.flyTarget.worldPosition, targetPos);

        fly.setPosition(startPos);
        fly.setScale(new Vec3(this.flyScale, this.flyScale, 1));
        fly.active = true;

        const midPos = new Vec3(
            (startPos.x + targetPos.x) * 0.5,
            Math.max(startPos.y, targetPos.y) + this.flyArcHeight,
            0
        );

        const upTime = this.flyDuration * 0.4;
        const downTime = this.flyDuration * 0.6;

        tween(fly)
            .to(upTime, {
                position: midPos,
                scale: new Vec3(this.flyScale * 1.2, this.flyScale * 1.2, 1)
            }, { easing: 'sineOut' })
            .to(downTime, {
                position: targetPos,
                scale: new Vec3(this.flyScale * 0.5, this.flyScale * 0.5, 1)
            }, { easing: 'quadIn' })
            .call(() => {
                this.playTargetPunch();
                fly.destroy();
            })
            .start();
    }

    private playTargetPunch() {
        if (!this.flyTarget) return;

        Tween.stopAllByTarget(this.flyTarget);

        const base = this.flyTarget.scale.clone();

        tween(this.flyTarget)
            .to(0.08, {
                scale: new Vec3(base.x * 1.15, base.y * 1.15, base.z)
            })
            .to(0.1, {
                scale: base
            })
            .start();
    }
}