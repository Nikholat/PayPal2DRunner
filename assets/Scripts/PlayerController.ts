import {
    _decorator,
    Component,
    input,
    Input,
    Vec3,
    Collider2D,
    Contact2DType,
    IPhysics2DContact,
    tween,
    UIOpacity
} from 'cc';
import { HealthManager } from './HealthManager';
import { GameManager } from './GameManager';
import { CollectableItem } from './CollectableItem';
import { Obstacle } from './Obstacle';
import { ConeObstacle } from './ConeObstacle';
import { AudioManager } from './AudioManager';

const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {
    @property(HealthManager)
    healthManager: HealthManager = null!;

    @property(GameManager)
    gameManager: GameManager = null!;

    @property(AudioManager)
    audioManager: AudioManager = null!;

    @property
    jumpForce: number = 15;

    @property
    gravity: number = 40;

    @property
    groundY: number = -200;

    private velocityY: number = 0;
    private isGrounded: boolean = true;
    private isDead: boolean = false;
    private isInvulnerable: boolean = false;
    private canJump: boolean = false;

    start() {
        input.on(Input.EventType.TOUCH_START, this.jump, this);

        const collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    onDestroy() {
        input.off(Input.EventType.TOUCH_START, this.jump, this);

        const collider = this.getComponent(Collider2D);
        if (collider) {
            collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    public setJumpEnabled(enabled: boolean) {
        this.canJump = enabled;
    }

    jump() {

        if (!this.canJump) return;
        if (this.isGrounded && !this.isDead) {
            this.velocityY = this.jumpForce;
            this.isGrounded = false;

            tween(this.node)
                .to(0.1, { scale: new Vec3(0.8, 1.2, 1) })
                .to(0.1, { scale: new Vec3(1, 1, 1) })
                .start();

            if (this.audioManager) {
                this.audioManager.playJump();
            }
        }
    }

    onBeginContact(self: Collider2D, other: Collider2D, contact: IPhysics2DContact | null) {
        if (this.isDead) return;

        const obstacle = other.getComponent(Obstacle);
        const coneObstacle = other.getComponent(ConeObstacle);

        if ((obstacle || coneObstacle) && !this.isInvulnerable) {
            this.handleHit();
            return;
        }

        const collectable = other.getComponent(CollectableItem);
        if (collectable) {
            collectable.onCollect(other, self);
        }
    }

    handleHit() {
        if (this.isDead) return;

        const stillAlive = this.healthManager.takeDamage();

        if (this.audioManager) {
            this.audioManager.playHit();
        }

        if (!stillAlive) {
            this.die();
        } else {
            this.triggerInvulnerability();
        }
    }

    triggerInvulnerability() {
        const uiOpacity = this.getComponent(UIOpacity) || this.addComponent(UIOpacity);
        this.isInvulnerable = true;

        tween(uiOpacity)
            .to(0.1, { opacity: 100 })
            .to(0.1, { opacity: 255 })
            .union()
            .repeat(5)
            .call(() => {
                this.isInvulnerable = false;
            })
            .start();
    }

    update(dt: number) {
        if (this.isDead) return;

        this.velocityY -= this.gravity * dt;
        const pos = this.node.position;
        let nextY = pos.y + this.velocityY;

        if (nextY <= this.groundY) {
            if (!this.isGrounded) {
                this.onLanded();
            }

            nextY = this.groundY;
            this.velocityY = 0;
            this.isGrounded = true;
        }

        this.node.setPosition(pos.x, nextY, 0);
    }

    onLanded() {
        tween(this.node)
            .to(0.05, { scale: new Vec3(1.2, 0.8, 1) })
            .to(0.1, { scale: new Vec3(1, 1, 1) })
            .start();
    }

    die() {
        if (this.isDead) return;
        this.isDead = true;

        input.off(Input.EventType.TOUCH_START, this.jump, this);

        if (this.gameManager) {
            this.gameManager.gameOver();
        }
    }
}