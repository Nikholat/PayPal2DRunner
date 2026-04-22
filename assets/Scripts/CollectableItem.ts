import { _decorator, Component, Collider2D, Contact2DType } from 'cc';
import { MoneyManager } from './MoneyManager';
import { AudioManager } from './AudioManager';

const { ccclass, property } = _decorator;

@ccclass('CollectableItem')
export class CollectableItem extends Component {

    @property(AudioManager)
    audioManager: AudioManager = null!;

    @property
    value: number = 10;

    @property(MoneyManager)
    moneyManager: MoneyManager = null!;

    private isCollected: boolean = false;

    start() {
        const collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onCollect, this);
        }
    }

    onDestroy() {
        const collider = this.getComponent(Collider2D);
        if (collider) {
            collider.off(Contact2DType.BEGIN_CONTACT, this.onCollect, this);
        }
    }

    private onCollect(self: Collider2D, other: Collider2D) {
        if (this.isCollected) return;

        const isPlayer = other.getComponent('PlayerController');
        if (!isPlayer) return;

        this.isCollected = true;

        if (this.moneyManager) {
            this.moneyManager.addMoney(this.value, this.node.worldPosition);
        } else {
            console.error('[CollectableItem] moneyManager is null on', this.node.name);
        }

        if (this.audioManager) {
            this.audioManager.playCollect();
        }
        this.node.active = false;
    }
}