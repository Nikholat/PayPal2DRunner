import { _decorator, Component, tween, Vec3, UIOpacity } from 'cc';
const { ccclass } = _decorator;

@ccclass('HandAnimation')
export class HandAnimation extends Component {
    start() {
        const uiOpacity = this.getComponent(UIOpacity) || this.addComponent(UIOpacity);
        
        // Циклическое мигание и легкое масштабирование
        tween(this.node)
            .repeatForever(
                tween()
                    .to(0.5, { scale: new Vec3(1.2, 1.2, 1) })
                    .to(0.5, { scale: new Vec3(1, 1, 1) })
            )
            .start();

        tween(uiOpacity)
            .repeatForever(
                tween()
                    .to(0.5, { opacity: 100 })
                    .to(0.5, { opacity: 255 })
            )
            .start();
    }
}