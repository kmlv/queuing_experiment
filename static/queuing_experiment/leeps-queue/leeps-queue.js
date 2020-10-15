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
                    padding-top:10px;
                    padding-right:10px;
                    padding-bottom:10px;
                    padding-left:10px;
                    margin-top:10px;
                    margin-right:10px;
                    margin-bottom:10px;
                    margin-left:10px;
                }

                .circle{
                    border-style: solid;
                    border-radius:50%;
                    text-align: center;
                    height: auto;
                    width: 13%;
                    margin-left:10px;
                    margin-right:10px;
                }
            </style>
            <otree-constants id="constants"></otree-constants>
            <redwood-period
                running="{{ _isPeriodRunning }}"
                on-period-start="_onPeriodStart"
                on-period-end="_onPeriodEnd">
            </redwood-period>

            <redwood-decision
                initial-decision="[[ initialDecision ]]"
                my-current-decision="{{ myDecision }}"
                group-decisions="{{ groupDecisions }}"
                on-group-decisions-changed="_onGroupDecisionsChanged"
            >
            </redwood-decision>

            <redwood-channel
                id="channel"
                channel="group_decisions"
                on-event="_handleGroupDecisionsEvent">
            </redwood-channel>

            <paper-progress
                value="[[ _subperiodProgress ]]">
            </paper-progress>

            <div class="layout vertical center">
                <div class="layout horizontal borders" style="height: 25%; width: 100%;">
                    <template is="dom-repeat" index-as="index" items="{{_reverse(queueList)}}" as="queueListItems">
            <div class="circle" style="background-color:{{_shadeCircle(queueListItems)}};">[[queueListItems]]</div>
                    </template>
                </div>

                <div class="layout horizontal" style="height: 75%; width: 100%;">
                    <div class="layout vertical borders" style="width: 33%;">
                        <p>Exchange Requests:</p>
                        <template is="dom-repeat" index-as="index" items="{{requests}}" as="requestsVector">
                            <div class="layout horizontal borders" >
                                <p>Player [[_array(requestsVector, 0)]]</p>
                                <p>Amount [[_array(requestsVector, 1)]]</p>
                                <button type="button">Accept</button>
                            </div>
                        </template>
                    </div>

                    <div class="layout vertical" style="width: 66%;">
                        <div class="layout vertical borders" style="height: 40%;">
                            <p>Your Decision</p>
                            <p>Player you want to exchange position: </p>
                            <input id="exchangePosition" type="number" min="{{_minSwap()}}" max="{{_maxSwap()}}">
                            <p>Your offer: </p>
                            <input id="offer" type="number" min="1" max="{{_maxOffer()}}">
                            <button type="button"> Send your request</button>
                        </div>

                        <div class="layout horizontal" style="height: 60%;">
                            <div class="layout vertical borders" style="width: 50%;">
                                <p>Your service value:</p>
                                <p>1st in the line:</p>
                                <p>2nd in the line:</p>
                                <p>3rd in the line:</p>
                                <p>4th in the line:</p>
                                <p>5th in the line:</p>
                                <p>6th in the line:</p>
                            </div>
                        

                            <div class="layout vertical borders " style="width: 50%;">
                                <p>Your current payoff: [[ payoff ]]</p>
                                <p>Round parameter: </p>
                                <p>Exchange rule: [[swapMethod]]</p>
                                <p>Messaging: [[messaging]]</p>
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
            initialDecision:{
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
            _isPeriodRunning: {
                type: Boolean,
            },
            _periodProgress: {
                type: Number,
                value: 0,
            },
            periodLength: {
                type: Number
            },
        }
    }

    _array(a, i) {
        console.log(a);
        console.log(a[i]);
        return a[i];
    }

    _reverse(list){
        return list.slice().reverse();
    }

    ready() {
        super.ready()
        console.log("Game Start");
        this.set('requests', []);
        if(3 == this.initialPosition){
            let request = [5, 20];
            this.push('requests', request);
        }
        console.log(this.requests);
        
        
    }

    _shadeCircle(id){
        if(id == this.$.constants.idInGroup)
            return '#D3D3D3';
        else
            return '#FFFFFF';
    }

    _minSwap(currentPositon){
        return currentPositon-1;
    }

    _maxSwap(currentPositon){
        return 0;
    }

    _maxOffer(){
        
    }

    _updatePeriodProgress(t) {
        const deltaT = (t - this.lastT);
        this._periodProgress = 100 * ((deltaT / 1000) / this.periodLength);
        this._animID = window.requestAnimationFrame(
        this._updatePeriodProgress.bind(this));
    }

    _onPeriodStart() {
        this._periodProgress = 0;
        this.lastT = performance.now();
        this._animID = window.requestAnimationFrame(
            this._updatePeriodProgress.bind(this));
    }
    _onPeriodEnd() {
        window.cancelAnimationFrame(this._animID);
    }
    _handleGroupDecisionsEvent(event){

    }
    _onGroupDecisionsChanged(){

    }
}

window.customElements.define('leeps-queue', LeepsQueue);