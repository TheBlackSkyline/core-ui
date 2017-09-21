
import BaseSplitController from '../../splitEditor/controller/BaseSplitController';
import MembersSplitPanelView from '../views/MembersSplitPanelView';

export default BaseSplitController.extend({
    initialize() {
        BaseSplitController.prototype.initialize.apply(this, arguments);
        this.__fillDisplayText();

        this.channel = new Backbone.Radio.Channel();
        this.channel.on('items:select', this.selectItemsByToolbar, this);
        this.channel.on('items:search', this.selectItemsByFilter, this);
        this.channel.on('items:move', this.__onItemsMove, this);
    },

    __fillInModel() {
        const users = this.options.users;
        const groups = this.options.groups;
        const members = {};
        _.each(users, model => {
            members[model.id] = model;
        });
        _.each(groups, model => {
            members[model.id] = model;
        });

        this.model.set({
            title: this.__getFullMemberSplitTitle(),
            items: members,
            showUsers: !this.options.hideUsers,
            showGroups: !this.options.hideGroups,
            showAll: !this.options.hideUsers && !this.options.hideGroups,
            itemsToSelectText: this.options.itemsToSelectText,
            selectedItemsText: this.options.selectedItemsText,
            confirmEdit: true,
            showToolbar: true,
            searchPlaceholder: this.options.searchPlaceholder,
            emptyListText: this.options.emptyListText
        });
    },

    __fillDisplayText() {
        const members = this.model.get('items');
        const membersCount = {
            users: 0,
            groups: 0
        };

        _.each(this.options.selected, id => {
            if (members[id]) {
                membersCount[members[id].type]++;
            }
        });
        this.options.displayText = this.options.hideUsers ? '' : Core.utils.helpers.getPluralForm(membersCount.users, Localizer.get('SUITEGENERAL.FORM.EDITORS.MEMBERSPLIT.USERS')).replace('{0}', membersCount.users);
        this.options.displayText += (this.options.displayText.length > 0 ? ' ' : '');
        this.options.displayText += this.options.hideGroups ? '' : Core.utils.helpers.getPluralForm(membersCount.groups, Localizer.get('SUITEGENERAL.FORM.EDITORS.MEMBERSPLIT.GROUPS')).replace('{0}', membersCount.groups);
    },

    __getFullMemberSplitTitle() {
        if (this.options.title) {
            switch (this.options.title) {
                case 'Members':
                    return Localizer.get('PROJECT.SETTINGS.WORKSPACESTAB.MEMBERSPLITTITLE');
                case 'Performers':
                    return Localizer.get('PROCESS.PROCESSTEMPLATES.ACTIVITY.SETTINGS.TASK.USERTASK.MEMBERSPLITTITLE');
                default:
                    return this.options.title;
            }
        }
        return Localizer.get('SUITEGENERAL.FORM.EDITORS.MEMBERSPLIT.TITLE');
    },

    createView() {
        this.view = new MembersSplitPanelView({
            channel: this.channel,
            model: this.model
        });
    },

    __onItemsMove(typeFrom, typeTo, all) {
        this.moveItems(typeFrom, typeTo, all);
        this.updateMembers();
    }
});
