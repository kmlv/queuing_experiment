import {html,PolymerElement} from '/static/otree-redwood/node_modules/@polymer/polymer/polymer-element.js';
import '/static/otree-redwood/node_modules/@polymer/polymer/lib/elements/dom-repeat.js';
import '../polymer-elements/iron-flex-layout-classes.js';
import '../polymer-elements/paper-progress.js';
import '../polymer-elements/paper-radio-button.js';
import '../polymer-elements/paper-radio-group.js';

import '/static/otree-redwood/src/redwood-decision/redwood-decision.js';
import '/static/otree-redwood/src/redwood-period/redwood-period.js';
import '/static/otree-redwood/src/redwood-decision-bot/redwood-decision-bot.js';
import '/static/otree-redwood/src/otree-constants/otree-constants.js';

import '../color.js';

export class LeepsQueue extends PolymerElement {
    static get template() {
        return html `
            <style include="iron-flex iron-flex-alignment"></style>
            <style>
                .borders{
                    border-style: solid;
                }

                .circle{
                    border-radius:50%;
                    text-align: center;
                }
            </style>
            <otree-constants id="constants"></otree-constants>
            <redwood-period
                running="{{ _isPeriodRunning }}"
                on-period-start="_onPeriodStart"
                on-period-end="_onPeriodEnd">
            </redwood-period>
            <redwood-decision
                
            </redwood-decision>

            <div class="layout vertical center">
                <div class="layout horizontal borders" style="width: 25%;">
                    <template is="dom-repeat" index-as="index" items="{{queueList}}" as="queueList">
                        <div class="circle">[[ _array(queueList, index) ]]</div>
                    </template>
                </div>

                <div class="layout horizontal" style="width: 75%;">
                    <div class="layout vertical borders" style="width: 33%;">
                        <template is="dom-repeat" index-as="index" items="{{requests}}" as="requests">
                        </template>
                    </div>

                    <div class="layout vertical" style="width: 66%;">
                        <div class="layout vertical borders" style="width: 40%;">
                            <p>Your Decision</p>
                            <p>Player you want to exchange position:</p>
                            <p>Your offer</p>
                            <button type="button"> Send your request</button>
                        </div>

                        <div class="layout horizontal" style="width: 60%;">
                            <div class="layout vertical borders" style="width: 50%;">
                                <p>1st in the line:</p>
                                <p>2nd in the line:</p>
                                <p>3rd in the line:</p>
                                <p>4th in the line:</p>
                                <p>5th in the line:</p>
                                <p>6th in the line:</p>
                            </div>
                        

                            <div class="layout vertical borders " style="width: 50%;">
                                <p>Your current payoff: [[ payoff ]]</p>
                                <p>Round parameter:</p>
                                <p>Exchange rule:[[swapMethod]]</p>
                                <p>Messaging:[[messaging]]</p>
                            </div>

                        </div>

                    </div>
                </div>

            </div>
        
        `
    }

    static get properties() {
        return {
            groupDecisions: {
                type: Object,
            },
            myDecision: {
                type: Number,
            },
            messaging:{
                type: Boolean,
            },
            payoff: {
                type: Number,
            },
            queueList: {
                type: Array,
            },
            swapMethod: {
                type: String
            },
            requests: {
                type: Array,
            },
        }
    }

    _array(a, i) {
        return a[i];
    }

    ready() {
        super.ready()
        
    }

    _onPeriodStart() {
        this._subperiodProgress = 0;
        this.lastT = performance.now();
        this._animID = window.requestAnimationFrame(
            this._updateSubperiodProgress.bind(this));
    }
    _onPeriodEnd() {
        window.cancelAnimationFrame(this._animID);
        this._subperiodProgress = 0;
    }
}

window.customElements.define('leeps-queue', LeepsQueue);