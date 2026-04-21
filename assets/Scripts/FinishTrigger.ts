import { _decorator, Component, Collider2D, IPhysics2DContact } from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('FinishTrigger')
export class FinishTrigger extends Component {

    @property(GameManager)
    gameManager: GameManager = null!;

    onLoad() {
        const collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on('onBeginContact', this.onBeginContact, this);
        }
    }

    private onBeginContact(self: Collider2D, other: Collider2D) {
        if (other.node.name === 'Player') {
            this.gameManager.win();
        }
    }
}