import { _decorator, Component, input, Input, Vec3, Collider2D, Contact2DType, IPhysics2DContact, tween, UIOpacity } from 'cc';
import { HealthManager } from './HealthManager';
import { Obstacle } from './Obstacle';
import { GameManager } from './GameManager'; // ДОБАВЛЕНО: Импорт менеджера игры
import { CollectableItem } from './CollectableItem'; // ДОБАВЛЕНО: Импорт для сбора денег

const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {
    @property(HealthManager)
    healthManager: HealthManager = null!;

    @property(GameManager)
    gameManager: GameManager = null!; // ДОБАВЛЕНО: Ссылка на менеджер

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

    start() {
        input.on(Input.EventType.TOUCH_START, this.jump, this);

        const collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    jump() {
        // Прыгаем только если на земле, не мертвы и игра не на паузе
        if (this.isGrounded && !this.isDead) {
            this.velocityY = this.jumpForce;
            this.isGrounded = false;

            tween(this.node)
                .to(0.1, { scale: new Vec3(0.8, 1.2, 1) })
                .to(0.1, { scale: new Vec3(1, 1, 1) })
                .start();
        }
    }

    onBeginContact(self: Collider2D, other: Collider2D, contact: IPhysics2DContact | null) {
        // 1. Столкновение с зэком
        if (other.getComponent(Obstacle) && !this.isInvulnerable) {
            this.handleHit();
        }

        // 2. Сбор денег
        const collectable = other.getComponent(CollectableItem);
        if (collectable) {
            collectable.onCollect(other, self); // Вызываем логику сбора
        }
    }

    handleHit() {
        if (this.isDead) return;

        const stillAlive = this.healthManager.takeDamage(); 

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
        let pos = this.node.position;
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
        
        // Вызываем глобальный Game Over
        if (this.gameManager) {
            this.gameManager.gameOver();
        }
    }
}