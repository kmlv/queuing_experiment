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

                paper-progress {
                    margin-bottom: 0.625em;
                    --paper-progress-height: 1.875em;
                }
            </style>
            <otree-constants id="constants"></otree-constants>
            <redwood-period
                running="{{ _isPeriodRunning }}"
                on-period-start="_onPeriodStart"
                on-period-end="_onPeriodEnd">
            </redwood-period>

            <redwood-decision
                id="channelDecision"
                initial-decision="[[ initialDecision ]]"
                my-decision="{{ _myDecision }}"
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
                                <button type="button" on-click="_handleaccept">Accept</button>
                            </div>
                        </template>
                    </div>

                    <div class="layout vertical" style="width: 66%;">
                        <div class="layout vertical borders" style="height: 40%;">
                            <p>Your Decision</p>
                            <p>Player you want to exchange position: </p>
                            <input id="exchangePlayer" type="number" min="1" max="6">
                            <p>Your offer: </p>
                            <input id="offer" type="number" min="1" max="{{_maxOffer()}}">
                            <template is="dom-if" if="[[ !requestSent ]]">
                                <button type="button" on-click="_handlerequest"> Send your request</button>
                            </template>
                            <template is="dom-if" if="[[ requestSent ]]">
                                <button type="button" on-tap="_handlecancel"> Cancel your request</button>
                            </template>
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
            _myDecision: {
                type: Number,
            },
            initialDecision:{
                type: Number,
            },
            initialPosition:{
                type: Number,
            },
            myPosition:{
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
            requestSent: {
                type: Boolean,
                value: false
            },
            _isPeriodRunning: {
                type: Boolean,
            },
            _subperiodProgress: {
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
        this.set('myPosition', this.initialPosition);
        this._myDecision = {type: 'initial'};        
        
    }

    _shadeCircle(id){
        if(id == this.$.constants.idInGroup)
            return '#D3D3D3';
        else
            return '#FFFFFF';
    }

    _maxOffer(){
        
    }

    _updateSubperiodProgress(t) {
        const deltaT = (t - this.lastT);
        const secondsPerSubperiod = this.periodLength / this.numSubperiods;
        this._subperiodProgress = 100 * ((deltaT / 1000) / secondsPerSubperiod);
        this._animID = window.requestAnimationFrame(
        this._updateSubperiodProgress.bind(this));
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
    _handleGroupDecisionsEvent(event){
        console.log("Group Decision Event");
        console.log(event);
    }
    _onGroupDecisionsChanged(){
        console.log("Group Decisions Changed");
        let playerDecision, request;
        for(const player of this.$.constants.group.players){
            if (player.idInGroup != this.$.constants.idInGroup){
                playerDecision = this.groupDecisions[player.participantCode];
                if(playerDecision['type'] == 'request' && playerDecision['receiver'] == this.$.constants.idInGroup){
                    for(request in this.requests){
                        if (request[0] == playerDecision['sender']){
                            return;
                        }
                    }
                    let request = [playerDecision['sender'], playerDecision['offer']];
                    this.push('requests', request);
                    console.log(this.requests);
                }
                if(playerDecision['type'] == 'cancel' && playerDecision['receiver'] == this.$.constants.idInGroup){
                    let requestVector = null;
                    let index = 0;
                    for(request in this.requests){
                        if (request[0] == playerDecision['sender']){
                            requestVector = request;
                            break;
                        }
                        index += 1;
                    }
                    if (requestVector != null)
                        this.splice('requests', index, 1);
                }
                if(playerDecision['type'] == 'accept'){
                    let requestVector = null;
                    let index = 0;
                    for(request in this.requests){
                        if (request[0] == playerDecision['sender']){
                            requestVector = request;
                            break;
                        }
                        index += 1;
                    }
                    if (requestVector != null)
                        this.splice('requests', index, 1);
                    let newQueueList = [];
                    for(let i = 0; i < this.queueList.length; i++){
                        newQueueList[i] = this.queueList[i];
                    }
                    let sIndex = this.queueList.indexOf(playerDecision['sender']);
                    let rIndex = this.queueList.indexOf(playerDecision['receiver']);
                    newQueueList[sIndex] = this.queueList[rIndex];
                    newQueueList[rIndex] = this.queueList[sIndex];
                    this.set('queueList', newQueueList);
                    if(playerDecision['receiver'] == this.$.constants.idInGroup){
                        this.set("requestSent", false);
                    }
                }
            }
        }
    }
    _handlerequest(){
        console.log("request");
        
        console.log(this.$.exchangePlayer.value);
        console.log(this.$.offer.value);
        let exchangePlayer = this.$.exchangePlayer.value;
        let offer = this.$.offer.value;
        if(this.queueList.indexOf(exchangePlayer) > this.myPosition){
            alert("This Player is behind you!")
            return;
        }
        if(exchangePlayer == this.$.constants.idInGroup){
            alert("This Player is you!")
            return;
        }
        this.set("requestSent", true);
        let newRequest = {
            'type': 'request',
            'sender': this.$.constants.idInGroup,
            'receiver': exchangePlayer,
            'offer': offer,
        };

        this.set("_myDecision", newRequest);
        this._myDecision = newRequest;
        console.log(this._myDecision);
        //this.$.channel.send(newRequest)
    }
    _handlecancel(){
        console.log("cancel");
        this.set("requestSent", false);
        let newRequest = {
            'type': 'cancel',
            'sender': this.$.constants.idInGroup,
            'receiver': exchangePlayer,
        };
        this.set("_myDecision", newRequest);
        this._myDecision = newRequest;
    }
    _handleaccept(e) {
        console.log("accept");
        var requestsVector = e.model.requestsVector;
        console.log(requestsVector);

        let newRequest = {
            'type': 'accept',
            'sender': this.$.constants.idInGroup,
            'receiver': requestsVector[0],
        };
        this.set("_myDecision", newRequest);
        this._myDecision = newRequest;
    }
}

window.customElements.define('leeps-queue', LeepsQueue);