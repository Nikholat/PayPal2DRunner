import { _decorator, Component, Vec3, tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PulseAnimation')
export class PulseAnimation extends Component {
    @property
    pulseScale: number = 1.1; // Максимальный размер (1.1 = +10%)

    @property
    duration: number = 0.5; // Время одного цикла (увеличение + уменьшение)

    start() {
        this.playPulse();
    }

    playPulse() {
        // Убедимся, что масштаб сброшен в 1 перед началом
        this.node.setScale(new Vec3(1, 1, 1));

        // Рассчитываем время для одной фазы (туда)
        const halfDuration = this.duration / 2;

        tween(this.node)
            .repeatForever(
                tween()
                    // Плавно увеличиваем
                    .to(halfDuration, { scale: new Vec3(this.pulseScale, this.pulseScale, 1) }, { easing: 'quadOut' })
                    // Плавно возвращаем к оригиналу
                    .to(halfDuration, { scale: new Vec3(1, 1, 1) }, { easing: 'quadIn' })
            )
            .start();
    }
}