import { _decorator, Component, Node, view } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BannerSwitcher')
export class BannerSwitcher extends Component {

    @property(Node)
    public portraitBanner: Node | null = null;

    @property(Node)
    public landscapeBanner: Node | null = null;

    private isLandscape: boolean = false;

    update(): void {
        const size = view.getVisibleSize();
        const newIsLandscape = size.width > size.height;

        // если не изменилось — ничего не делаем
        if (this.isLandscape === newIsLandscape) return;

        this.isLandscape = newIsLandscape;

        if (this.portraitBanner) {
            this.portraitBanner.active = !this.isLandscape;
        }

        if (this.landscapeBanner) {
            this.landscapeBanner.active = this.isLandscape;
        }
    }
}