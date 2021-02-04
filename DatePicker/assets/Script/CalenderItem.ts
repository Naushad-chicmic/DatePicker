// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

interface calenderItemProperties {
    text            :   string,
    selectionStatus :   boolean,
    itemOpacity     :   number,
    date?           :   Date,
};

@ccclass
export default class CalenderItem extends cc.Component {
    text            :   string      =   "";
    selectionStatus :   boolean     =   false;
    currentDate     :   Date        =   null;
    monthCounter    :   number      =   null;

    @property(cc.Label)
    title           :   cc.Label    =   null;

    initialiseItemWithValue(props:calenderItemProperties) : void {
        this.text               =   props.text;
        this.title.string       =   props.text;
        this.selectionStatus    =   props.selectionStatus;
        this.currentDate        =   props.date;

        this.node.getChildByName("Background").active =   props.selectionStatus;

        if(this.selectionStatus && (this.currentDate.toDateString() == new Date().toDateString())) {
            this.node.getChildByName("Background").active =   false;
            this.title.node.color = cc.color(100, 250, 50, 24);
        }
        this.title.node.opacity =   props.itemOpacity;
    }

    getSelectedDate() : Date {
        return this.currentDate;
    }
}
