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
            <!--
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
            -->
            <redwood-channel
                id="channel"
                channel="swap"
                on-event="_handleSwapEvent">
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
                            <p>Player you want to exchange position: 
                                    <span id='exchangeText'></span>
                            </p>
                            <input id="exchangePlayer" type="number" min="1" max="6">
                            <p>Your offer: 
                                    <span id='offerText'> </span>
                            </p>
                            <input id="offer" type="number" min="1" max="[[payoff]]">
                            <template is="dom-if" if="[[ !requestSent ]]">
                                <button type="button" on-click="_handlerequest"> Send your request</button>
                            </template>
                            <template is="dom-if" if="[[ requestSent ]]">
                                <button type="button" on-click="_handlecancel"> Cancel your request</button>
                            </template>
                        </div>

                        <div class="layout horizontal" style="height: 60%;">
                            <div class="layout vertical borders" style="width: 50%;">
                                <p>Your service value:</p>
                                <p>1st in the line: [[_computeValue(6)]]</p>
                                <p>2nd in the line: [[_computeValue(5)]]</p>
                                <p>3rd in the line: [[_computeValue(4)]]</p>
                                <p>4th in the line: [[_computeValue(3)]]</p>
                                <p>5th in the line: [[_computeValue(2)]]</p>
                                <p>6th in the line: [[_computeValue(1)]]</p>
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
            currentRequestPartner:{
                type: Number,
                value: 0
            },
            messaging:{
                type: Boolean,
            },
            payoff: {
                type: Number,
            },
            endowment:{
                type: Number,
            },
            queueList: {
                type: Array,
            },
            swapMethod: {
                type: String
            },
            value:{
                type: Number
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
            timeRemaining:{
                type: Number,
                value: 0,
            }
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
        this.set('payoff', this.endowment);
        this._myDecision = {type: 'initial'};        
        
    }

    _shadeCircle(id){
        if(id == this.$.constants.idInGroup)
            return '#D3D3D3';
        else
            return '#FFFFFF';
    }

    _maxOffer(){
        return this.payoff;
    }

    _computeValue(spot){
        return spot * this.value;
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

    _timeRemainingPeriod() {
        if((this.periodLength - this.now ) > 0) {
            return this.periodLength - (this.now );
        }
        else {
            return 0;
        }
    }

    _handleSwapEvent(event){
        console.log("Swap Event");
        console.log(event.detail.payload);
        let playerDecision = event.detail.payload;
        if(playerDecision['type'] == 'request' && playerDecision['receiver'] == parseInt(this.$.constants.idInGroup)){
            let request = [playerDecision['sender'], playerDecision['offer']];
            this.push('requests', request);
            console.log(this.requests);
        }
        if(playerDecision['type'] == 'cancel' && playerDecision['receiver'] == parseInt(this.$.constants.idInGroup)){
            let newRequests = [];
            for(let i = 0; i < this.requests.length; i++){
                console.log(this.requests[i])
                if (this.requests[i][0] != playerDecision['sender']){
                    newRequests.push(this.requests[i]);
                }

            }
            this.set('requests', newRequests);
        }
        if(playerDecision['type'] == 'accept'){
            console.log(this.requests);
            let newRequests = [];
            if(playerDecision['sender'] != parseInt(this.$.constants.idInGroup) && playerDecision['receiver'] != parseInt(this.$.constants.idInGroup)){
                for(let i = 0; i < this.requests.length; i++){
                    console.log(this.requests[i])
                    if (this.requests[i][0] != playerDecision['sender']){
                        newRequests.push(this.requests[i]);
                    }

                }
            } 
            
            this.set('requests', newRequests);
            let newQueueList = [];
            for(let i = 0; i < this.queueList.length; i++){
                newQueueList[i] = this.queueList[i];
            }
            console.log(newQueueList);
            console.log(typeof playerDecision['sender']);
            let sIndex = this.queueList.indexOf(playerDecision['sender']);
            console.log(sIndex);
            let rIndex = this.queueList.indexOf(playerDecision['receiver']);
            console.log(rIndex);
            newQueueList[sIndex] = playerDecision['receiver'];
            newQueueList[rIndex] = playerDecision['sender'];
            console.log(newQueueList[sIndex]);
            console.log(newQueueList[rIndex]);
            console.log(newQueueList);
            this.set('queueList', newQueueList);
            if(playerDecision['sender'] == parseInt(this.$.constants.idInGroup) || this.currentRequestPartner == playerDecision['sender']){
                this.set("requestSent", false);
                this.set('currentRequestPartner', 0);
                this.$.exchangeText.textContent = ' ';
                this.$.offerText.textContent = ' ';
            }
            if( playerDecision['receiver'] == parseInt(this.$.constants.idInGroup) ){
                this.set("requestSent", false);
                this.set('currentRequestPartner', 0);
                let newPayoff = this.payoff - playerDecision['offer'];
                this.set("payoff", newPayoff);
            }
            
            alert("A swap has occured");
        }
    }
    
    _handlerequest(){
        console.log("request");
        
        console.log(this.$.exchangePlayer.value);
        console.log(this.$.offer.value);
        let exchangePlayer = parseInt(this.$.exchangePlayer.value);
        let offer = parseInt(this.$.offer.value);
        if(this.queueList.indexOf(exchangePlayer) > this.myPosition){
            alert("This Player is behind you!")
            return;
        }
        if(exchangePlayer == parseInt(this.$.constants.idInGroup)){
            alert("This Player is you!")
            return;
        }
        this.$.exchangeText.textContent = this.$.exchangePlayer.value;
        this.$.offerText.textContent = this.$.offer.value;
        this.set("requestSent", true);
        this.set('currentRequestPartner', exchangePlayer);
        let newRequest = {
            'type': 'request',
            'sender': parseInt(this.$.constants.idInGroup),
            'receiver': exchangePlayer,
            'offer': offer,
        };

        this.set("_myDecision", newRequest);
        this._myDecision = newRequest;
        console.log(this._myDecision);
        this.$.channel.send(newRequest);
    }
    _handlecancel(){
        console.log("cancel");
        this.set("requestSent", false);
        this.$.exchangeText.textContent = ' ';
        this.$.offerText.textContent = ' ';
        let exchangePlayer = parseInt(this.$.exchangePlayer.value);
        let newRequest = {
            'type': 'cancel',
            'sender': parseInt(this.$.constants.idInGroup),
            'receiver': exchangePlayer,
        };
        this.set("_myDecision", newRequest);
        this._myDecision = newRequest;
        this.$.channel.send(newRequest);
    }
    _handleaccept(e) {
        console.log("accept");
        var requestsVector = e.model.requestsVector;
        let offer = parseInt(requestsVector[1]);
        let newRequest = {
            'type': 'accept',
            'sender': parseInt(this.$.constants.idInGroup),
            'receiver': parseInt(requestsVector[0]),
            'offer': offer,
        };
        this.set("requestSent", false);
        this.$.exchangeText.textContent = ' ';
        this.$.offerText.textContent = ' ';
        this.set("_myDecision", newRequest);
        console.log(offer);
        let newPayoff = this.payoff + offer;
        this.set("payoff", newPayoff);
        this._myDecision = newRequest;
        console.log(this.requests);
        this.$.channel.send(newRequest);
    }
}

window.customElements.define('leeps-queue', LeepsQueue);